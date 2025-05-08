from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import json
from httpx import AsyncClient
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
    
    else:
        #add similar test runners for other languages
        pass

    #send to judge0
    headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    }
    payload = {
        "language_id": language_ids[language],
        "source_code": test_runner,
        "stdin": "",
        "expected_output": ""
    }

    print(f"payload: {payload}")

    try:
        #create submission
        async with AsyncClient() as client:
            response = await client.post(
                f"{JUDGE0_API_URL}/submissions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()

            token = response.json().get("token")

            #poll for results
            max_attempts = 10
            attempts = 0

            while attempts < max_attempts:
                await asyncio.sleep(1) #wait between polling
                attempts += 1

                status_response = await client.get(
                    f"{JUDGE0_API_URL}/submissions/{token}",
                    headers = headers
                )

                if status_response.status_code == 200:
                    result = status_response.json()

                    if result.get("status", {}).get("id") not in [1,2]: #not queued or processing
                        break
                
            #parse results
            if status_response.status_code != 200:
                raise HTTPException(status_code=500, detail = "Judge0 API error")

            result = status_response.json()
            print(f"result: {result}")
            #check for compiler errors
            if result.get("status", {}).get("id") in [6,11,12,13]:
                print(f'status: {result.get("status", {}).get("id")}')
                return{
                    "status": "Error",
                    "compile_output": result.get("compile_output"),
                    "message" : "Compilation error"
                }
            
            #extract test results from stdout
            stdout = result.get("stdout","")

            try: 
                test_results = json.loads(stdout)

                #calculate overall success
                all_passed = all(test["passed"] for test in test_results)

                return {
                    "status": "Accepted" if all_passed else "Failed",
                    "results": test_results,
                    "score": 100 if all_passed else sum(t["passed"] for t in test_results)*(100/len(test_results))
                }
            except json.JSONDecodeError:
                #if json cannot be parsed, return raw
                return{
                    "status": "Error",
                    "message": "Failed to parse test results",
                    "stdout": stdout,
                    "stderr": result.get("stderr", "")
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing submission: {str(e)}")
    
    