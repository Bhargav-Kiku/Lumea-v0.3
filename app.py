"""
Lumea - AI Mental Health Companion
Streamlit Application (Modular Redesign)
"""
import streamlit as st
from utils.supabase_client import init_supabase
from views.auth import view_auth
from views.dashboard import view_dashboard
from views.chat import view_chat
from views.mood_tracker import view_mood_tracker
from views.journal import view_journal

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="Lumea - AI Mental Health Companion",
    page_icon="🌙",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- LOAD CSS ---
def load_css():
    try:
        with open("style.css", "r") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass # Fallback if style.css is missing

load_css()

# --- INITIALIZE STATE & SUPABASE ---
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user' not in st.session_state:
    st.session_state.user = None
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = [
        {"role": "assistant", "content": "Hi there. I'm Lumea, your mental health companion. How are you feeling today?"}
    ]
if 'page' not in st.session_state:
    st.session_state.page = 'home'
if 'supabase_client' not in st.session_state:
    st.session_state.supabase_client = init_supabase()

# --- MAIN APP ROUTING ---
def main():
    if not st.session_state.authenticated:
        view_auth()
    else:
        page = st.session_state.page
        if page == "home":
            view_dashboard()
        elif page == "chat":
            view_chat()
        elif page == "mood":
            view_mood_tracker()
        elif page == "journal":
            view_journal()
        else:
            view_dashboard()

if __name__ == "__main__":
    main()
