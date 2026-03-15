import streamlit as st

def view_auth():
    """Login and Registration View with Glassmorphism Design"""
    st.markdown("""
    <div style="text-align: center; margin-top: 5vh; margin-bottom: 3rem;" class="animate-fade-in">
        <h1 style="font-size: 4.5rem; margin-bottom: 0;">🌙</h1>
        <h1 class="text-gradient" style="font-size: 3.5rem;">Lumea</h1>
        <p style="color: #94a3b8; font-size: 1.2rem; letter-spacing: 0.5px;">Your Compassionate AI Companion</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1.2, 1])
    
    with col2:
        with st.container(border=True):
            
            tab1, tab2 = st.tabs(["🔐 Sign In", "✨ Sign Up"])
        
        supabase = st.session_state.get("supabase_client")
        
        with tab1:
            with st.form("login_form"):
                st.markdown("<h3 style='margin-bottom: 1.5rem;'>Welcome Back</h3>", unsafe_allow_html=True)
                email = st.text_input("Email", placeholder="Enter your email")
                password = st.text_input("Password", type="password", placeholder="Enter your password")
                
                st.markdown("<br>", unsafe_allow_html=True)
                submit = st.form_submit_button("Sign In ✨", use_container_width=True)
                
                if submit:
                    if not email or not password:
                        st.error("❌ Please enter both email and password")
                    elif supabase:
                        try:
                            with st.spinner("Authenticating..."):
                                response = supabase.auth.sign_in_with_password({
                                    "email": email,
                                    "password": password
                                })
                                if response and response.user:
                                    st.session_state.authenticated = True
                                    st.session_state.user = response.user
                                    st.session_state.page = "home"
                                    st.rerun()
                        except Exception as e:
                            st.error(f"❌ Login failed: Invalid credentials or setup.")
                    else:
                        st.error("⚠️ Supabase not configured. Using Demo Mode.")
                        st.session_state.authenticated = True
                        st.session_state.user = type('User', (), {"id": "demo", "email": "demo@lumea.ai"})()
                        st.session_state.page = "home"
                        st.rerun()
                        
        with tab2:
            with st.form("register_form"):
                st.markdown("<h3 style='margin-bottom: 1.5rem;'>Create Account</h3>", unsafe_allow_html=True)
                username = st.text_input("Username", placeholder="Choose a username")
                email = st.text_input("Email", placeholder="Enter your email")
                password = st.text_input("Password", type="password", placeholder="Create a password (min 8 chars)")
                confirm_password = st.text_input("Confirm Password", type="password", placeholder="Confirm your password")
                
                st.markdown("<br>", unsafe_allow_html=True)
                submit_reg = st.form_submit_button("Join Lumea 🌟", use_container_width=True)
                
                if submit_reg:
                    if password != confirm_password:
                        st.error("❌ Passwords do not match")
                    elif len(password) < 8:
                        st.error("❌ Password must be at least 8 characters")
                    elif supabase:
                        try:
                            with st.spinner("Creating account..."):
                                response = supabase.auth.sign_up({
                                    "email": email,
                                    "password": password,
                                    "options": {"data": {"username": username}}
                                })
                            st.success("✅ Account created! Please check your email to verify.")
                        except Exception as e:
                            st.error(f"❌ Registration failed. Ensure valid email.")
                    else:
                        st.error("⚠️ Supabase not configured.")
