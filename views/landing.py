import streamlit as st

def view_landing():
    """Beautiful Landing Page for Lumea"""
    is_light = st.session_state.get('theme', 'dark') == 'light'
    muted = "#64748b" if is_light else "#94a3b8"
    
    # Firefly Effect Generation
    import random
    firefly_count = 25
    firefly_html = ""
    style_injection = "<style>\n"
    
    for i in range(firefly_count):
        firefly_id = f"ff-{i}"
        size = random.randint(4, 9)
        x_pos = random.uniform(5, 95)
        y_pos = random.uniform(10, 90) # keep mostly in content bounds
        x_move = random.uniform(-80, 80)
        y_move = random.uniform(-80, 80)
        duration = random.uniform(12, 25)
        delay = random.uniform(0, 10)
        
        firefly_html += f'<div class="firefly" id="{firefly_id}"></div>\n'
        style_injection += f"""
        #{firefly_id} {{
            width: {size}px;
            height: {size}px;
            left: {x_pos}vw;
            top: {y_pos}vh;
            animation: float-{i} {duration}s ease-in-out {delay}s infinite alternate, twinkle {duration/2}s ease-in-out {delay}s infinite alternate;
        }}
        @keyframes float-{i} {{
            0% {{ transform: translate(0, 0); }}
            50% {{ transform: translate({x_move*0.5}px, {y_move*0.4}px); }}
            100% {{ transform: translate({x_move}px, {y_move}px); }}
        }}
        """
        
    style_injection += """
    .firefly {
        position: fixed;
        border-radius: 50%;
        background: #facc15;
        box-shadow: 0 0 8px #facc15, 0 0 15px #eab308, 0 0 22px rgba(250, 204, 21, 0.4);
        opacity: 0.5;
        pointer-events: none;
        z-index: 100; /* Floating visual layer but background behind most content overlays */
    }
    @keyframes twinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.8); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    </style>
    """
    st.markdown(style_injection.strip(), unsafe_allow_html=True)
    st.markdown(firefly_html.strip(), unsafe_allow_html=True)
    
    # Hero Section
    st.markdown(f"""
    <style>
    /* Reduce Streamlit's default top padding only for this page/container */
    div[data-testid="stVerticalBlock"] > div:first-child .block-container {{
        padding-top: 1rem !important;
    }}
    .stApp header {{
        height: 0px !important;
    }}
    </style>
    <div style="text-align: center; padding: 1rem 1rem 2rem 1rem;" class="animate-fade-in">
        <h1 style="font-size: 5rem; margin-bottom: 0rem;">🌙</h1>
        <h1 class="text-gradient" style="font-size: 4.5rem; margin-bottom: 0.5rem; line-height: 1.1;">Lumea</h1>
        <p style="color: {muted}; font-size: 1.4rem; max-width: 600px; margin: 0 auto 2.5rem auto; line-height: 1.6;">
            Your compassionate AI mental health companion. A safe, zero-judgment space to talk, track your mood, and find inner peace.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Get Started Button (Centered)
    col1, col2, col3 = st.columns([1, 0.8, 1])
    with col2:
        st.markdown("""
        <style>
        .stButton > button {
            font-family: 'Outfit', sans-serif !important;
            font-weight: 700 !important;
            font-size: 1.2rem !important;
            letter-spacing: 1.5px !important;
            text-transform: uppercase !important;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
            border-radius: 16px !important;
            padding: 0.8rem 1.5rem !important;
        }
        </style>
        """, unsafe_allow_html=True)
        
        if st.button("Get Started", use_container_width=True, key="get_started_btn"):
            st.session_state.page = "auth"
            st.rerun()
            
    # Features Section
    st.markdown("<div style='margin-top: 5rem;'></div>", unsafe_allow_html=True)
    
    f_col1, f_col2, f_col3 = st.columns(3)
    
    with f_col1:
        st.markdown(f"""
        <div class="feature-card animate-fade-in" style="animation-delay: 0.2s;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">💬</div>
            <h3 style="margin-bottom: 0.5rem;">Empathic Chat</h3>
            <p style="color: {muted}; font-size: 0.95rem;">Deep, reflective conversations designed to validate emotions and reduce stress in real-time.</p>
        </div>
        """, unsafe_allow_html=True)
        
    with f_col2:
        st.markdown(f"""
        <div class="feature-card animate-fade-in" style="animation-delay: 0.4s;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">📊</div>
            <h3 style="margin-bottom: 0.5rem;">Mood Analytics</h3>
            <p style="color: {muted}; font-size: 0.95rem;">Log feelings easily and view beautiful visual dashboards to spot cyclical triggers.</p>
        </div>
        """, unsafe_allow_html=True)
        
    with f_col3:
        st.markdown(f"""
        <div class="feature-card animate-fade-in" style="animation-delay: 0.6s;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">📓</div>
            <h3 style="margin-bottom: 0.5rem;">Secure Journal</h3>
            <p style="color: {muted}; font-size: 0.95rem;">A private, structured space to pen thoughts into structured digital archives safely.</p>
        </div>
        """, unsafe_allow_html=True)

    # Footer or extra buffer
    st.markdown("<div style='margin-top: 4rem;'></div>", unsafe_allow_html=True)
