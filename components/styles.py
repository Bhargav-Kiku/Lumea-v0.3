def get_breathing_css():
    """Returns CSS styles for the breathing page. Contains pulsing nodes and labels."""
    return """
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
    
    @keyframes box-breathing {
        0%, 100% { transform: scale(1.0); }
        25% { transform: scale(1.4); }
        50% { transform: scale(1.4); }
        75% { transform: scale(1.0); }
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
    """

def get_landing_css():
    """Returns static CSS layout framing for the landing splash page."""
    return """
    <style>
    div[data-testid="stVerticalBlock"] > div:first-child .block-container {
        padding-top: 1rem !important;
    }
    .stApp header {
        height: 0px !important;
    }
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
    .firefly {
        position: fixed;
        border-radius: 50%;
        background: #facc15;
        box-shadow: 0 0 8px #facc15, 0 0 15px #eab308, 0 0 22px rgba(250, 204, 21, 0.4);
        opacity: 0.5;
        pointer-events: none;
        z-index: 100;
    }
    @keyframes twinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.8); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    </style>
    """
