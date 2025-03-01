# app/routes/hackerrank.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import random
import json
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Environment variables for configuration
HACKERRANK_API_KEY = os.getenv("HACKERRANK_API_KEY", "")
HACKERRANK_API_URL = os.getenv("HACKERRANK_API_URL", "https://www.hackerrank.com/api/v3")
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

# Pydantic models for API requests and responses
class TestCase(BaseModel):
    input: str
    output: str

class HackerRankChallenge(BaseModel):
    id: str
    slug: str
    name: str
    preview: str
    body: str
    difficulty: str
    category: str
    max_score: int
    languages: List[str]
    testcases: Optional[List[TestCase]] = None

class SubmissionRequest(BaseModel):
    challenge_slug: str
    code: str
    language: str

class TestResult(BaseModel):
    status: str
    stdout: str
    stderr: str
    expected_output: str
    actual_output: str

class SubmissionResponse(BaseModel):
    id: str
    status: str
    score: int
    results: List[TestResult]

class APIResponse(BaseModel):
    data: Dict
    status: int
    message: Optional[str] = None

# Mock data for development without HackerRank API
MOCK_CHALLENGES = [
    {
        "id": "1",
        "slug": "two-sum",
        "name": "Two Sum",
        "preview": "Find two numbers in an array that add up to a target value.",
        "body": "## Two Sum\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "difficulty": "Easy",
        "category": "Arrays",
        "max_score": 100,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "[2,7,11,15], 9",
                "output": "[0,1]"
            },
            {
                "input": "[3,2,4], 6",
                "output": "[1,2]"
            }
        ]
    },
    {
        "id": "2",
        "slug": "valid-parentheses",
        "name": "Valid Parentheses",
        "preview": "Determine if a string of parentheses is valid.",
        "body": "## Valid Parentheses\n\nGiven a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
        "difficulty": "Easy",
        "category": "Stacks",
        "max_score": 100,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "()",
                "output": "true"
            },
            {
                "input": "()[]{}",
                "output": "true"
            },
            {
                "input": "(]",
                "output": "false"
            }
        ]
    },
    {
        "id": "3",
        "slug": "reverse-linked-list",
        "name": "Reverse Linked List",
        "preview": "Reverse a singly linked list.",
        "body": "## Reverse Linked List\n\nReverse a singly linked list.\n\nExample:\n```\nInput: 1->2->3->4->5->NULL\nOutput: 5->4->3->2->1->NULL\n```\n\nFollow up: A linked list can be reversed either iteratively or recursively. Could you implement both?",
        "difficulty": "Easy",
        "category": "Linked Lists",
        "max_score": 100,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "[1,2,3,4,5]",
                "output": "[5,4,3,2,1]"
            },
            {
                "input": "[1,2]",
                "output": "[2,1]"
            }
        ]
    },
    {
        "id": "4",
        "slug": "merge-intervals",
        "name": "Merge Intervals",
        "preview": "Merge overlapping intervals.",
        "body": "## Merge Intervals\n\nGiven an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "difficulty": "Medium",
        "category": "Arrays",
        "max_score": 150,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "[[1,3],[2,6],[8,10],[15,18]]",
                "output": "[[1,6],[8,10],[15,18]]"
            },
            {
                "input": "[[1,4],[4,5]]",
                "output": "[[1,5]]"
            }
        ]
    },
    {
        "id": "5",
        "slug": "lru-cache",
        "name": "LRU Cache",
        "preview": "Implement a Least Recently Used (LRU) cache.",
        "body": "## LRU Cache\n\nDesign a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return the value of the key if the key exists, otherwise return -1.\n- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
        "difficulty": "Medium",
        "category": "Design",
        "max_score": 150,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "LRUCache capacity=2; put(1,1); put(2,2); get(1); put(3,3); get(2); put(4,4); get(1); get(3); get(4);",
                "output": "[1,-1,3,4]"
            }
        ]
    },
    {
        "id": "6",
        "slug": "trapping-rain-water",
        "name": "Trapping Rain Water",
        "preview": "Calculate how much water can be trapped after raining.",
        "body": "## Trapping Rain Water\n\nGiven `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "difficulty": "Hard",
        "category": "Arrays",
        "max_score": 200,
        "languages": ["javascript", "python", "java"],
        "testcases": [
            {
                "input": "[0,1,0,2,1,0,1,3,2,1,2,1]",
                "output": "6"
            },
            {
                "input": "[4,2,0,3,2,5]",
                "output": "9"
            }
        ]
    }
]

