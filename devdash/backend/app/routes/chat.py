# app/routes/chat.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session as DbSession, joinedload, aliased
from app.services.ai_service import AIService
from app.models.chat import ChatSession, ChatMessage
from app.database.session import get_db
from app.models.user import User
from app.dependencies import get_current_user
from sqlalchemy import func, and_

router = APIRouter()
ai_service = AIService()

class APIResponse(BaseModel):
    data: dict
    status: int
    message: Optional[str] = None

class MessageContent(BaseModel):
    message: str

# Create a new session
@router.post("/sessions", response_model=APIResponse)
async def create_session(user: User = Depends(get_current_user), db: DbSession = Depends(get_db)):
    try:
        # Generate a unique ID for the session
        session_id = str(uuid.uuid4())
        
        # Create a new chat session in the database
        new_session = ChatSession(id=session_id, user_id = user.id)
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
async def list_sessions(user: User = Depends(get_current_user) ,db: DbSession = Depends(get_db)):
    
    try:
            # Create a subquery to find the first message of each session
            # This is equivalent to using a window function like ROW_NUMBER() in sql
            first_message_subquery = db.query(
                ChatMessage.session_id,
                ChatMessage.content,
                # We use a special correlated subquery to ensure we only get the first message
                func.row_number().over(
                    partition_by=ChatMessage.session_id,
                    order_by=ChatMessage.timestamp.asc()
                ).label("row_num")
            ).subquery()

            # We need an "aliased" version of this subquery to use it in joins
            first_message_alias = aliased(first_message_subquery)

            # Build the main query
            # This query joins the sessions table with our subquery
            sessions_with_preview = db.query(
                ChatSession,
                first_message_alias.c.content.label("preview") # 'c' refers to the columns of the subquery
            ).outerjoin(
                # Join condition: session id must match and we only want the first row (row_num=1)
                first_message_alias,
                and_(ChatSession.id == first_message_alias.c.session_id, first_message_alias.c.row_num == 1)
            ).filter(
                ChatSession.user_id == user.id
            ).order_by(
                ChatSession.updated_at.desc()
            ).all()

            # Format the results 
            session_list = []
            for session, preview_content in sessions_with_preview:
                preview_text = (preview_content[:50] + "...") if preview_content else "Empty conversation"
                
                session_list.append({
                    "id": session.id,
                    "user_id": session.user_id,
                    "created_at": session.created_at,
                    "updated_at": session.updated_at,
                    "preview": preview_text
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
async def get_session(session_id: str, user: User = Depends(get_current_user), db: DbSession = Depends(get_db)):
    try:
        session = get_session_with_messages(db, session_id, user.id)
        if not session:
            return APIResponse(
                data={},
                status=404,
                message=f"Session with ID {session_id} not found"
            )
        
        # Get all messages for this session
        messages = session.messages
    
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
                    "user_id" : session.user_id,
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
    message_content: MessageContent, 
    user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db)
                                    ):
    try:
        #used joinedload to get session and messages at once

        # Check if session exists, create it if it doesn't
        session = get_session_with_messages(db, session_id, user.id)
        
        if not session:
            # Create the session if it doesn't exist
            session = ChatSession(id=session_id, user_id = user.id)
            db.add(session)
            existing_messages = []
        else:
            # Get existing messages for contextmessg
            existing_messages = session.messages
        
        # Format messages for AI service
        message_history = [
            {"role": msg.role, "content": msg.content} for msg in existing_messages
        ]
        
        # Add user message to DB
        user_message = ChatMessage(
            session_id=session_id,
            user_id = user.id,
            role="user",
            content=message_content.message
        )
        session.messages.append(user_message)
        
        
        # Get AI response
        ai_response = await ai_service.get_response(
            message_content.message,
            message_history
        )
        
        # Add AI response to DB
        assistant_message = ChatMessage(
            session_id=session_id,
            user_id = user.id,
            role="assistant",
            content=ai_response
        )
        session.messages.append(assistant_message)
        
        # Update session timestamp
        session.updated_at = datetime.utcnow()
        db.add(session)
        
        #commit all changes at once
        db.commit()
        
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
async def delete_session(session_id: str, user: User = Depends(get_current_user), db: DbSession = Depends(get_db)):
    try:
        session = db.query(ChatSession).filter(ChatSession.user_id == user.id).filter(ChatSession.id == session_id).first()
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

def get_session_with_messages(db: DbSession, session_id: str, user_id: int) -> ChatSession | None:
    """
    Retrieves a single chat session and all its related messages for a specific user.
    Uses joinedload for efficient, single-query fetching.
    """
    return db.query(ChatSession).options(
        joinedload(ChatSession.messages)
    ).filter(ChatSession.user_id == user_id).filter(ChatSession.id == session_id).first()