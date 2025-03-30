# app/routes/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

# In-memory storage for active sessions
chat_sessions: Dict[str, List[dict]] = {}

class ChatMessage(BaseModel):
    id: int
    role: str
    content: str
    timestamp: Optional[datetime] = None

class MessageRequest(BaseModel):
    message: str

class APIResponse(BaseModel):
    data: dict
    status: int
    message: Optional[str] = None

class Conversation(BaseModel):
    id : int
    description : str
    data : list[ChatMessage]

class ConversationHistory(BaseModel):
    id : int
    data : list[Conversation]



@router.post("/", response_model=APIResponse)
async def send_message(message_request: MessageRequest):
    try:
        # Use a default session ID for now - this will be replaced with user sessions later
        session_id = "default"
        
        # Initialize session if it doesn't exist
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []

        # Get current session history
        history = chat_sessions[session_id]

        # Create user message
        message_id = len(history) + 1
        user_message = {
            "id": message_id,
            "role": "user",
            "content": message_request.message,
            "timestamp": datetime.now()
        }
        
        # Add user message to history
        chat_sessions[session_id].append(user_message)

        # Get AI response
        ai_response = await ai_service.get_response(
            message_request.message,
            history
        )

        # Create AI message
        ai_message = {
            "id": message_id + 1,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now()
        }
        
        # Add AI message to history
        chat_sessions[session_id].append(ai_message)
        
        return APIResponse(
            data={"message": ai_message},
            status=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

@router.get("/history", response_model=APIResponse)
async def get_chat_history():
    try:
        # Use default session for now
        session_id = "default"
        history = chat_sessions.get(session_id, [])
        
        return APIResponse(
            data={"messages": history},
            status=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Optional: Clear session endpoint
@router.post("/clear", response_model=APIResponse)
async def clear_chat_history():
    try:
        session_id = "default"
        chat_sessions[session_id] = []
        
        return APIResponse(
            data={"message": "Chat history cleared"},
            status=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )