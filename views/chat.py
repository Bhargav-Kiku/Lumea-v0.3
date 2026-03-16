import streamlit as st
import time
import base64
from components.sidebar import sidebar_nav
from utils.ai_client import analyze_emotion, get_groq_chat_stream, text_to_audio_bytes
from utils.supabase_client import create_chat_session, get_session_messages, save_chat_message
from utils.safety import is_self_harm_risk

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
    
    # Safety Support Warning
    if st.session_state.get('self_harm_warning_triggered', False):
        st.markdown("""
        <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="color: #ef4444; margin-top: 0;">🤝 You matter to us</h3>
            <p style="color: #fca5a5;">If you are feeling overwhelmed, please know that you are not alone. Consider reaching out for professional support or talking with friends and family.</p>
            <hr style="border-color: rgba(220, 38, 38, 0.2); margin: 1rem 0;">
            <p style="margin-bottom: 0.5rem; font-weight: 500; color: #fecaca;">📞 Helplines in India:</p>
            <ul style="margin-top: 0; padding-left: 1.5rem; color: #e2e8f0;">
                <li><b>Vandrevala Foundation:</b> <span style="color: #fca5a5;">9999 666 555</span> (24x7)</li>
                <li><b>AASRA:</b> <span style="color: #fca5a5;">9820466726</span> (24x7)</li>
                <li><b>Kiran:</b> <span style="color: #fca5a5;">1800-599-0019</span> (24x7)</li>
            </ul>
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
        from utils.rate_limit import is_rate_limited, increment_message_count
        
        for i, reply in enumerate(quick_replies):
            with qr_cols[i]:
                if st.button(reply, key=f"qr_{i}", help="Click to send this message instantly", use_container_width=True):
                    if is_rate_limited():
                        st.warning("⚠️ Daily Limit Reached: You have typed 100 messages for today.")
                        st.stop()
                    increment_message_count()
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
            if not st.session_state.get('self_harm_warning_triggered', False):
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
                            b64 = base64.b64encode(audio_fp.getvalue()).decode()
                            audio_html = f'''
                            <audio autoplay="true" style="display:none;">
                                <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
                            </audio>
                            <div class="speaking-animation">
                                🎙️ Lumea is speaking...
                            </div>
                            '''
                            st.markdown(audio_html, unsafe_allow_html=True)

    # === Voice Input Toolbar ===
    from streamlit_mic_recorder import mic_recorder
    from utils.ai_client import transcribe_audio_groq
    from utils.rate_limit import is_rate_limited, increment_message_count

    with st.container():
        c_mic, c_spacer = st.columns([1, 9])
        with c_mic:
            st.markdown("""
            <style>
            div[data-testid="stColumn"] .stMicRecorder button {
                border-radius: 50% !important;
                width: 42px !important;
                height: 42px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(168, 85, 247, 0.15) !important;
                border: 1px solid rgba(168, 85, 247, 0.4) !important;
                color: #d8b4fe !important;
                padding: 0 !important;
            }
            div[data-testid="stColumn"] .stMicRecorder button:hover {
                background: rgba(168, 85, 247, 0.25) !important;
            }
            </style>
            """, unsafe_allow_html=True)
            
            audio_state = mic_recorder(
                start_prompt="🎤",
                stop_prompt="⏹️",
                just_once=True,
                key="voice_input_mic"
            )

        if audio_state and audio_state.get('bytes'):
            if is_rate_limited():
                st.warning("⚠️ Daily Limit Reached: You have typed 100 messages for today.")
                st.stop()
                
            increment_message_count()
            st.write(f"🔬 **Debug**: Audio size: {len(audio_state['bytes'])} bytes")
            with st.spinner("🎙️ Transcribing voice..."):
                # mic_recorder returns bytes
                transcript = transcribe_audio_groq(audio_state['bytes'])
                
                if transcript and transcript.strip():
                    with st.spinner("Analyzing transcript..."):
                        emotion_label, emotion_score = analyze_emotion(transcript)
                        
                    # Check for self-harm risk
                    if is_self_harm_risk(transcript):
                        st.session_state.self_harm_warning_triggered = True
                      
                    user_msg = {
                        "role": "user", 
                        "content": transcript,
                        "emotion": emotion_label,
                        "score": emotion_score
                    }
                    st.session_state.chat_history.append(user_msg)
                    ensure_session_exists_and_save(supabase, user, "user", transcript, emotion_label, emotion_score)
                    st.session_state.pending_ai_response = True
                    st.rerun()
                else:
                    st.error("❌ Audio transcription failed or empty. Please speak clearly.")

    # --- Standard Chat Input ---
    from utils.rate_limit import is_rate_limited, increment_message_count
    
    if prompt := st.chat_input("How are you feeling today?"):
        
        if is_rate_limited():
            st.warning("⚠️ Daily Limit Reached: You have typed 100 messages for today. Reset will take place at midnight.")
            st.stop()
            
        # 1. Increment Rate Limiting count
        increment_message_count()
            
        # 1. Analyze
        emotion_label, emotion_score = analyze_emotion(prompt)
        
        # Check for self-harm risk
        if is_self_harm_risk(prompt):
            st.session_state.self_harm_warning_triggered = True
      
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
                
                if is_self_harm_risk(prompt):
                    st.markdown("""
                    <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.4); border-radius: 8px; padding: 1rem; margin: 0.5rem 0;">
                        <span style="color: #ef4444; font-weight: 500;">🤝 You matter to us.</span> Consider reaching out for support:
                        <br><b>Vandrevala:</b> 9999 666 555 | <b>AASRA:</b> 9820466726
                    </div>
                    """, unsafe_allow_html=True)
                    
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
            if not st.session_state.get('self_harm_warning_triggered', False):
                with st.chat_message("assistant", avatar="🌙"):
                    stream = get_groq_chat_stream(st.session_state.chat_history, current_emotion=emotion_label)
                    full_response = st.write_stream(stream)
                    
                    # Auto-play audio if enabled
                    if st.session_state.get('auto_read_audio'):
                        audio_fp = text_to_audio_bytes(full_response)
                        if audio_fp:
                            b64 = base64.b64encode(audio_fp.getvalue()).decode()
                            audio_html = f'''
                            <audio autoplay="true" style="display:none;">
                                <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
                            </audio>
                            <div class="speaking-animation">
                                🎙️ Lumea is speaking...
                            </div>
                            '''
                            st.markdown(audio_html, unsafe_allow_html=True)
        
        if not st.session_state.get('self_harm_warning_triggered', False):
            st.session_state.chat_history.append({"role": "assistant", "content": 'full_response' in locals() and full_response.strip() or ""})
            ensure_session_exists_and_save(supabase, user, "assistant", 'full_response' in locals() and full_response.strip() or "")

    # --- Global Reset for Next Cycle ---
    if st.session_state.get('self_harm_warning_triggered', False):
        st.session_state.self_harm_warning_triggered = False


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
