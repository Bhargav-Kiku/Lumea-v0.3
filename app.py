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
    theme = st.session_state.get('theme', 'dark')
    css_file = "style_dark.css" if theme == "dark" else "style_light.css"
    
    try:
        with open(css_file, "r") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    except FileNotFoundError:
        pass # Fallback if missing

load_css()

# --- FLOATING THEME TOGGLE ---
def render_theme_toggle():
    """Uses a native Streamlit toggle repositioned to top-right via CSS."""
    theme = st.session_state.get('theme', 'dark')
    is_dark = theme == 'dark'

    # Inject CSS that moves the LAST toggle rendered on the page to the top-right corner
    # We wrap it in a container div with a known ID using st.markdown trick
    st.markdown("""
    <style>
    /* Float the theme toggle to top-right */
    div[data-testid="stToggle"]:last-of-type {
        position: fixed !important;
        top: 12px !important;
        right: 80px !important;
        z-index: 9999 !important;
        background: transparent !important;
    }
    div[data-testid="stToggle"]:last-of-type label span {
        font-size: 0.85rem !important;
        color: rgba(255,255,255,0.7) !important;
    }
    </style>
    """, unsafe_allow_html=True)

    # The actual native toggle — Streamlit handles the click natively
    toggled = st.toggle("☀️ Light" if is_dark else "🌙 Dark", value=not is_dark, key="theme_toggle_native")

    # If value changed, flip theme
    is_now_light = toggled
    desired_theme = 'light' if is_now_light else 'dark'
    if desired_theme != theme:
        st.session_state.theme = desired_theme
        st.rerun()

render_theme_toggle()

# --- INITIALIZE STATE & SUPABASE ---
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user' not in st.session_state:
    st.session_state.user = None
if 'theme' not in st.session_state:
    st.session_state.theme = 'dark'
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
