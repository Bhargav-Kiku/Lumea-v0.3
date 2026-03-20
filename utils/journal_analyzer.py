import os
from datetime import datetime, timedelta

def get_weekly_journal_summary(supabase, user_id: str) -> str:
    """
    Fetches journals from the past 7 days and generates AI-powered theme insights.
    """
    if not supabase or user_id == 'guest':
        return "💡 *Log in to get your Weekly Journal Reflection summary.*"
        
    try:
        from dotenv import load_dotenv
        load_dotenv(override=True)
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        if not groq_api_key or groq_api_key == "your_groq_api_key_here":
            return "*(Groq disconnected)*"
            
        # 1. Calculate past 7 days
        seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
        
        response = supabase.table('journal_entries').select('title, content, created_at').eq('user_id', user_id).gte('created_at', seven_days_ago).execute()
        
        if not response.data or len(response.data) == 0:
            return "💡 *Not enough entries from the past week. Try writing a few more leaves in your journal first!*"
            
        # 2. Concatenate text content
        compiled_text = ""
        for i, entry in enumerate(response.data):
            t = entry.get('title', 'Reflection')
            c = entry.get('content', '')
            compiled_text += f"--- Entry {i+1} ({t}) ---\n{c}\n\n"
            
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        
        system_prompt = (
            "You are Lumea, an empathetic AI mental health companion. "
            "Read the user's journal entries from the past week below. "
            "Provide a highly supportive, validating 3-part summary:\n"
            "1. 📌 **Dominant Themes**: (What they focus on)\n"
            "2. 🌱 **Growth Markers**: (Where they are finding peace or strength)\n"
            "3. 💡 **Gentle Prompt**: (A warm question for next week)\n\n"
            "Keep it concise, bulletin-based, and extremely warm. Max 160 words."
        )
        
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": compiled_text}
            ],
            temperature=0.7,
            max_tokens=250
        )
        return res.choices[0].message.content
    except Exception as e:
        return f"*(Analysis error: {str(e)})*"
