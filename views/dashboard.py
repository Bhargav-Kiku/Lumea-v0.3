import streamlit as st
from components.sidebar import sidebar_nav

def view_dashboard():
    """Authenticated Home Dashboard"""
    sidebar_nav()
    
    user_email = getattr(st.session_state.user, 'email', "Friend")
    is_light = st.session_state.get('theme', 'dark') == 'light'
    muted = "#64748b" if is_light else "#94a3b8"
    
    import random
    AFFIRMATIONS = [
        "Take a deep breath. You are doing great.",
        "You are in a safe, quiet space now.",
        "What is one small win you had today?",
        "Be kind to your mind today.",
        "Every day is a fresh beginning."
    ]
    quote = random.choice(AFFIRMATIONS)
    
    st.markdown(f"""
    <div style="background: rgba(168, 85, 247, 0.08); border: 1.1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;" class="animate-fade-in">
        <span style="font-style: italic; color: {"#a855f7" if is_light else "#d8b4fe"}; font-index: 0.95rem;">✨ {quote}</span>
    </div>
    
    <div class="animate-fade-in" style="margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; font-weight: 300;">Good to see you, <span class="text-gradient" style="font-weight: 700;">{user_email.split('@')[0]}</span></h1>
        <p style="color: {muted}; font-size: 1.1rem;">What would you like to focus on today?</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3, gap="large")
    
    with col1:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>💬</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Start Chatting</h3>", unsafe_allow_html=True)
            st.markdown(f"<p style='color: {muted}; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Talk to your AI companion in a safe, judgment-free space.</p>", unsafe_allow_html=True)
            if st.button("Open Chat", key="btn_chat_dash", use_container_width=True):
                st.session_state.page = "chat"
                st.rerun()

    with col2:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>📊</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Mood Tracker</h3>", unsafe_allow_html=True)
            st.markdown(f"<p style='color: {muted}; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Log your feelings and visualize your emotional journey over time.</p>", unsafe_allow_html=True)
            if st.button("Track Mood", key="btn_mood_dash", use_container_width=True):
                st.session_state.page = "mood"
                st.rerun()

    with col3:
        with st.container(border=True):
            st.markdown("<h1 style='font-size: 3.5rem; margin-bottom: 0.5rem; text-align: center;'>📓</h1>", unsafe_allow_html=True)
            st.markdown("<h3 style='text-align: center;'>Your Journal</h3>", unsafe_allow_html=True)
            st.markdown(f"<p style='color: {muted}; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center;'>Reflect on your day, write down thoughts, and find clarity.</p>", unsafe_allow_html=True)
            if st.button("Write Entry", key="btn_journal_dash", use_container_width=True):
                st.session_state.page = "journal"
                st.rerun()

