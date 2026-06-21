from dotenv import load_dotenv
from pathlib import Path

from livekit import agents
from livekit.agents import AgentSession, Agent, room_io, ChatContext
from livekit.plugins import (
    noise_cancellation,
)
from livekit.plugins import google
from promps import AGENT_INSTRUCTIONS, SESSION_INSTRUCTIONS
from tools import search_web, get_weather
from vision import answer_captured_screen, capture_screen, set_chat_room
from mem0 import AsyncMemoryClient
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

load_dotenv(Path(__file__).parent / ".env")


def _extract_memories(response):
    if isinstance(response, dict):
        return response.get("results", [])
    return response or []


class Assistant(Agent):
    def __init__(self, instructions: str = AGENT_INSTRUCTIONS, chat_ctx=None) -> None:
        super().__init__(
            instructions=instructions,
            llm=google.beta.realtime.RealtimeModel(
                voice="Puck",
                temperature=0.8,
            ),
            tools=[
                get_weather,
                search_web,
                capture_screen,
                answer_captured_screen,
            ],
            chat_ctx=chat_ctx
        )

async def entrypoint(ctx: agents.JobContext):
    async def shutdown_hook(chat_ctx: ChatContext, mem0: AsyncMemoryClient, user_name: str, memory_str: str):
        logging.info("Shutting down, saving chat context to memory...")

        messages_formatted = [
        ]

        logging.info(f"Chat context messages: {chat_ctx.items}")

        items = getattr(chat_ctx, "items", None) or []
        for item in items:
            if getattr(item, "role", None) not in ["user", "assistant"]:
                continue

            content = getattr(item, "content", None)
            if content is None:
                continue

            if isinstance(content, list):
                content_str = ''.join(str(c) for c in content if c)
            else:
                content_str = str(content)

            content_str = content_str.strip()
            if not content_str:
                continue

            if memory_str and memory_str in content_str:
                continue

            messages_formatted.append({
                "role": item.role,
                "content": content_str
            })

        if not messages_formatted:
            logging.info("No new chat messages to save to memory.")
            return

        logging.info(f"Formatted messages to add to memory: {messages_formatted}")
        try:
            await mem0.add(messages_formatted, user_id=user_name)
            logging.info("Chat context saved to memory.")
        except Exception as e:
            logging.error(f"Failed to add chat context to memory: {e}")

    session = AgentSession(
    )

    mem0 = AsyncMemoryClient()
    user_name = 'Minh'
    
    initial_ctx = ChatContext()
    memory_str = ''
    agent_instructions = AGENT_INSTRUCTIONS
    
    try:
        response = await mem0.get_all(filters={"user_id": user_name})
        results = _extract_memories(response)
        if results: 
            memories = [
                {
                    "memory": result["memory"],
                    "updated_at": result["updated_at"]
                }
                for result in results
            ]
            memory_str = json.dumps(memories)
            logging.info(f"Memories: {memory_str}")
            # Inject memory context to system instructions instead of chat_ctx to satisfy Gemini role rules
            agent_instructions += f"\n\nHere is relevant context about the user (their name is {user_name}): {memory_str}"
    except Exception as e:
        logging.error(f"Error fetching memories from mem0: {e}")
    
    await ctx.connect()
    set_chat_room(ctx.room)
    
    await session.start(
        room=ctx.room,
        agent=Assistant(instructions=agent_instructions, chat_ctx=initial_ctx),
        room_options=room_io.RoomOptions(
            video_input=True,
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )
    
    await session.generate_reply(
        instructions=SESSION_INSTRUCTIONS
    )

    async def _on_shutdown():
        await shutdown_hook(initial_ctx, mem0, user_name, memory_str)
    ctx.add_shutdown_callback(_on_shutdown)
    
if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
