import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import patch
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.chat import ChatSession

# Mark all tests in this file as async
pytestmark = pytest.mark.anyio

async def test_should_create_new_chat_session_and_return_it(
    authenticated_client: AsyncClient, test_user: User
):
    """
    Test: POST /api/v1/chat/sessions
    Should create a new chat session for the authenticated user and return the session details.
    """
    response = await authenticated_client.post("/api/v1/chat/sessions")
    assert response.status_code == 200
    response_dict = response.json()
    data = response_dict["data"]
    
    assert data["user_id"] == test_user.id
    assert data["session_id"] 
    assert data["created_at"] 


async def test_should_return_all_chat_sessions_for_authenticated_user(
    authenticated_client: AsyncClient, test_user: User, db_session
):
    """
    Test: GET /api/v1/chat/sessions
    Should retrieve all chat sessions belonging to the authenticated user.
    """

    # First, create a session to ensure there's something to fetch
    # Generate a unique ID for the session
    session_id = str(uuid.uuid4())
    new_session = ChatSession(id = session_id ,user_id=test_user.id)
    db_session.add(new_session)
    db_session.commit()

    response = await authenticated_client.get("/api/v1/chat/sessions")
    assert response.status_code == 200
    response_dict = response.json()
    session_data = response_dict["data"]["sessions"]
    assert isinstance(session_data, list)
    # Check if the created session is in the list of returned sessions
    assert any(session["id"] == new_session.id for session in session_data)


@patch("app.services.ai_service.AIService.get_response")
async def test_should_save_user_message_and_return_mocked_ai_response(
    mock_ai_response, authenticated_client: AsyncClient, test_user: User, db_session
):
    """
    Test: POST /api/v1/chat/sessions/{session_id}/messages
    Should save the user's message, get a mocked AI response, and return both.
    """
    # Mock the AI service to return a predictable response
    mock_ai_response.return_value = "AI says hi!"
    # Create a session to post a message to
    session_id = str(uuid.uuid4())
    new_session = ChatSession(id = session_id ,user_id=test_user.id)
    db_session.add(new_session)
    db_session.commit()

    message_content = "Hello, AI!"
    response = await authenticated_client.post(
        f"/api/v1/chat/sessions/{new_session.id}/messages",
        json={"session_id": session_id,"message": message_content},
    )

    assert response.status_code == 200
    data = response.json()["data"]

    # Verify the user's message was saved and returned correctly
    assert data["user_message"]["content"] == message_content
    assert data["user_message"]["role"] == "user"
    
    # Verify the mocked AI response was returned correctly
    assert data["ai_response"]["content"] == mock_ai_response.return_value
    assert data["ai_response"]["role"] == "assistant"

    assert data["session_id"] == new_session.id

@patch("app.services.ai_service.AIService.get_response")
async def test_should_return_all_messages_for_a_given_session(
    mock_ai_response, authenticated_client: AsyncClient, test_user: User, db_session
):
    """
    Test: GET /api/v1/chat/sessions/{session_id}/messages
    Should retrieve all messages (both user and assistant) for a specific chat session.
    """
    # Mock the AI service to return a predictable response
    mock_ai_response.return_value = "AI says hi!"

    # Create a session to post a message to
    session_id = str(uuid.uuid4())
    new_session = ChatSession(id = session_id ,user_id=test_user.id)
    db_session.add(new_session)
    db_session.commit()

    # Post a message to have some data to fetch

    await authenticated_client.post(
            f"/api/v1/chat/sessions/{new_session.id}/messages",
            json={"message": "User says hi!"},
        )

    # Retrieve the messages for the session
    response = await authenticated_client.get(
        f"/api/v1/chat/sessions/{new_session.id}/messages"
    )
    assert response.status_code == 200
    data = response.json()["data"]
    messages = data["messages"]
    # Verify the correct messages are returned in the correct order
    assert isinstance(messages, list)
    assert len(messages) == 2  # One user message + one AI message
    assert messages[0]["content"] == "User says hi!"
    assert messages[1]["content"] == "AI says hi!"

