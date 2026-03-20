import os
from dotenv import load_dotenv
from groq import Groq

def get_groq_chat_stream(messages, current_emotion=None):
    """
    Yields chunks of the AI's response using Groq.
    Dynamic system prompt adjusts based on user's current emotion.
    """
    load_dotenv(override=True)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        yield "I'm sorry, my AI brain is disconnected. Check API keys in settings."
        return
        
    try:
        groq_client = Groq(api_key=groq_api_key)
    except Exception as e:
        yield f"*(Failed to initialize Groq: {str(e)})*"
        return

    system_prompt = (
        "You are Lumea, an empathetic, supportive, and compassionate AI mental health companion. "
        "Your goal is to listen, validate feelings, and gently guide users towards positivity or "
        "mindfulness when appropriate. Concise, warm, and conversational. Do not act as a doctor."
        "\n\n[Safety Guidelines: If the user expresses extreme distress, hopelessness, or implies self-harm, "
        "prioritize safety. Match distress with extreme empathy, de-escalate, and gently remind them "
        "of professional help or support helplines (e.g., Vandrevala or AASRA in India).]"
    )
    
    if current_emotion and not current_emotion.startswith(("⚠️", "⏳", "❌", "❓")):
        system_prompt += f"\n[System Context: The user's current input was detected as expressing {current_emotion}. Acknowledge and adjust tone.]"

    clean_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg["role"] in ["user", "assistant"]:
            clean_messages.append({"role": msg["role"], "content": msg["content"]})
            
    try:
        stream = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=clean_messages,
            temperature=0.7,
            max_tokens=500,
            stream=True
        )
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f"*(An error occurred connecting to engine: {str(e)})*"
