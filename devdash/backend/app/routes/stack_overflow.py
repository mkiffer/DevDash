from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Environment variables
STACK_EXCHANGE_API_KEY = os.getenv("STACK_EXCHANGE_API_KEY")
STACK_EXCHANGE_BASE_URL = "https://api.stackexchange.com/2.3"

class SearchResponse(BaseModel):
    items: List[dict]
    has_more: bool
    quota_max: int
    quota_remaining: int

async def make_stack_exchange_request(endpoint: str, params: dict) -> dict:
    """
    Helper function to make requests to Stack Exchange API
    """
    async with httpx.AsyncClient() as client:
        try:
            if 'intitle' in params and params['intitle'].startswith('[score:'):
                query = params.pop('intitle')
                score_value = query[7:-1]  # Extract number from [score:50]
                params['min_score'] = int(score_value)

            params = {
                **params,
                "site": "stackoverflow",
                "key": STACK_EXCHANGE_API_KEY,
                "filter": "withbody"  # Include bodies in response
            }

            logger.debug(f"Making request to {endpoint} with params: {params}")
            
            
            response = await client.get(
                f"{STACK_EXCHANGE_BASE_URL}/{endpoint}",
                params=params,
                timeout=10.0  # Add timeout
            )
            
            response.raise_for_status()
            data = response.json()
            
            logger.debug(f"Received {len(data.get('items', []))} results")
            return data
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Stack Exchange API error: {e.response.text}"
            )
        except httpx.RequestError as e:
            logger.error(f"Stack Exchange API error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"Error connecting to Stack Exchange API: {str(e)}"
            )
        except Exception as e:
            print(f"UNEXPECTED STACK OVERFLOW ERROR: {str(e)}")
            print(f"TYPE OF ERROR: {type(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error: {str(e)}"
            )

@router.get("/search", response_model=SearchResponse)
async def search_stackoverflow(
    query: str,
    page: int = 1,
    pagesize: int = 10,
    sort: str = "votes",  # Changed default to votes
    tags: Optional[str] = None
):
    """
    Search Stack Overflow for questions matching the query.
    
    Parameters:
    - query: Search query string. Special formats:
        - [score:X] to find posts with score >= X
        - Regular text to search in titles
    - page: Page number for pagination
    - pagesize: Number of results per page
    - sort: Sort order (votes, creation, activity)
    - tags: Comma-separated list of tags to filter by
    """
    params = {
        "q": query,
        "page": page,
        "pagesize": pagesize,
        "sort": sort,
        "order": "desc"
    }
    
    if tags:
        params["tagged"] = tags
        
    return await make_stack_exchange_request("search/advanced", params)

@router.get("/questions/{question_id}/answers", response_model=SearchResponse)
async def get_question_answers(
    question_id: int,
    page: int = 1,
    pagesize: int = 30,
    sort: str = "votes"
):
    """
    Fetch answers for a specific question from Stack Overflow.
    
    Parameters:
    - question_id: ID of the question
    - page: Page number for pagination
    - pagesize: Number of answers per page
    - sort: Sort order (votes, creation, activity)
    """
    params = {
        "page": page,
        "pagesize": pagesize,
        "sort": sort,
        "order": "desc"
    }
    
    return await make_stack_exchange_request(f"questions/{question_id}/answers", params)

@router.get("/questions/{question_id}", response_model=SearchResponse)
async def get_question_details(
    question_id: int
):
    """
    Fetch detailed information about a specific question.
    
    Parameters:
    - question_id: ID of the question to fetch
    """
    params = {
        "filter": "withbody"  # Include question body in response
    }
    
    return await make_stack_exchange_request(f"questions/{question_id}", params)