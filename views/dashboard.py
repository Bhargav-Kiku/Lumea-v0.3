import streamlit as st
from components.sidebar import sidebar_nav

def view_dashboard():
    """Authenticated Home Dashboard"""
    sidebar_nav()
    
    user_email = getattr(st.session_state.user, 'email', "Friend")
    
    st.markdown(f"""
    <div class="animate-fade-in" style="margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; font-weight: 300;">Good to see you, <span class="text-gradient" style="font-weight: 700;">{user_email.split('@')[0]}</span></h1>
        <p style="color: #94a3b8; font-size: 1.1rem;">What would you like to focus on today?</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3, gap="large")
    
    with col1:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>💬</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Start Chatting</h3>", unsafe_allow_html=True)
            st.markdown("<p style='color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Talk to your AI companion in a safe, judgment-free space.</p>", unsafe_allow_html=True)
            if st.button("Open Chat", key="btn_chat_dash", use_container_width=True):
                st.session_state.page = "chat"
                st.rerun()

    with col2:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>📊</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Mood Tracker</h3>", unsafe_allow_html=True)
            st.markdown("<p style='color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Log your feelings and visualize your emotional journey over time.</p>", unsafe_allow_html=True)
            if st.button("Track Mood", key="btn_mood_dash", use_container_width=True):
                st.session_state.page = "mood"
                st.rerun()

    with col3:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>📓</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Your Journal</h3>", unsafe_allow_html=True)
            st.markdown("<p style='color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Reflect on your day, write down thoughts, and find clarity.</p>", unsafe_allow_html=True)
            if st.button("Write Entry", key="btn_journal_dash", use_container_width=True):
                st.session_state.page = "journal"
                st.rerun()
