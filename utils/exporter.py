import pandas as pd

def export_mood_data(supabase, user_id: str):
    """
    Fetches mood entries and returns a CSV string for download buffers.
    """
    if not supabase or user_id == 'guest':
        return None
        
    try:
        response = supabase.table('mood_entries').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        if response.data:
            df = pd.DataFrame(response.data)
            # Clean up system IDs 
            cols_to_drop = [c for c in ['user_id', 'id'] if c in df.columns]
            if cols_to_drop:
                df = df.drop(columns=cols_to_drop)
            return df.to_csv(index=False)
    except Exception as e:
        print(f"Export Mood Error: {e}")
    return None

def export_journal_data(supabase, user_id: str):
    """
    Fetches journal entries and returns a CSV string for download buffers.
    """
    if not supabase or user_id == 'guest':
        return None
        
    try:
        response = supabase.table('journal_entries').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        if response.data:
            df = pd.DataFrame(response.data)
            cols_to_drop = [c for c in ['user_id', 'id'] if c in df.columns]
            if cols_to_drop:
                df = df.drop(columns=cols_to_drop)
            return df.to_csv(index=False)
    except Exception as e:
        print(f"Export Journal Error: {e}")
    return None
