import streamlit as st
import pandas as pd
import plotly.express as px
from components.sidebar import sidebar_nav

def view_mood_tracker():
    """Enhanced Mood Tracker with Data Visualization"""
    sidebar_nav()
    supabase = st.session_state.get("supabase_client")
    
    st.markdown("""
    <div class="animate-fade-in" style="margin-bottom: 2rem;">
        <h2>📊 Mood <span class="text-gradient">Tracker</span></h2>
        <p style="color: #94a3b8;">Log your daily emotions and watch your progress unfold.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 1.2], gap="large")
    
    with col1:
        with st.container(border=True):
            st.markdown("<h3>Log Your Mood</h3>", unsafe_allow_html=True)
        
        # Mood Selection Grid
        mood_options = [
            ("😢", "Very Bad", 1),
            ("😔", "Bad", 2),
            ("😐", "Neutral", 3),
            ("😊", "Good", 4),
            ("😄", "Very Good", 5)
        ]
        
        st.write("How are you feeling right now?")
        m_cols = st.columns(5)
        
        if 'current_mood_selection' not in st.session_state:
            st.session_state.current_mood_selection = None
            
        for i, (emoji, label, value) in enumerate(mood_options):
            with m_cols[i]:
                is_selected = "✅" if st.session_state.current_mood_selection == value else ""
                if st.button(f"{emoji}\n\n{label} {is_selected}", key=f"mood_sel_{i}", help=label, use_container_width=True):
                    st.session_state.current_mood_selection = value
                    st.rerun()
                    
        st.markdown("<br>", unsafe_allow_html=True)
        
        with st.form("mood_entry_form"):
            note = st.text_area("What's on your mind? (Optional)", height=100)
            tags = st.text_input("Tags (e.g. work, health, family, hobbies)")
            
            submit_mood = st.form_submit_button("💾 Save Entry", use_container_width=True)
            if submit_mood:
                if st.session_state.current_mood_selection:
                    user_id = getattr(st.session_state.user, 'id', "guest")
                    if supabase:
                        try:
                            supabase.table('mood_entries').insert({
                                "user_id": user_id,
                                "mood": st.session_state.current_mood_selection,
                                "note": note,
                                "tags": tags
                            }).execute()
                            st.success("✅ Saved successfully!")
                            st.session_state.current_mood_selection = None # Reset
                            st.rerun()
                        except Exception as e:
                            st.error(f"❌ Failed to save. Database might be missing the table.")
                    else:
                        st.success("✅ Saved! (Demo mode)")
                        st.session_state.current_mood_selection = None
                        st.rerun()
                else:
                    st.warning("⚠️ Please select a mood emoji first.")
        
    with col2:
        with st.container(border=True):
            st.markdown("<h3>Mood Insights</h3>", unsafe_allow_html=True)
        
        # Fetching data for charts
        entries = []
        user_id = getattr(st.session_state.user, 'id', "guest")
        if supabase:
            try:
                response = supabase.table('mood_entries').select("*").eq('user_id', user_id).order('created_at', desc=False).execute()
                entries = response.data
            except:
                pass
                
        if entries:
            df = pd.DataFrame(entries)
            df['created_at'] = pd.to_datetime(df['created_at']).dt.date
            
            # Simple aggregation per day if multiple entries exist
            daily_mood = df.groupby('created_at')['mood'].mean().reset_index()
            
            fig = px.line(
                daily_mood, 
                x="created_at", 
                y="mood", 
                markers=True,
                title="Your Emotional Journey",
                labels={"created_at": "Date", "mood": "Average Mood Score (1-5)"},
                color_discrete_sequence=["#a855f7"]
            )
            
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font_color="#f8fafc",
                xaxis=dict(showgrid=False),
                yaxis=dict(showgrid=True, gridcolor="rgba(148, 163, 184, 0.1)", range=[0.5, 5.5], dtick=1)
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Recent Entries Mini-List
            st.markdown("**Recent Entries**")
            for entry in entries[-3:]:
                display_emoji = mood_options[entry['mood']-1][0]
                st.markdown(f"*{str(entry['created_at'])[:10]}* - {display_emoji} {entry.get('note','')}")
                
        else:
            st.info("📉 Not enough data yet to generate insights. Start logging your mood to see trends here!")
