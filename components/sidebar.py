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
            "journal": ("📓", "Journal"),
            "breathing": ("🌬️", "Breathing Exercise")
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
        
        # --- Rate Limting Progress Bar (Custom HTML) ---
        from utils.rate_limit import get_message_count, MAX_MESSAGES_PER_DAY
        count = get_message_count()
        percent = min(count / MAX_MESSAGES_PER_DAY, 1.0) * 100
        
        # Themes Colors
        bar_bg = "rgba(0, 0, 0, 0.08)" if is_light else "rgba(255, 255, 255, 0.1)"
        text_color = "#334155" if is_light else "#e2e8f0"
        
        progress_html = f"""
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: {text_color}; margin-bottom: 0.4rem; font-weight: 500;">
                <span>Daily Limit</span>
                <span>{count} / {MAX_MESSAGES_PER_DAY}</span>
            </div>
            <div style="background: {bar_bg}; height: 8px; border-radius: 4px; width: 100%; overflow: hidden;">
                <div style="width: {percent}%; height: 100%; background: linear-gradient(90deg, #818cf8 0%, #c084fc 100%); border-radius: 4px; transition: width 0.4s ease-in-out;"></div>
            </div>
        </div>
        """
        st.markdown(progress_html, unsafe_allow_html=True)
        
        st.markdown(f"<p style='color: {label_color}; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin-top: 1.5rem;'>Data Backup</p>", unsafe_allow_html=True)
        
        from utils.exporter import export_mood_data, export_journal_data
        
        if supabase and user and getattr(user, 'id', 'guest') != 'guest':
            u_id = user.id
            with st.expander("📥 Export History", expanded=False):
                mood_csv = export_mood_data(supabase, u_id)
                if mood_csv:
                    st.download_button("📊 Mood Data (CSV)", data=mood_csv, file_name="lumea_mood_history.csv", mime="text/csv", use_container_width=True)
                
                journal_csv = export_journal_data(supabase, u_id)
                if journal_csv:
                    st.download_button("📓 Journals (CSV)", data=journal_csv, file_name="lumea_journal_history.csv", mime="text/csv", use_container_width=True)
                    
        st.markdown("<br>", unsafe_allow_html=True)

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
