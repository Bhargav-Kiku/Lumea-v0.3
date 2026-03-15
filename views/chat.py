import streamlit as st
import time
from components.sidebar import sidebar_nav
from utils.ai_client import analyze_emotion, get_groq_chat_stream, text_to_audio_bytes
from utils.supabase_client import create_chat_session, get_session_messages, save_chat_message

def init_chat_state():
    """Initializes chat history based on the selected session in the sidebar."""
    supabase = st.session_state.get("supabase_client")
    
    # Check if a specific session ID was requested
    session_id = st.session_state.get("current_chat_session_id")
    
    if session_id and supabase:
        # Load from DB
        messages = get_session_messages(supabase, session_id)
        if messages:
            # Reconstruct history mapping DB columns to our UI state
            history = []
            for msg in messages:
                history.append({
                    "role": msg["role"],
                    "content": msg["content"],
                    "emotion": msg.get("emotion"),
                    "score": msg.get("score")
                })
            st.session_state.chat_history = history
            return

    # Default / New Session state (Not saved to DB until first message)
    st.session_state.chat_history = [
        {"role": "assistant", "content": "Hi there. I'm Lumea, your mental health companion. How are you feeling today?"}
    ]

def view_chat():
    """Modern Streamlit Native Chat Interface with Emotion AI & Groq"""
    sidebar_nav()
    
    supabase = st.session_state.get("supabase_client")
    user = st.session_state.get("user")
    
    # Initialize history only if we just landed here (e.g. from sidebar nav click)
    if 'chat_history' not in st.session_state or st.session_state.get('reinit_chat'):
        init_chat_state()
        st.session_state.reinit_chat = False # Prevent reloading infinitely
        
    # We do a sneaky check: if the user clicked a history button in the sidebar, 
    # it changes `current_chat_session_id` but Streamlit's cache keeps `chat_history`.
    # Let's force a sync:
    if 'last_checked_session_id' not in st.session_state or st.session_state.last_checked_session_id != st.session_state.get("current_chat_session_id"):
        init_chat_state()
        st.session_state.last_checked_session_id = st.session_state.get("current_chat_session_id")
    
    st.markdown("""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>💬 Chat with <span class="text-gradient">Lumea</span></h2>
        <p style="color: #94a3b8;">I'm here to listen and support you. Take your time, and share what's on your mind.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Audio Settings
    c1, c2 = st.columns([8, 2])
    with c2:
        auto_read_audio = st.toggle("🔊 Read Replies Aloud", value=st.session_state.get('auto_read_audio', False), key="auto_read_audio")
    
    # Quick Replies below header (Only show if history is just the greeting)
    if len(st.session_state.chat_history) <= 1:
        qr_cols = st.columns(4)
        quick_replies = ["I'm feeling anxious", "I need someone to talk to", "Can you help me relax?", "I'm feeling better now"]
        for i, reply in enumerate(quick_replies):
            with qr_cols[i]:
                if st.button(reply, key=f"qr_{i}", help="Click to send this message instantly", use_container_width=True):
                    with st.spinner("Analyzing..."):
                        emotion_label, emotion_score = analyze_emotion(reply)
                        
                    st.session_state.chat_history.append({
                        "role": "user", 
                        "content": reply,
                        "emotion": emotion_label,
                        "score": emotion_score
                    })
                    
                    # Manage DB Session
                    ensure_session_exists_and_save(supabase, user, "user", reply, emotion_label, emotion_score)

                    st.session_state.pending_ai_response = True
                    st.rerun()

        st.markdown("<hr style='border-color: rgba(255,255,255,0.05); margin-bottom: 2rem;'>", unsafe_allow_html=True)

    # --- Chat Messages Rendering ---
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.chat_history:
            avatar = "🌙" if msg["role"] == "assistant" else "👤"
            with st.chat_message(msg["role"], avatar=avatar):
                st.markdown(msg["content"])
                
                # Render Emotion Badge
                if msg["role"] == "user" and msg.get("emotion"):
                    badge_html = f"""
                    <div style="display: inline-block; background: rgba(168, 85, 247, 0.15); 
                                border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; 
                                padding: 0.2rem 0.6rem; font-size: 0.8rem; color: #d8b4fe; 
                                margin-top: 0.5rem;">
                        {msg['emotion']} ({msg['score']}%)
                    </div>
                    """
                    st.markdown(badge_html, unsafe_allow_html=True)
                    
    # --- Check for pending AI generation (from quick replies) ---
    if st.session_state.get('pending_ai_response', False):
        st.session_state.pending_ai_response = False
        with chat_container:
            with st.chat_message("assistant", avatar="🌙"):
                last_user_msg = [m for m in st.session_state.chat_history if m["role"] == "user"][-1]
                ctx_emotion = last_user_msg.get("emotion")
                
                stream = get_groq_chat_stream(st.session_state.chat_history, current_emotion=ctx_emotion)
                full_response = st.write_stream(stream)
                
                st.session_state.chat_history.append({"role": "assistant", "content": full_response})
                ensure_session_exists_and_save(supabase, user, "assistant", full_response)
                
                # Auto-play audio if enabled
                if st.session_state.get('auto_read_audio'):
                    audio_fp = text_to_audio_bytes(full_response)
                    if audio_fp:
                        st.audio(audio_fp, format='audio/mp3', autoplay=True)

    # --- Standard Chat Input ---
    if prompt := st.chat_input("How are you feeling today?"):
        
        # 1. Analyze
        emotion_label, emotion_score = analyze_emotion(prompt)
        
        # 2. Append & Save DB User msg
        user_msg = {
            "role": "user", 
            "content": prompt,
            "emotion": emotion_label,
            "score": emotion_score
        }
        st.session_state.chat_history.append(user_msg)
        ensure_session_exists_and_save(supabase, user, "user", prompt, emotion_label, emotion_score)
        
        # 3. Optimistic UI update
        with chat_container:
            with st.chat_message("user", avatar="👤"):
                st.markdown(prompt)
                if emotion_label:
                    badge_html = f"""
                    <div style="display: inline-block; background: rgba(168, 85, 247, 0.15); 
                                border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; 
                                padding: 0.2rem 0.6rem; font-size: 0.8rem; color: #d8b4fe; 
                                margin-top: 0.5rem;">
                        {emotion_label} ({emotion_score}%)
                    </div>
                    """
                    st.markdown(badge_html, unsafe_allow_html=True)
                    
            # 4. Stream & Save DB AI Response
            with st.chat_message("assistant", avatar="🌙"):
                stream = get_groq_chat_stream(st.session_state.chat_history, current_emotion=emotion_label)
                full_response = st.write_stream(stream)
                
                # Auto-play audio if enabled
                if st.session_state.get('auto_read_audio'):
                    audio_fp = text_to_audio_bytes(full_response)
                    if audio_fp:
                        st.audio(audio_fp, format='audio/mp3', autoplay=True)
        
        st.session_state.chat_history.append({"role": "assistant", "content": full_response.strip()})
        ensure_session_exists_and_save(supabase, user, "assistant", full_response.strip())


def ensure_session_exists_and_save(supabase, user, role, content, emotion=None, score=None):
    """Helper to lazily create a DB session on first message and save the message."""
    if not supabase or not user:
        return
        
    s_id = st.session_state.get("current_chat_session_id")
    
    # If this is the first real message, make a new session
    if not s_id:
        title = "Chat: " + (content[:30] + "..." if len(content) > 30 else content)
        s_id = create_chat_session(supabase, user.id, title)
        st.session_state.current_chat_session_id = s_id
        
        # also save the very first greeting Lumea did, since we skipped it
        save_chat_message(supabase, s_id, "assistant", "Hi there. I'm Lumea, your mental health companion. How are you feeling today?")
        
    if s_id:
        save_chat_message(supabase, s_id, role, content, emotion, score)
