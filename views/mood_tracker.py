import streamlit as st
import pandas as pd
import plotly.express as px
from components.sidebar import sidebar_nav

def view_mood_tracker():
    """Enhanced Mood Tracker with Data Visualization"""
    sidebar_nav()
    supabase = st.session_state.get("supabase_client")
    
    is_light = st.session_state.get('theme', 'dark') == 'light'
    muted = "#64748b" if is_light else "#94a3b8"
    text_color = "#1e293b" if is_light else "#f8fafc"
    
    st.markdown(f"""
    <div class="animate-fade-in" style="margin-bottom: 1.5rem;">
        <h2>📊 Mood <span class="text-gradient">Tracker</span></h2>
        <p style="color: {muted};">Log your daily emotions and watch your progress unfold.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([1.2, 1.2], gap="large")
    
    with col1:
        st.markdown(f"<h3 style='margin-bottom: 0.5rem; color: {text_color};'>Log Your Mood</h3>", unsafe_allow_html=True)
        st.markdown(f"<p style='color: {muted}; font-size: 0.95rem; margin-bottom: 1.5rem;'>How are you feeling right now?</p>", unsafe_allow_html=True)
        
        # Mood Selection Grid
        mood_options = [
            ("😢", "Very Bad", 1),
            ("😔", "Bad", 2),
            ("😐", "Neutral", 3),
            ("😊", "Good", 4),
            ("😄", "Very Good", 5)
        ]
        
        if 'current_mood_selection' not in st.session_state:
            st.session_state.current_mood_selection = None
            
        # Inject CSS specifically for these 5 buttons to make them tall cards
        st.markdown("""
        <style>
        /* Target buttons inside the columns */
        [data-testid="stHorizontalBlock"] .stButton > button {
            height: 120px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            border-radius: 18px !important;
            border: 1.8px solid rgba(148, 163, 184, 0.2) !important;
            background: rgba(255, 255, 255, 0.03) !important;
            transition: all 0.3s ease !important;
            padding: 1rem 0 !important;
        }
        
        /* Light mode variations */
        .stApp[data-theme="light"] [data-testid="stHorizontalBlock"] .stButton > button {
            background: rgba(255, 255, 255, 0.6) !important;
            border-color: rgba(148, 163, 184, 0.4) !important;
        }

        [data-testid="stHorizontalBlock"] .stButton > button:hover {
            transform: translateY(-4px) !important;
            border-color: rgba(168, 85, 247, 0.5) !important;
            box-shadow: 0 8px 20px rgba(168, 85, 247, 0.15) !important;
            background: rgba(168, 85, 247, 0.05) !important;
        }
        
        /* Highlight selected button */
        .selected-mood button {
            border-color: #a855f7 !important;
            background: rgba(168, 85, 247, 0.12) !important;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.25) !important;
        }
        </style>
        """, unsafe_allow_html=True)
        
        m_cols = st.columns(5)
        for i, (emoji, label, value) in enumerate(mood_options):
            with m_cols[i]:
                is_selected = st.session_state.current_mood_selection == value
                
                # Wrap button in a div with .selected-mood class if it's the active one
                if is_selected:
                    st.markdown('<div class="selected-mood">', unsafe_allow_html=True)
                
                # Combine emoji and label inside button
                btn_label = f"{emoji}\n\n{label}"
                if st.button(btn_label, key=f"mood_sel_{i}", use_container_width=True):
                    st.session_state.current_mood_selection = value
                    st.rerun()
                    
                if is_selected:
                    st.markdown('</div>', unsafe_allow_html=True)
                    
        st.markdown("<br>", unsafe_allow_html=True)
        
        with st.form("mood_entry_form"):
            note = st.text_area("What's on your mind? (Optional)", height=90, placeholder="Write a brief note...")
            tags = st.text_input("Tags", placeholder="e.g. work, family, hobbies")
            
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
                            st.session_state.current_mood_selection = None
                            st.rerun()
                        except:
                            st.error(f"❌ Failed to save.")
                    else:
                        st.success("✅ Saved! (Demo mode)")
                        st.session_state.current_mood_selection = None
                        st.rerun()
                else:
                    st.warning("⚠️ Please select a mood emoji first.")
        
    with col2:
        st.markdown(f"<h3 style='margin-bottom: 1rem; color: {text_color};'>Mood Insights</h3>", unsafe_allow_html=True)
        
        entries = []
        user_id = getattr(st.session_state.user, 'id', "guest")
        if supabase:
            try:
                response = supabase.table('mood_entries').select("*").eq('user_id', user_id).order('created_at', desc=False).execute()
                entries = response.data
            except:
                pass
                
        # Inject Mock data for Guests so dashboard doesn't look barren
        if not entries and user_id == "guest":
            from datetime import datetime, timedelta
            today = datetime.now()
            entries = [
                {"created_at": (today - timedelta(days=4)).isoformat(), "mood": 2, "note": "Bit stressed at work", "tags": "work"},
                {"created_at": (today - timedelta(days=3)).isoformat(), "mood": 3, "note": "Feeling average", "tags": "health"},
                {"created_at": (today - timedelta(days=2)).isoformat(), "mood": 4, "note": "Great workout!", "tags": "fitness"},
                {"created_at": (today - timedelta(days=1)).isoformat(), "mood": 5, "note": "Weekend vibe!", "tags": "social"},
                {"created_at": today.isoformat(), "mood": 4, "note": "Starting fresh", "tags": "morning"}
            ]

        if entries:
            df = pd.DataFrame(entries)
            df['created_at'] = pd.to_datetime(df['created_at']).dt.date
            daily_mood = df.groupby('created_at')['mood'].mean().reset_index()
            
            fig = px.line(
                daily_mood, 
                x="created_at", 
                y="mood", 
                markers=True,
                labels={"created_at": "Date", "mood": "Mood Score"},
                color_discrete_sequence=["#a855f7"]
            )
            
            grid_c = "rgba(148, 163, 184, 0.15)" if is_light else "rgba(255, 255, 255, 0.05)"
            
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font_color=text_color,
                xaxis=dict(type='category', showgrid=False, title=None),
                yaxis=dict(
                    showgrid=True, 
                    gridcolor=grid_c, 
                    range=[0.7, 5.3], 
                    dtick=1,
                    tickmode='array',
                    tickvals=[1, 2, 3, 4, 5],
                    ticktext=['😢', '😔', '😐', '😊', '😄']
                ),
                margin=dict(l=40, r=20, t=10, b=40),
                hovermode="x unified"
            )
            
            # Display Dashboard Style Graph in a container
            with st.container(border=True):
                st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
            
            # Recent Entries Mini-List
            st.markdown(f"<h4 style='color: {text_color}; margin-bottom: 0.8rem;'>Recent Moments</h4>", unsafe_allow_html=True)
            
            for entry in list(reversed(entries))[:3]:
                display_emoji = mood_options[int(entry['mood'])-1][0]
                dt = pd.to_datetime(entry['created_at'])
                date_str = dt.strftime("%Y-%m-%d %H:%M")
                note_str = entry.get('note','') or "No notes added"
                tags_str = entry.get('tags','')
                
                # Standard left-aligned or fully dedented string prevents Markdown code-blocks
                moment_html = f"""<div style="background: {"rgba(255,255,255,0.5)" if is_light else "rgba(255,255,255,0.03)"}; border: 1.5px solid {"rgba(148,163,184,0.3)" if is_light else "rgba(255,255,255,0.05)"}; border-radius: 12px; padding: 0.8rem; margin-bottom: 0.6rem;">
<div style="display: flex; align-items: center; gap: 0.8rem;">
<div style="font-size: 1.5rem;">{display_emoji}</div>
<div style="flex: 1;">
<p style="margin: 0; font-weight: 500; font-size: 0.9rem; color: {text_color};">{note_str}</p>
<span style="font-size: 0.75rem; color: {muted};">{date_str}</span>
{f'<span style="background: rgba(168, 85, 247, 0.12); color: #a855f7; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 8px; margin-left: 0.5rem;">#{tags_str}</span>' if tags_str else ''}
</div>
</div>
</div>"""
                st.markdown(moment_html, unsafe_allow_html=True)
                
        else:
            st.info("Log your daily mood choices to populate visualization stats here!")
