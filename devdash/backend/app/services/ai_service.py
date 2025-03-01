# app/services/ai_service.py
from typing import List
from anthropic import Anthropic
import os
from datetime import datetime
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = Anthropic(  # Direct Anthropic import
        api_key=settings.ANTHROPIC_API_KEY,
        )
        self.model = "claude-3-opus-20240229"  # Using the latest Claude model

    async def get_response(self, message: str, conversation_history: List[dict] = None) -> str:
        try:
            # Convert conversation history to Anthropic format
            messages = []
            if conversation_history:
                for msg in conversation_history:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
            
            # Add the new message
            messages.append({"role": "user", "content": message})

            # Send request to Anthropic
            response = self.client.messages.create(
                model=self.model,
                messages=messages,
                max_tokens=1024,
                temperature=0.7
            )

            return response.content[0].text

        except Exception as e:
            print(f"Error in AI service: {str(e)}")
            raise e