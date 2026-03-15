import streamlit as st

def sidebar_nav():
    with st.sidebar:
        st.markdown("<h2 class='text-gradient' style='text-align: center; margin-bottom: 2rem;'>🌙 Lumea</h2>", unsafe_allow_html=True)
        
        if st.button("🏠 Dashboard", use_container_width=True, key="nav_home"):
            st.session_state.page = "home"
            st.rerun()
        if st.button("💬 Chat", use_container_width=True, key="nav_chat"):
            st.session_state.page = "chat"
            st.rerun()
        if st.button("📊 Mood Tracker", use_container_width=True, key="nav_mood"):
            st.session_state.page = "mood"
            st.rerun()
        if st.button("📓 Journal", use_container_width=True, key="nav_journal"):
            st.session_state.page = "journal"
            st.rerun()
        
        st.markdown("<div style='margin-top: auto; padding-top: 2rem;'></div>", unsafe_allow_html=True)
        
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
