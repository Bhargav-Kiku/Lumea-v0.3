"""
Safety utilities for detecting self-harm risk and providing helpline information.
"""

# List of keywords indicating self-harm risk
SELF_HARM_KEYWORDS = [
    "kill myself", "killing myself",
    "suicide",
    "end my life", "ending my life", "take my life", "taking my life",
    "want to die", "wanna die",
    "better off dead",
    "harm myself", "harming myself",
    "cut myself", "cutting myself",
    "hurt myself", "hurting myself",
    "overdose",
    "hang myself", "hanging myself",
    "jump off a bridge", "jumping off",
    "self harm",
    "no reason to live",
    "tired of living", "done with life"
]

# Indian Helplines constants
INDIAN_HELPLINES = [
    {"name": "Vandrevala Foundation", "number": "9999 666 555", "hours": "24x7"},
    {"name": "AASRA", "number": "9820466726", "hours": "24x7"},
    {"name": "Kiran (Mental Health Helpline)", "number": "1800-599-0019", "hours": "24x7"}
]

def is_self_harm_risk(text: str) -> bool:
    """
    Checks if the given text contains any keywords related to self-harm.
    """
    if not text:
        return False
        
    text_lower = text.lower().strip()
    
    for word in SELF_HARM_KEYWORDS:
        if word in text_lower:
            return True
            
    return False
