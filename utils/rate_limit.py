import streamlit as st
from datetime import datetime

MAX_MESSAGES_PER_DAY = 100

def init_rate_limiter():
    """Initializes the rate limiter state variables."""
    if 'msg_count' not in st.session_state:
        st.session_state.msg_count = 0
    if 'last_msg_reset' not in st.session_state:
        st.session_state.last_msg_reset = datetime.now().strftime("%Y-%m-%d")

def check_and_reset_daily():
    """Resets count if the date has changed since last logged message."""
    init_rate_limiter()
    today = datetime.now().strftime("%Y-%m-%d")
    if st.session_state.last_msg_reset != today:
        st.session_state.msg_count = 0
        st.session_state.last_msg_reset = today

def get_message_count():
    """Returns today's message count."""
    check_and_reset_daily()
    return st.session_state.msg_count

def increment_message_count():
    """Increments the count by 1."""
    check_and_reset_daily()
    st.session_state.msg_count += 1

def is_rate_limited():
    """Returns True if user hit limit."""
    return get_message_count() >= MAX_MESSAGES_PER_DAY