# Mock submission result
def create_mock_submission_result(challenge_slug: str, language: str, code: str) -> SubmissionResponse:
    """Creates a mock submission result with realistic test outcomes"""
    # Probability of success increases with code length (simplistic)
    success_probability = min(0.8, len(code) / 1000)
    success = random.random() < success_probability
    
    # Find the challenge to get test cases
    challenge = next((c for c in MOCK_CHALLENGES if c["slug"] == challenge_slug), None)
    if not challenge:
        # Default test cases if challenge not found
        test_cases = [
            {"input": "sample input", "output": "sample output"}
        ]
    else:
        test_cases = challenge.get("testcases", [])
    
    # Create test results
    results = []
    for i, test_case in enumerate(test_cases):
        # More realistic: earlier test cases more likely to pass
        test_success = random.random() < (success_probability + (0.2 if i == 0 else 0))
        
        # Generate realistic outputs
        if test_success:
            stdout = f"Test case {i+1} passed!\n"
            stderr = ""
            actual_output = test_case["output"]
        else:
            stdout = f"Test case {i+1} running...\n"
            stderr = f"Error: Expected {test_case['output']} but got different result"
            # Generate slightly wrong output for more realism
            actual_output = test_case["output"] + " " if success_probability > 0.5 else "null"
        
        results.append(TestResult(
            status="Accepted" if test_success else "Wrong Answer",
            stdout=stdout,
            stderr=stderr,
            expected_output=test_case["output"],
            actual_output=actual_output
        ))
    
    # Overall submission status
    status = "Accepted" if all(r.status == "Accepted" for r in results) else "Wrong Answer"
    score = challenge.get("max_score", 100) if status == "Accepted" else 0
    
    return SubmissionResponse(
        id=f"mock-submission-{random.randint(1000, 9999)}",
        status=status,
        score=score,
        results=results
    )

