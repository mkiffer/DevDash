# app/routes/chat.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session as DbSession
from app.services.ai_service import AIService
from app.models.chat import ChatSession, ChatMessage
from app.database.session import get_db

router = APIRouter()
ai_service = AIService()

class ChatMessageModel(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    timestamp: Optional[datetime] = None

class SessionMessageModel(BaseModel):
    session_id: str
    message: str

class APIResponse(BaseModel):
    data: dict
    status: int
    message: Optional[str] = None

class Conversation(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageModel] = []

class ConversationListItem(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    preview: str  # First few characters of the first message

# Create a new session
@router.post("/sessions", response_model=APIResponse)
async def create_session(db: DbSession = Depends(get_db)):
    try:
        # Generate a unique ID for the session
        session_id = str(uuid.uuid4())
        
        # Create a new chat session in the database
        new_session = ChatSession(id=session_id)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return APIResponse(
            data={"session_id": session_id},
            status=200,
            message="New chat session created"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

# List all sessions
@router.get("/sessions", response_model=APIResponse)
async def list_sessions(db: DbSession = Depends(get_db)):
    try:
        sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
        
        # Create a preview for each session
        session_list = []
        for session in sessions:
            # Get the first message for preview
            first_message = db.query(ChatMessage).filter(
                ChatMessage.session_id == session.id
            ).order_by(ChatMessage.timestamp.asc()).first()
            
            preview = first_message.content[:50] + "..." if first_message else "Empty conversation"
            
            session_list.append({
                "id": session.id,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "preview": preview
            })
        
        return APIResponse(
            data={"sessions": session_list},
            status=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Get a specific session
@router.get("/sessions/{session_id}", response_model=APIResponse)
async def get_session(session_id: str, db: DbSession = Depends(get_db)):
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            return APIResponse(
                data={},
                status=404,
                message=f"Session with ID {session_id} not found"
            )
        
        # Get all messages for this session
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        # Format messages
        formatted_messages = [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp
            } for msg in messages
        ]
        
        return APIResponse(
            data={
                "session": {
                    "id": session.id,
                    "created_at": session.created_at,
                    "updated_at": session.updated_at,
                    "messages": formatted_messages
                }
            },
            status=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# Send a message to a specific session
@router.post("/sessions/{session_id}/messages", response_model=APIResponse)
async def send_message_to_session(
    session_id: str, 
    message_request: SessionMessageModel, 
    db: DbSession = Depends(get_db)
):
    try:
        # Check if session exists, create it if it doesn't
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            # Create the session if it doesn't exist
            session = ChatSession(id=session_id)
            db.add(session)
            db.commit()
            db.refresh(session)
        
        # Get existing messages for context
        existing_messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        # Format messages for AI service
        message_history = [
            {"role": msg.role, "content": msg.content} for msg in existing_messages
        ]
        
        # Add user message to DB
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=message_request.message
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # Get AI response
        ai_response = await ai_service.get_response(
            message_request.message,
            message_history
        )
        
        # Add AI response to DB
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=ai_response
        )
        db.add(assistant_message)
        
        # Update session timestamp
        session.updated_at = datetime.utcnow()
        db.add(session)
        db.commit()
        db.refresh(assistant_message)
        
        return APIResponse(
            data={
                "message": {
                    "id": assistant_message.id,
                    "role": "assistant",
                    "content": ai_response,
                    "timestamp": assistant_message.timestamp
                }
            },
            status=200
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

# Delete a session
@router.delete("/sessions/{session_id}", response_model=APIResponse)
async def delete_session(session_id: str, db: DbSession = Depends(get_db)):
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            return APIResponse(
                data={},
                status=404,
                message=f"Session with ID {session_id} not found"
            )
        
        db.delete(session)
        db.commit()
        
        return APIResponse(
            data={},
            status=200,
            message=f"Session {session_id} deleted successfully"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# For backward compatibility - default session
@router.post("/", response_model=APIResponse)
async def send_message(message_request: SessionMessageModel, db: DbSession = Depends(get_db)):
    try:
        # Use default session for backward compatibility
        default_session = db.query(ChatSession).filter(ChatSession.id == "default").first()
        
        if not default_session:
            # Create default session if it doesn't exist
            default_session = ChatSession(id="default")
            db.add(default_session)
            db.commit()
            db.refresh(default_session)
        
        # Reuse the session-specific endpoint
        return await send_message_to_session(
            "default", 
            message_request, 
            db
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

# For backward compatibility - get history
@router.get("/history", response_model=APIResponse)
async def get_chat_history(db: DbSession = Depends(get_db)):
    try:
        # Use default session for backward compatibility
        return await get_session("default", db)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# For backward compatibility - clear history
@router.post("/clear", response_model=APIResponse)
async def clear_chat_history(db: DbSession = Depends(get_db)):
    try:
        # Delete all messages in the default session
        db.query(ChatMessage).filter(ChatMessage.session_id == "default").delete()
        db.commit()
        
        return APIResponse(
            data={"message": "Chat history cleared"},
            status=200
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )