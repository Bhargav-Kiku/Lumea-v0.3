import streamlit as st
from components.sidebar import sidebar_nav
from utils.ai_client import get_journal_reflection

def view_journal():
    """Beautiful Journal view"""
    sidebar_nav()
    supabase = st.session_state.get("supabase_client")
    
    st.markdown("""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>📓 Your <span class="text-gradient">Journal</span></h2>
        <p style="color: #94a3b8;">A safe, private space to write down your thoughts and reflections.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([1.5, 1], gap="large")
    
    with col1:
        with st.container(border=True):
            st.markdown("<h3>New Entry</h3>", unsafe_allow_html=True)
        
        with st.form("journal_entry_form"):
            title = st.text_input("Title (optional)", placeholder="E.g., A peaceful morning...")
            content = st.text_area("Write freely here...", height=250)
            
            c_left, c_right = st.columns(2)
            with c_left:
                mood_before = st.selectbox("Mood Before (Optional)", ["", "😢 Very Bad", "😔 Bad", "😐 Neutral", "😊 Good", "😄 Very Good"])
            with c_right:
                mood_after = st.selectbox("Mood After (Optional)", ["", "😢 Very Bad", "😔 Bad", "😐 Neutral", "😊 Good", "😄 Very Good"])
                
            is_private = st.checkbox("Keep this entry private", value=True)
            
            submit_journal = st.form_submit_button("📝 Save Entry To Journal", use_container_width=True)
            
            if submit_journal:
                if content.strip():
                    user_id = getattr(st.session_state.user, 'id', "guest")
                    if supabase:
                        try:
                            supabase.table('journal_entries').insert({
                                "user_id": user_id,
                                "title": title,
                                "content": content,
                                "is_private": is_private
                            }).execute()
                            st.success("✅ Journal entry saved elegantly!")
                        except Exception:
                            st.error(f"❌ Failed to save. Database might be missing the table.")
                    else:
                        st.success("✅ Entry captured! (Demo Mode)")
                else:
                    st.warning("⚠️ Journals need content! Start typing something inside the big box.")
                    
    with col2:
        with st.container(border=True):
            st.markdown("<h3>Recent Leaves 🍃</h3>", unsafe_allow_html=True)
        
        entries = []
        user_id = getattr(st.session_state.user, 'id', "guest")
        if supabase:
            try:
                response = supabase.table('journal_entries').select("*").eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
                entries = response.data
            except:
                pass
                
        if entries:
            for entry in entries:
                date_str = entry.get('created_at', '')[:10]
                t = entry.get('title') if entry.get('title') else 'Untitled Reflection'
                c = entry.get('content', '')
                
                with st.expander(f"**{t}** — {date_str}"):
                    st.markdown(f"<div style='color:#cbd5e1; line-height: 1.6; margin-bottom: 0.8rem;'>{c}</div>", unsafe_allow_html=True)
                    
                    # AI Reflection with State Persistence
                    entry_id = entry.get('id', date_str)
                    ref_key = f"ai_reflection_{entry_id}"
                    
                    if st.button("🤖 AI Reflection", key=f"btn_{entry_id}", use_container_width=True):
                        with st.spinner("Generating reflection..."):
                            st.session_state[ref_key] = get_journal_reflection(c)
                    
                    if ref_key in st.session_state:
                         st.markdown(f"""
                         <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 8px; padding: 0.8rem; margin-top: 0.5rem;">
                             <span style="font-style: italic; color: #d8b4fe; font-size: 0.9rem;">✨ {st.session_state[ref_key]}</span>
                         </div>
                         """, unsafe_allow_html=True)
        else:
            st.info("Your journal is currently empty. Your first entry awaits!")
