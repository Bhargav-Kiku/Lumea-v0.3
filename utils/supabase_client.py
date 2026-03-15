import streamlit as st
from supabase import create_client
import os
from dotenv import load_dotenv

@st.cache_resource
def init_supabase():
    """Initialize and return a Supabase client."""
    load_dotenv(override=True)
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        return None
        
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"Supabase init error: {e}")
        return None

# --- Chat Session Helpers ---
def create_chat_session(supabase_client, user_id, title="New Conversation"):
    """Creates a new chat session and returns its ID."""
    if not supabase_client: return None
    try:
        res = supabase_client.table("chat_sessions").insert({
            "user_id": user_id,
            "title": title
        }).execute()
        return res.data[0]['id'] if res.data else None
    except Exception as e:
        print(f"Error creating session: {e}")
        return None

def get_user_sessions(supabase_client, user_id):
    """Fetches all chat sessions for a user, ordered by most recent."""
    if not supabase_client: return []
    try:
        res = supabase_client.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return []

def save_chat_message(supabase_client, session_id, role, content, emotion=None, score=None):
    """Saves a single chat message to history."""
    if not supabase_client or not session_id: return None
    try:
        res = supabase_client.table("chat_messages").insert({
            "session_id": session_id,
            "role": role,
            "content": content,
            "emotion": emotion,
            "score": score
        }).execute()
        return res.data
    except Exception as e:
        print(f"Error saving message: {e}")
        return None

def get_session_messages(supabase_client, session_id):
    """Fetches all messages for a specific session."""
    if not supabase_client: return []
    try:
        res = supabase_client.table("chat_messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return []
