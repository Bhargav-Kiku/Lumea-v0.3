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
    
    # CSS Keyframes for Box Breathing & 4-7-8
    st.markdown("""
    <style>
    .breath-outer {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
        position: relative;
    }
    .breath-circle {
        width: 130px;
        height: 130px;
        background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(139,92,246,0.1) 100%);
        border: 2px solid rgba(168, 85, 247, 0.4);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 30px rgba(168, 85, 247, 0.2);
    }
    .breath-inner {
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
    }
    
    /* Box Breathing (16s cycle: 4-4-4-4) */
    @keyframes box-breathing {
        0%, 100% { transform: scale(1.0); }
        25% { transform: scale(1.4); } /* Inhale 4s */
        50% { transform: scale(1.4); } /* Hold 4s */
        75% { transform: scale(1.0); } /* Exhale 4s */
    }
    
    @keyframes box-label {
        0%, 100% { content: 'Hold'; }
        0.1%, 24.9% { content: 'Inhale'; }
        25%, 49.9% { content: 'Hold'; }
        50%, 74.9% { content: 'Exhale'; }
        75%, 99.9% { content: 'Hold'; }
    }
    
    .animate-box {
        animation: box-breathing 16s ease-in-out infinite;
    }
    .inner-text-box::after {
        content: 'Focus';
        animation: box-label 16s infinite;
    }
    </style>
    """, unsafe_allow_html=True)
    
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
