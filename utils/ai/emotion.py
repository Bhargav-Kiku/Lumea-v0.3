import os
import requests
from dotenv import load_dotenv

HF_API_URL = "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base"

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
        return f"❌ HF API Error {response.status_code}", 0.0
            
    except Exception as e:
        print(f"HF Emotion API error: {e}")
        return "❌ Connection Error", 0.0
    return "❓ Unknown Error", 0.0
