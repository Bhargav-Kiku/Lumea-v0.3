"""
Supabase client configuration for Lumea app.
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Create Supabase client
def get_supabase_client() -> Client:
    """
    Returns a Supabase client instance.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase

# Initialize client
try:
    supabase = get_supabase_client()
except ValueError as e:
    print(f"Warning: {e}")
    supabase = None


# Database table operations
class SupabaseDB:
    """
    Helper class for Supabase database operations.
    """
    def __init__(self, client: Client):
        self.client = client
    
    # User operations
    def create_user(self, email: str, password: str, username: str):
        """Create a new user in Supabase Auth."""
        return self.client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"username": username}}
        })
    
    def login_user(self, email: str, password: str):
        """Login user with email and password."""
        return self.client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
    
    def logout_user(self):
        """Logout current user."""
        return self.client.auth.sign_out()
    
    def get_current_user(self):
        """Get currently logged in user."""
        return self.client.auth.get_user()
    
    # Profile operations
    def create_profile(self, user_id: str, username: str):
        """Create user profile."""
        return self.client.table('profiles').insert({
            "id": user_id,
            "username": username,
            "bio": "",
            "phone": ""
        }).execute()
    
    def get_profile(self, user_id: str):
        """Get user profile."""
        return self.client.table('profiles').select("*").eq('id', user_id).execute()
    
    def update_profile(self, user_id: str, data: dict):
        """Update user profile."""
        return self.client.table('profiles').update(data).eq('id', user_id).execute()
    
    # Mood entries
    def add_mood_entry(self, user_id: str, mood: int, note: str = "", tags: str = ""):
        """Add a mood entry."""
        return self.client.table('mood_entries').insert({
            "user_id": user_id,
            "mood": mood,
            "note": note,
            "tags": tags
        }).execute()
    
    def get_mood_entries(self, user_id: str, limit: int = 30):
        """Get mood entries for a user."""
        return self.client.table('mood_entries').select("*").eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
    
    # Journal entries
    def add_journal_entry(self, user_id: str, title: str, content: str, mood_before: int = None, mood_after: int = None, is_private: bool = True):
        """Add a journal entry."""
        return self.client.table('journal_entries').insert({
            "user_id": user_id,
            "title": title,
            "content": content,
            "mood_before": mood_before,
            "mood_after": mood_after,
            "is_private": is_private
        }).execute()
    
    def get_journal_entries(self, user_id: str, limit: int = 50):
        """Get journal entries for a user."""
        return self.client.table('journal_entries').select("*").eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
    
    # Chat history
    def add_chat_message(self, user_id: str, message: str, response: str):
        """Add a chat message."""
        return self.client.table('chat_history').insert({
            "user_id": user_id,
            "message": message,
            "response": response,
            "is_ai": True
        }).execute()
    
    def get_chat_history(self, user_id: str, limit: int = 50):
        """Get chat history for a user."""
        return self.client.table('chat_history').select("*").eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()


# Initialize database helper
if supabase:
    db = SupabaseDB(supabase)
else:
    db = None
