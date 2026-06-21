import os
import asyncio
import base64
import io
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

import mss
from PIL import Image
from google import genai
from livekit.agents import function_tool, RunContext

MAX_IMAGE_SIDE = 1600
CHAT_IMAGE_SIDE = 900
CHAT_IMAGE_QUALITY = 72
SCREENSHOT_CHAT_TOPIC = "jarvis-screen"
VISION_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-2.5-flash")


@dataclass
class ScreenSnapshot:
    image: Image.Image
    captured_at: str
    overview: str


_latest_snapshot: Optional[ScreenSnapshot] = None
_chat_room: Optional[Any] = None


def set_chat_room(room: Any) -> None:
    global _chat_room
    _chat_room = room


def _get_client():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY or GOOGLE_API_KEY for screen vision.")
    return genai.Client(api_key=api_key)


def _capture_primary_monitor() -> Image.Image:
    with mss.mss() as sct:
        monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
        screenshot = sct.grab(monitor)

    image = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
    image.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
    return image


def _vision_prompt(question: str) -> str:
    return f"""
You are Jarvis reading a screenshot that the user explicitly asked you to inspect.

Privacy and scope:
- Use only this screenshot and the user's question.
- Do not claim you can see the screen outside this one captured image.
- If the screenshot is unclear, say that briefly.

Answer style:
- Reply in the user's language.
- Be direct and concise.
- Answer the exact question first.
- Do not describe unrelated screen details.
- Do not give long explanations unless the user asks.

User question: {question}
""".strip()


def _snapshot_prompt() -> str:
    return """
You are Jarvis preparing a visual memory from a screenshot the user explicitly asked you to capture.

Create a compact but useful snapshot for later follow-up questions:
- Mention the active app/window if visible.
- Mention important text, errors, buttons, dialogs, or UI state.
- Ignore unrelated private details unless they are necessary to understand the screen.
- Use the user's language if the screen/user context is Vietnamese; otherwise use concise English.
- Keep it under 5 short bullet points.
""".strip()


def _generate_with_image(image: Image.Image, prompt: str) -> str:
    client = _get_client()
    response = client.models.generate_content(
        model=VISION_MODEL,
        contents=[
            prompt,
            image,
        ],
    )

    answer = getattr(response, "text", None)
    return answer.strip() if answer else "Mình đã xem ảnh nhưng không đọc được nội dung rõ ràng."


def _chat_image_data_url(image: Image.Image) -> str:
    chat_image = image.copy()
    chat_image.thumbnail((CHAT_IMAGE_SIDE, CHAT_IMAGE_SIDE), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    chat_image.save(buffer, format="JPEG", quality=CHAT_IMAGE_QUALITY, optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


async def _publish_screenshot_to_chat(image: Image.Image) -> None:
    if _chat_room is None:
        logging.warning("No LiveKit room available for screenshot chat publish.")
        return

    payload = {
        "type": "jarvis_screenshot",
        "src": _chat_image_data_url(image),
        "timestamp": datetime.now().isoformat(timespec="seconds"),
    }
    payload_text = json.dumps(payload)
    writer = await _chat_room.local_participant.stream_text(
        topic=SCREENSHOT_CHAT_TOPIC,
    )
    await writer.write(payload_text)
    await writer.aclose()


def _remember_snapshot(image: Image.Image, overview: str) -> None:
    global _latest_snapshot
    _latest_snapshot = ScreenSnapshot(
        image=image.copy(),
        captured_at=datetime.now().isoformat(timespec="seconds"),
        overview=overview,
    )


def _capture_screen_sync(question: str) -> str:
    image = _capture_primary_monitor()
    prompt = _vision_prompt(question) if question else _snapshot_prompt()
    answer = _generate_with_image(image, prompt)
    _remember_snapshot(image, answer)
    if question:
        return answer
    return f"Đã chụp màn hình rồi, boss hỏi tiếp đi.\n\nSnapshot tạm thời:\n{answer}"


def _analyze_screen_sync(question: str) -> str:
    image = _capture_primary_monitor()
    answer = _generate_with_image(image, _vision_prompt(question))
    _remember_snapshot(image, answer)
    return answer


def _answer_latest_snapshot_sync(question: str) -> str:
    if _latest_snapshot is None:
        return (
            "Mình chưa có ảnh màn hình nào được chụp trong phiên này; "
            "boss bảo mình chụp màn hình trước nhé."
        )

    prompt = f"""
You are Jarvis answering a follow-up question about the latest screenshot the user asked you to capture.

The screenshot was captured at: {_latest_snapshot.captured_at}

Previous compact snapshot:
{_latest_snapshot.overview}

Rules:
- Use the cached screenshot image and the user's question.
- Do not claim you can see the live screen right now.
- If the requested detail is not visible or unclear, say that briefly.
- Reply in the user's language.
- Be direct and concise.

User question: {question}
""".strip()
    return _generate_with_image(_latest_snapshot.image, prompt)


@function_tool()
async def capture_screen(
    context: RunContext,  # type: ignore
    question: str = "",
) -> str:
    """
    Capture the user's current screen and remember it for follow-up questions.

    Privacy rule: only use this tool when the user explicitly asks Jarvis to
    capture, screenshot, inspect, check, analyze, read, explain, or look at the screen.
    If the user only says "chụp màn hình" / "take a screenshot", call this
    with an empty question so the screenshot is stored and ready for the next user question.
    Do not call this tool for normal conversation or inferred screen context.
    """
    try:
        image = await asyncio.to_thread(_capture_primary_monitor)
        try:
            await _publish_screenshot_to_chat(image)
        except Exception as publish_error:
            logging.exception("Failed to publish screenshot to chat: %s", publish_error)

        cleaned_question = question.strip()
        prompt = _vision_prompt(cleaned_question) if cleaned_question else _snapshot_prompt()
        answer = await asyncio.to_thread(_generate_with_image, image, prompt)
        _remember_snapshot(image, answer)

        if cleaned_question:
            return answer
        return f"Đã chụp màn hình rồi, boss xem trong chat và hỏi tiếp đi.\n\nSnapshot tạm thời:\n{answer}"
    except Exception as e:
        logging.exception("Failed to capture or analyze screen: %s", e)
        return "Mình chưa xem được màn hình lúc này, có thể app không có quyền chụp màn hình hoặc thiếu Gemini API key."


@function_tool()
async def answer_captured_screen(
    context: RunContext,  # type: ignore
    question: str,
) -> str:
    """
    Answer a follow-up question about the most recently captured screenshot.

    Use this when the user previously asked Jarvis to capture/look at the screen
    and now asks a question about that captured screen, image, error, window,
    button, text, UI, code, or visible content.
    Do not use this for live screen access unless a screenshot was already captured.
    """
    try:
        return await asyncio.to_thread(_answer_latest_snapshot_sync, question.strip())
    except Exception as e:
        logging.exception("Failed to answer from captured screen: %s", e)
        return "Mình chưa đọc lại được ảnh màn hình đã chụp lúc này."


def take_screenshot():
    image = _capture_primary_monitor()
    _remember_snapshot(image, "Manual screenshot captured in memory.")
    return "Screenshot captured in memory."


def analyze_screen(question: str, mode: str = "assistant"):
    return _analyze_screen_sync(question)
