import os
import requests
import streamlit as st
from groq import Groq
from dotenv import load_dotenv

# Hugging Face Emotion API
HF_API_URL = "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base"

# Emotion UI Mapping for streamllit badges
EMOTION_MAP = {
    "joy": "😊 Joy",
    "sadness": "😢 Sadness",
    "anger": "😠 Anger",
    "fear": "😨 Fear",
    "surprise": "😲 Surprise",
    "disgust": "🤢 Disgust",
    "neutral": "😐 Neutral"
}

def analyze_emotion(text: str):
    """
    Calls the Hugging Face Inference API to classify the emotion of the user's text.
    Returns: (mapped_emotion_string, probability_score_float)
    """
    load_dotenv(override=True)
    hf_token = os.getenv("HF_TOKEN")
    
    if not hf_token or hf_token == "your_huggingface_inference_token_here":
        return "⚠️ HF Token Missing", 0.0
        
    headers = {"Authorization": f"Bearer {hf_token}"}
    payload = {"inputs": text}
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                predictions = data[0]
                top_pred = max(predictions, key=lambda x: x.get('score', 0))
                label = top_pred.get("label", "neutral")
                score = top_pred.get("score", 0.0)
                
                mapped_label = EMOTION_MAP.get(label.lower(), label.capitalize())
                return mapped_label, round(score * 100, 1)
        elif response.status_code == 503:
            return "⏳ Loading HF Model...", 0.0
        else:
            return f"❌ HF API Error {response.status_code}", 0.0
            
    except Exception as e:
        print(f"HF Emotion API error: {e}")
        return "❌ Connection Error", 0.0
        
    return "❓ Unknown Error", 0.0

def get_groq_chat_stream(messages, current_emotion=None):
    """
    Yields chunks of the AI's response using Groq.
    Dynamic system prompt adjusts based on user's current emotion.
    """
    load_dotenv(override=True)
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key or groq_api_key == "your_groq_api_key_here":
        yield "I'm sorry, my AI brain (Groq) is currently disconnected. Please check your API keys."
        return
        
    try:
        groq_client = Groq(api_key=groq_api_key)
    except Exception as e:
        yield f"*(Failed to initialize Groq: {str(e)})*"
        return

    # System instruction tailored to the context
    system_prompt = (
        "You are Lumea, an empathetic, supportive, and compassionate AI mental health companion. "
        "Your goal is to listen, validate feelings, and gently guide users towards positivity or "
        "mindfulness when appropriate. Keep responses concise, warm, and conversational. Do not act as a doctor."
    )
    
    if current_emotion and not current_emotion.startswith(("⚠️", "⏳", "❌", "❓")):
        system_prompt += f"\n[System Context: The user's current input was detected as expressing {current_emotion}. Acknowledge this feeling implicitly and adjust your tone to be highly supportive.]"

    # We need to construct a clean history for Groq
    clean_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in messages:
        if msg["role"] in ["user", "assistant"]:
            clean_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
            
    try:
        stream = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Fast and capable model
            messages=clean_messages,
            temperature=0.7,
            max_tokens=500,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
                
    except Exception as e:
        yield f"*(An error occurred connecting to my thought engine: {str(e)})*"

