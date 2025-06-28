from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import json
from httpx import AsyncClient, RequestError, HTTPStatusError
import os
import asyncio

from app.database.session import get_db
from app.models.codingproblem import CodingProblem
from app.core.config import settings

router = APIRouter()

#judge 0 api config
JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY = settings.JUDGE0_API_KEY




@router.get("/problems", response_model=Dict[str,List[dict]])
async def get_problems(
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    '''get all coding problems, optionally filtered by difficulty'''
    query = db.query(CodingProblem)

    if difficulty and difficulty != "any":
        query = query.filter(CodingProblem.difficulty == difficulty)

    problems = query.all()
    #list comprehension in return statement
    return {"data":[
        {
           "id": problem.id,
            "title": problem.title,
            "slug": problem.slug,
            "difficulty": problem.difficulty,
            "description": problem.description,
            "example_cases": problem.example_cases 
        } for problem in problems
    ]
    }

@router.get("/problems/{slug}", response_model=dict)
async def get_problem(slug: str, db: Session = Depends(get_db)):
    '''get a problem by slug'''
    problem = db.query(CodingProblem).filter(CodingProblem.slug==slug).first()

    if not problem:
        raise HTTPException(status_code=404, detail = "problem not found")
    
    return{
        "id": problem.id,
        "title": problem.title,
        "slug": problem.slug,
        "difficulty": problem.difficulty,
        "description": problem.description,
        "example_cases": problem.example_cases,
        "starter_code": problem.starter_code,
        "example_input": problem.example_input
    }

@router.post("/problems/{slug}/submit", response_model=dict)
async def submit_solution(
    slug:str, submission: dict, db:Session = Depends(get_db)
):
    
    '''submit solution for evaluation'''
    #1. get the problem
    problem = db.query(CodingProblem).filter(CodingProblem.slug==slug).first()

    if not problem:
        raise HTTPException(status_code=404, detail = "problem not found")
    
    #2. prepare for submission
    language = submission.get("language")
    user_code = submission.get("code")

    user_code = sanititize_user_code(user_code)
    #map languages to Judge0 language ids
    language_ids = {
        "python": 71,        # Python 3
        "javascript": 63,    # JavaScript (Node.js)
        "java": 62,          # Java
        "cpp": 54,           # C++
        "csharp": 51         # C#
    }

    if language not in language_ids:
        raise HTTPException(status_code=400, detail="Unsupported language")

    # 3. Prepare the test runner code
    # This will wrap the user's code in test harness code
    # Simple example for Python (you'd need different wrappers for each language)

    test_runner = get_test_runner(language, problem, user_code)

    #send to judge0
    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY, # Make sure this is loaded securely
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    }
    payload = {
        "language_id": language_ids[language],
        "source_code": test_runner
    }

    try:
        async with AsyncClient(timeout=10.0) as client:
            # 3. Keep your original asynchronous submission creation
            response = await client.post(
                f"{JUDGE0_API_URL}/submissions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            token = response.json().get("token")

            if not token:
                raise HTTPException(status_code=500, detail="Failed to get submission token from Judge0")

            # 4. Keep your original polling loop
            attempts = 0
            while attempts < 10:
                await asyncio.sleep(2) # Increased sleep time slightly
                attempts += 1
                status_response = await client.get(
                    f"{JUDGE0_API_URL}/submissions/{token}",
                    headers=headers
                )
                status_response.raise_for_status()
                result = status_response.json()
                if result.get("status", {}).get("id", 0) > 2: # If not in queue or processing
                    break
            
            # 5. Add enhanced result and error handling
            status_id = result.get("status", {}).get("id")
            if status_id == 6: # Compilation Error
                return {"status": "Error", "message": "Compilation Error", "details": result.get("compile_output")}
            if status_id > 6: # Other errors (Runtime, TLE, etc.)
                return {"status": "Error", "message": result.get("status", {}).get("description"), "details": result.get("stderr")}

            stdout = result.get("stdout","")
            if not stdout:
                # Handle cases where stdout is empty but there's no explicit error
                return {"status": "Error", "message": "Execution resulted in no output.", "details": result.get("stderr")}

            try:
                test_results = json.loads(stdout)
                all_passed = all(t["passed"] for t in test_results)
                score = sum(t["passed"] for t in test_results) * (100 / len(test_results))
                return {
                    "status": "Accepted" if all_passed else "Failed",
                    "results": test_results,
                    "score": score
                }
            except json.JSONDecodeError:
                return {"status": "Error", "message": "Failed to parse test results from output.", "details": stdout}

    except HTTPStatusError as e:
        # Handle errors from the Judge0 API itself
        raise HTTPException(status_code=e.response.status_code, detail=f"Judge0 API error: {e.response.text}")
    except RequestError as e:
        # Handle network-level errors
        raise HTTPException(status_code=503, detail=f"Could not connect to Judge0: {e}")
    except Exception as e:
        # Catch any other unexpected exceptions
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    
def sanititize_user_code(code: str)->str:
    '''Escapes triple-quotes to prevent breaking out of f-string'''
    return code.replace('"""', '\"\"\"').replace("'''", "\'\'\'")

def get_test_runner(language: str, problem: CodingProblem, user_code: str)-> str:
    if language == "python":
        test_cases = json.dumps(problem.test_cases).replace('true', 'True').replace('false', 'False')
        test_runner = f"""
# User submitted code
{user_code}

# Test runner
import json

test_cases = {test_cases}
results = []

for i, test in enumerate(test_cases):
    try:
        input_data = test["input"]
        expected = test["output"]
        
            
        # Call the user's function with the input
        actual = {str(problem.title).lower().replace(" ", '_')}(**input_data)
         
        # Check if actual matches expected
        passed = actual == expected
            
        results.append({{
            "test_case": i + 1,
            "passed": passed,
            "input": input_data,
            "expected": expected,
            "actual": actual
        }})
    except Exception as e:
        results.append({{
            "test_case": i + 1,
            "passed": False,
            "input": input_data,
            "error": str(e)
        }})

# Print results as JSON for parsing
print(json.dumps(results))
"""
    return test_runner
