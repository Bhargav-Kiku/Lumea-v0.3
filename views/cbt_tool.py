import streamlit as st
from components.sidebar import sidebar_nav
from utils.ai import analyze_cognitive_distortion

def view_cbt_tool():
    """CBT Thought Record Visual Tool"""
    sidebar_nav()
    
    is_dark = st.session_state.get('theme', 'dark') == 'dark'
    text_color = "#f8fafc" if is_dark else "#1e293b"
    muted = "#94a3b8" if is_dark else "#64748b"
    
    st.markdown(f"""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>🧩 Mindset <span class="text-gradient">Reframe</span></h2>
        <p style="color: {muted};">Utilize Cognitive Behavioral Therapy (CBT) to challenge anxious thoughts with balanced perspectives.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Explain CBT
    with st.expander("ℹ️ What is a Thought Record?"):
        st.markdown(f"""
        <div style="color: {muted}; font-size: 0.9rem; line-height: 1.6;">
        Our minds sometimes fall into trapped patterns called <b>Cognitive Distortions</b>. 
        By recognizing them (e.g., Catastrophizing or Mind Reading), we can find room to breathe and reframe with kindness and facts.
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    col1, col2 = st.columns([1.2, 1], gap="large")
    
    with col1:
        st.markdown(f"<h4 style='color: {text_color}; margin-bottom: 1rem;'>1. Catch the Thought</h4>", unsafe_allow_html=True)
        
        with st.form("cbt_form"):
            trigger = st.text_input("What triggered this anxiety/stress?", placeholder="E.g., A work deadline, someone didn't reply...")
            automatic_thought = st.text_area("What is going through your mind? (Automatic Thought)", height=120, placeholder="E.g., I'm going to fail, I always mess things up...")
            
            submit_cbt = st.form_submit_button("🔍 Analyze Thought Pattern", use_container_width=True)
            
            if submit_cbt:
                if automatic_thought.strip():
                    with st.spinner("Lumea is analyzing the pattern..."):
                        # Call backend
                        result = analyze_cognitive_distortion(automatic_thought)
                        st.session_state.cbt_result = result
                        st.session_state.cbt_automatic_thought = automatic_thought
                        st.session_state.cbt_trigger = trigger
                else:
                    st.warning("⚠️ Please provide an Automatic Thought to analyze.")

    with col2:
        st.markdown(f"<h4 style='color: {text_color}; margin-bottom: 1rem;'>2. Reframe Perspective</h4>", unsafe_allow_html=True)
        
        if 'cbt_result' in st.session_state:
            res = st.session_state.cbt_result
            distortion = res.get('distortion', 'Thinking Pattern')
            description = res.get('description', '')
            reframe_prompt = res.get('reframe_prompt', '')
            
            st.markdown(f"""
            <div style="background: rgba(168, 85, 247, 0.08); border: 1.2px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem;" class="animate-fade-in">
                <span style="font-weight: 600; color: {"#9333ea" if not is_dark else "#d8b4fe"}; font-size: 1rem;">🎯 Pattern: {distortion}</span>
                <p style="color: {text_color}; font-size: 0.9rem; margin-top: 0.4rem; margin-bottom: 0.8rem;">{description}</p>
                <hr style="border-color: rgba(168,85,247,0.15); margin: 0.8rem 0;">
                <span style="font-weight: 500; font-style: italic; color: {muted}; font-size: 0.85rem;">💡 {reframe_prompt}</span>
            </div>
            """, unsafe_allow_html=True)
            
            with st.form("reframe_submit_form"):
                 reframe_input = st.text_area("Alternative, Balanced Thought", height=100, placeholder="E.g., It's a tight deadline, but I can do my best and ask for help...")
                 submit_reframe = st.form_submit_button("💾 Save Reframe to Journal & Ground", use_container_width=True)
                 if submit_reframe:
                     if reframe_input.strip():
                         # --- SAVE TO JOURNALS ---
                         supabase = st.session_state.get("supabase_client")
                         user_id = getattr(st.session_state.user, 'id', 'guest')
                         orig_thought = st.session_state.get('cbt_automatic_thought', '')
                         orig_trigger = st.session_state.get('cbt_trigger', 'A situation')
                         
                         cbt_content = f"**Anxious Trigger**: {orig_trigger}\n\n**Automatic Thought**: {orig_thought}\n\n**Detected Pattern**: {distortion}\n\n**Alternative Reframe**: {reframe_input}"
                         
                         if supabase and user_id != 'guest':
                             try:
                                 supabase.table('journal_entries').insert({
                                     "user_id": user_id,
                                     "title": f"🧩 CBT Reframe: {distortion}",
                                     "content": cbt_content,
                                     "is_private": True
                                 }).execute()
                                 st.success("✅ Thought grounded and saved to your Journal logs! Take a slow breath.")
                             except:
                                 st.error("❌ Failed to save to Journal.")
                         else:
                              st.success("✅ Thought grounded! (Saved in Demo mode). Take a slow breath.")
                              
                         if 'cbt_result' in st.session_state:
                             del st.session_state['cbt_result'] # reset
                     else:
                         st.warning("⚠️ Enter a kinder reframe to finish.")
        else:
            st.info("Input your automatic thought in Step 1 to generate analysis frame sheets.")
            
    st.markdown("<div style='margin-top: 3rem;'></div>", unsafe_allow_html=True)
