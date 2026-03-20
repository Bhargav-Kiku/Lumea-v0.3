import os
import asyncio
import io
import edge_tts
from dotenv import load_dotenv
from groq import Groq

async def _async_text_to_audio(clean_text: str) -> io.BytesIO:
    """Async helper to generate edge-tts speech."""
    voice = "en-US-AriaNeural" 
    communicate = edge_tts.Combine(clean_text, voice) # Wait, is it Communicate? Previous code used Communicate
    communicate = edge_tts.Communicate(clean_text, voice)
    
    fp = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            fp.write(chunk["data"])
    fp.seek(0)
    return fp

def text_to_audio_bytes(text: str):
    """
    Converts text to an mp3 audio byte stream using Edge-TTS.
    """
    try:
        clean_text = text.replace("*", "").replace("#", "").replace("_", "")
        if not clean_text.strip():
            return None
        return asyncio.run(_async_text_to_audio(clean_text))
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

def transcribe_audio_groq(audio_bytes: bytes, filename: str = "input.wav"):
    """
    Transcribes audio bytes to text using Groq's Whisper API.
    """
    load_dotenv(override=True)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        return None
        
    try:
        client = Groq(api_key=groq_api_key)
        transcription = client.audio.transcriptions.create(
            file=(filename, audio_bytes),
            model="whisper-large-v3", 
            response_format="json"
        )
        return transcription.text
    except Exception as e:
        print(f"Transcription Error: {e}")
        return None
