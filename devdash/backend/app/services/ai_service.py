# app/services/ai_service.py
from typing import List
from anthropic import Anthropic
from app.core.config import settings

# Hard latency ceiling: the chat route is served by Lambda behind an API Gateway
# HTTP API, whose integration timeout maxes out at 30s. Anything slower than that
# reaches the user as a 504 no matter how the Lambda is configured, so this
# service is tuned for a bounded response time rather than maximum depth:
#   - effort "low" keeps adaptive thinking short
#   - a modest max_tokens caps how long generation can run
# Streaming would lift this constraint properly, but it needs SSE support end to
# end (API Gateway, Mangum, and the frontend), which is a larger change.
MODEL = "claude-opus-5"
MAX_TOKENS = 2048
EFFORT = "low"


class AIService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = MODEL

    async def get_response(self, message: str, conversation_history: List[dict] = None) -> str:
        # Convert conversation history to Anthropic format
        messages = []
        if conversation_history:
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})

        # Add the new message
        messages.append({"role": "user", "content": message})

        response = self.client.messages.create(
            model=self.model,
            messages=messages,
            max_tokens=MAX_TOKENS,
            # Thinking is on by default on this model. Left at the default
            # display ("omitted") because the UI renders assistant text only.
            thinking={"type": "adaptive"},
            output_config={"effort": EFFORT},
        )

        # content is a list of blocks and the first one is not necessarily text —
        # with thinking enabled a ThinkingBlock can come first, so select by type
        # rather than indexing.
        return "".join(block.text for block in response.content if block.type == "text")
