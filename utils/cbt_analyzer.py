import os
import json

def analyze_cognitive_distortion(thought_text: str):
    """
    Analyzes an automatic anxious thought for common CBT Cognitive Distortions.
    Returns a dict with 'distortion', 'description', and 'reframe_prompt'.
    """
    if not thought_text or not thought_text.strip():
        return None
        
    try:
        from dotenv import load_dotenv
        load_dotenv(override=True)
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        if not groq_api_key or groq_api_key == "your_groq_api_key_here":
            return None
            
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        
        system_prompt = (
            "You are Lumea, an empathetic AI mental health companion trained in automated CBT (Cognitive Behavioral Therapy). "
            "Analyze the thought below to identify if it matches a common Cognitive Distortion. "
            "Common Distortions:\n"
            "- **Catastrophizing**: Assuming the worst-case scenario.\n"
            "- **All-or-Nothing Thinking**: Seeing things in black and white lists.\n"
            "- **Mind Reading**: Assuming you know what others are thinking.\n"
            "- **Fortune Telling**: Predicting a negative future outcome.\n"
            "- **Should Statements**: Rigid demands ('I should/must be').\n"
            "- **Labeling**: Attaching global negative terms to yourself.\n\n"
            "Respond in JSON format with EXACTLY these keys:\n"
            "{\n"
            '  "distortion": "Name of distortion",\n'
            '  "description": "1-sentence warm explanation of why this thought matches.",\n'
            '  "reframe_prompt": "1-sentence supportive question guiding the user to challenge it."\n'
            "}"
        )
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Automatic Thought: \"{thought_text}\""}
            ],
            temperature=0.3,
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"CBT Analyzer Error: {e}")
        return {
            "distortion": "Thinking Pattern",
            "description": "Your mind seems focused on this thought heavily right now.",
            "reframe_prompt": "What is one alternative, kinder way to view this situation?"
        }
