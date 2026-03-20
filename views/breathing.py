import streamlit as st
from components.sidebar import sidebar_nav

def view_breathing():
    """Beautiful Guided Breathing Page"""
    sidebar_nav()
    
    is_dark = st.session_state.get('theme', 'dark') == 'dark'
    text_color = "#f8fafc" if is_dark else "#1e293b"
    muted = "#94a3b8" if is_dark else "#64748b"
    
    st.markdown(f"""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>🌬️ Guided <span class="text-gradient">Breathing</span></h2>
        <p style="color: {muted};">Take a moment to center yourself and find grounding peace.</p>
    </div>
    """, unsafe_allow_html=True)
    
    from components.styles import get_breathing_css
    st.markdown(get_breathing_css(), unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 1], gap="large")
    
    with col1:
        st.markdown(f"<h4 style='color: {text_color}; margin-bottom: 0.5rem;'>The Box Breathing Technique</h4>", unsafe_allow_html=True)
        st.markdown(f"""
        <p style='color: {muted}; font-size: 0.95rem; line-height: 1.6;'>
        Also known as four-square breathing, this is a technique used to calm the nervous system, reduce stress, and improve focus. 
        <br><br>
        <b>How to use:</b>
        <ul style="color: {muted};">
            <li><b>Inhale</b> through your nose for 4 seconds.</li>
            <li><b>Hold</b> your breath for 4 seconds.</li>
            <li><b>Exhale</b> through your mouth for 4 seconds.</li>
            <li><b>Hold</b> your breath again for 4 seconds.</li>
        </ul>
        </p>
        """, unsafe_allow_html=True)
        
    with col2:
        st.markdown("""
        <div class="breath-outer">
            <div class="breath-circle animate-box">
                <div class="breath-inner">
                    <span class="inner-text-box"></span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='margin-top: 3rem;'></div>", unsafe_allow_html=True)
