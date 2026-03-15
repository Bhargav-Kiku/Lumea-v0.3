import streamlit as st
import time
from components.sidebar import sidebar_nav
from utils.ai_client import analyze_emotion, get_groq_chat_stream

def view_chat():
    """Modern Streamlit Native Chat Interface with Emotion AI & Groq"""
    sidebar_nav()
    
    st.markdown("""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>💬 Chat with <span class="text-gradient">Lumea</span></h2>
        <p style="color: #94a3b8;">I'm here to listen and support you. Take your time, and share what's on your mind.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Quick Replies below header
    qr_cols = st.columns(4)
    quick_replies = ["I'm feeling anxious", "I need someone to talk to", "Can you help me relax?", "I'm feeling better now"]
    for i, reply in enumerate(quick_replies):
        with qr_cols[i]:
            if st.button(reply, key=f"qr_{i}", help="Click to send this message instantly", use_container_width=True):
                # Analyze emotion instantly
                with st.spinner("Analyzing..."):
                    emotion_label, emotion_score = analyze_emotion(reply)
                    
                st.session_state.chat_history.append({
                    "role": "user", 
                    "content": reply,
                    "emotion": emotion_label,
                    "score": emotion_score
                })
                
                # We trigger a rerun to immediately render user msg, 
                # but we set a flag to generate the AI response on the next run
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
                
                # Render Emotion Badge for User messages
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
                # Get the last emotion to pass as context
                last_user_msg = [m for m in st.session_state.chat_history if m["role"] == "user"][-1]
                ctx_emotion = last_user_msg.get("emotion")
                
                stream = get_groq_chat_stream(st.session_state.chat_history, current_emotion=ctx_emotion)
                full_response = st.write_stream(stream)
                
                st.session_state.chat_history.append({"role": "assistant", "content": full_response})
                st.rerun()

    # --- Standard Chat Input ---
    if prompt := st.chat_input("How are you feeling today?"):
        
        # 1. Analyze Emotion via Hugging Face
        emotion_label, emotion_score = analyze_emotion(prompt)
        
        # 2. Append User Message
        user_msg = {
            "role": "user", 
            "content": prompt,
            "emotion": emotion_label,
            "score": emotion_score
        }
        st.session_state.chat_history.append(user_msg)
        
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
                    
            # 4. Stream AI Response via Groq
            with st.chat_message("assistant", avatar="🌙"):
                stream = get_groq_chat_stream(st.session_state.chat_history, current_emotion=emotion_label)
                full_response = st.write_stream(stream)
        
        # 5. Append AI reply
        st.session_state.chat_history.append({"role": "assistant", "content": full_response.strip()})
        st.rerun()
