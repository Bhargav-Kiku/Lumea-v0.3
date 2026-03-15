import streamlit as st
from utils.supabase_client import get_user_sessions

def sidebar_nav():
    is_light = st.session_state.get('theme', 'dark') == 'light'
    label_color = "rgba(30,41,59,0.55)" if is_light else "rgba(255,255,255,0.5)"
    
    # Inject expander background fix for light mode
    if is_light:
        st.markdown("""
        <style>
        section[data-testid="stSidebar"] [data-testid="stExpander"],
        section[data-testid="stSidebar"] details,
        section[data-testid="stSidebar"] details > div,
        section[data-testid="stSidebar"] [data-testid="stExpanderDetails"] {
            background: rgba(255, 255, 255, 0.82) !important;
            border: 1.5px solid rgba(148, 163, 184, 0.5) !important;
            border-radius: 12px !important;
        }
        </style>
        """, unsafe_allow_html=True)
    
    with st.sidebar:
        # Navigation Links
        st.markdown(f"<p style='color: {label_color}; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin-top: 1rem;'>Navigation</p>", unsafe_allow_html=True)
        
        pages = {
            "home": ("🏠", "Dashboard"),
            "chat": ("💬", "Chat Companion"),
            "mood": ("📊", "Mood Tracker"),
            "journal": ("📓", "Journal")
        }
        
        for key, (icon, label) in pages.items():
            # Highlight current page
            btn_style = "primary" if st.session_state.page == key else "secondary"
            if st.button(f"{icon} {label}", key=f"nav_{key}", use_container_width=True, type=btn_style):
                st.session_state.page = key
                if key == "chat":
                    # Clear session id when navigating freshly to chat without selecting a history
                    st.session_state.current_chat_session_id = None
                st.rerun()

        # Chat History
        supabase = st.session_state.get("supabase_client")
        user = st.session_state.get("user")
        
        if supabase and user:
            st.markdown(f"<p style='color: {label_color}; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin-top: 2rem;'>Previous Chats</p>", unsafe_allow_html=True)
            if st.button("➕ New Chat", use_container_width=True):
                st.session_state.page = "chat"
                st.session_state.current_chat_session_id = None
                st.rerun()
                
            sessions = get_user_sessions(supabase, user.id)
            if sessions:
                with st.expander("Recent Conversations", expanded=True):
                    for sess in sessions[:5]: # Show last 5
                        title = sess.get('title', 'Conversation')
                        if st.button(f"🗨️ {title}", key=f"hist_{sess['id']}", help="Resume this chat", use_container_width=True):
                            st.session_state.page = "chat"
                            st.session_state.current_chat_session_id = sess['id']
                            st.rerun()
        
        st.markdown("<div style='margin-top: auto; padding-top: 2rem;'></div>", unsafe_allow_html=True)
        
        st.markdown("<div style='margin-top: 1rem;'></div>", unsafe_allow_html=True)
        
        if st.button("🚪 Sign Out", use_container_width=True, key="nav_signout"):
            supabase = st.session_state.get("supabase_client")
            if supabase:
                try:
                    supabase.auth.sign_out()
                except:
                    pass
            st.session_state.authenticated = False
            st.session_state.user = None
            st.session_state.page = "home"
            st.rerun()