# Helper function for making authenticated requests to HackerRank API
async def hackerrank_api_request(endpoint: str, method: str = "GET", data: Dict = None) -> Dict:
    """Makes a request to the HackerRank API with proper authentication"""
    url = f"{HACKERRANK_API_URL}{endpoint}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {HACKERRANK_API_KEY}"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(url, headers=headers, timeout=10.0)
            elif method == "POST":
                response = await client.post(url, headers=headers, json=data, timeout=10.0)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error: {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error in HackerRank API request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/challenges", response_model=APIResponse)
async def get_challenges(page: int = 1, limit: int = 10, difficulty: Optional[str] = None):
    """Get a list of coding challenges, optionally filtered by difficulty"""
    try:
        if USE_MOCK_DATA:
            logger.info("Using mock data for challenges")
            filtered_challenges = MOCK_CHALLENGES
            
            if difficulty:
                filtered_challenges = [
                    c for c in filtered_challenges 
                    if c["difficulty"].lower() == difficulty.lower()
                ]
            
            # Pagination
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_challenges = filtered_challenges[start_idx:end_idx]
            
            return APIResponse(
                data={"problems": paginated_challenges},
                status=200
            )
        else:
            # Build query parameters
            params = f"?page={page}&limit={limit}"
            if difficulty:
                params += f"&difficulty={difficulty}"
            
            # Make API request
            data = await hackerrank_api_request(f"/challenges{params}")
            
            return APIResponse(
                data={"problems": data["data"]},
                status=200
            )
    except Exception as e:
        logger.error(f"Error fetching challenges: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/challenges/random", response_model=APIResponse)
async def get_random_challenge(difficulty: Optional[str] = None):
    """Get a random challenge, optionally filtered by difficulty"""
    try:
        if USE_MOCK_DATA:
            logger.info("Using mock data for random challenge")
            filtered_challenges = MOCK_CHALLENGES
            
            if difficulty:
                filtered_challenges = [
                    c for c in filtered_challenges 
                    if c["difficulty"].lower() == difficulty.lower()
                ]
            
            if not filtered_challenges:
                raise HTTPException(status_code=404, detail="No challenges found matching criteria")
            
            random_challenge = random.choice(filtered_challenges)
            
            return APIResponse(
                data={"problem": random_challenge},
                status=200
            )
        else:
            # First get a list of challenges
            params = "?limit=20"
            if difficulty:
                params += f"&difficulty={difficulty}"
            
            challenges_data = await hackerrank_api_request(f"/challenges{params}")
            challenges = challenges_data.get("data", [])
            
            if not challenges:
                raise HTTPException(status_code=404, detail="No challenges found matching criteria")
            
            # Select a random challenge
            random_challenge_id = random.choice(challenges)["id"]
            
            # Get full details for the selected challenge
            challenge_data = await hackerrank_api_request(f"/challenges/{random_challenge_id}")
            
            return APIResponse(
                data={"problem": challenge_data["data"]},
                status=200
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching random challenge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/challenges/{slug}", response_model=APIResponse)
async def get_challenge(slug: str):
    """Get details for a specific challenge by slug"""
    try:
        if USE_MOCK_DATA:
            logger.info(f"Using mock data for challenge slug: {slug}")
            challenge = next((c for c in MOCK_CHALLENGES if c["slug"] == slug), None)
            
            if not challenge:
                raise HTTPException(status_code=404, detail="Challenge not found")
            
            return APIResponse(
                data={"problem": challenge},
                status=200
            )
        else:
            challenge_data = await hackerrank_api_request(f"/challenges/{slug}")
            
            return APIResponse(
                data={"problem": challenge_data["data"]},
                status=200
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching challenge {slug}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/challenges/submit", response_model=APIResponse)
async def submit_solution(submission: SubmissionRequest):
    """Submit a solution for a challenge"""
    try:
        if USE_MOCK_DATA:
            logger.info(f"Using mock data for submission: {submission.challenge_slug}")
            # Wait a bit to simulate processing
            await asyncio.sleep(1)
            
            # Create mock submission result
            result = create_mock_submission_result(
                submission.challenge_slug,
                submission.language,
                submission.code
            )
            
            return APIResponse(
                data={"id": result.id},
                status=200
            )
        else:
            # Submit to HackerRank API
            submission_data = await hackerrank_api_request(
                f"/challenges/{submission.challenge_slug}/submissions",
                method="POST",
                data={
                    "language": submission.language,
                    "code": submission.code
                }
            )
            
            return APIResponse(
                data={"id": submission_data["data"]["id"]},
                status=200
            )
    except Exception as e:
        logger.error(f"Error submitting solution: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/submissions/{submission_id}", response_model=APIResponse)
async def get_submission_result(submission_id: str):
    """Get the result of a submission"""
    try:
        if USE_MOCK_DATA:
            logger.info(f"Using mock data for submission result: {submission_id}")
            # Extract info from submission ID (format: mock-submission-{random}-{slug}-{language})
            parts = submission_id.split("-")
            
            if len(parts) >= 4:
                challenge_slug = parts[2]
                language = parts[3]
            else:
                # Default values if we can't parse
                challenge_slug = "two-sum"
                language = "javascript"
            
            # Generate a consistent result for the same submission ID
            random.seed(submission_id)
            challenge = next((c for c in MOCK_CHALLENGES if c["slug"] == challenge_slug), MOCK_CHALLENGES[0])
            
            # Mock whether it succeeded or failed
            success = random.random() < 0.7
            
            # Create test results
            results = []
            for i, test_case in enumerate(challenge.get("testcases", [])):
                test_success = success or (i == 0 and random.random() < 0.8)
                
                results.append({
                    "status": "Accepted" if test_success else "Wrong Answer",
                    "stdout": f"Test case {i+1} executed\n",
                    "stderr": "" if test_success else "Error in test case execution",
                    "expected_output": test_case["output"],
                    "actual_output": test_case["output"] if test_success else "incorrect output"
                })
            
            submission_result = {
                "id": submission_id,
                "status": "Accepted" if success else "Wrong Answer",
                "score": challenge.get("max_score", 100) if success else 0,
                "results": results
            }
            
            # Reset random seed
            random.seed()
            
            return APIResponse(
                data={"message": submission_result},
                status=200
            )
        else:
            result_data = await hackerrank_api_request(f"/submissions/{submission_id}")
            
            return APIResponse(
                data={"message": result_data["data"]},
                status=200
            )
    except Exception as e:
        logger.error(f"Error fetching submission result: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Missing import at the top - add this
import asyncio