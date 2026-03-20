import os
from dotenv import load_dotenv
from groq import Groq

def get_journal_reflection(content: str) -> str:
    """
    Generates a supportive 1-2 sentence AI reflection for a journal entry.
    """
    if not content or not content.strip():
        return ""
        
    load_dotenv(override=True)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        return "*(AI disconnected)*"
        
    try:
        client = Groq(api_key=groq_api_key)
        system_prompt = (
            "You are Lumea, an empathetic AI mental health companion. "
            "Read the user's journal entry below and provide a warm, compassionate, and validating "
            "1 to 2 sentence reflection. Do not offer unsolicited advice or diagnose."
        )
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Journal Entry:\n{content}"}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"*(Could not reflect: {str(e)})*"

def get_dynamic_affirmation(current_mood: str) -> str:
    """
    Generates a personalized, validating 1-sentence affirmation based on user mood.
    """
    load_dotenv(override=True)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        return "You are doing great just as you are."
        
    try:
        client = Groq(api_key=groq_api_key)
        system_prompt = (
            "You are Lumea, an empathetic AI mental health companion. "
            "Write a single, warm, personalized, and validating 1-sentence affirmation "
            "tailored explicitly for someone whose current mood is described below."
        )
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"User's Current Mood: {current_mood}"}
            ],
            temperature=0.7,
            max_tokens=60
        )
        return response.choices[0].message.content.strip().replace('"', '')
    except Exception:
        return "Take this moment for yourself. You matter."
