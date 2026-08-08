'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function MindsetReframePage() {
  const [step, setStep] = useState(1);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);
  const [trigger, setTrigger] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedDistortion, setDetectedDistortion] = useState(null);
  
  const [reframeInput, setReframeInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (step === 3 && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, step]);

  const startChat = async () => {
    if (!automaticThought.trim()) return;
    setStep(3);
    setLoading(true);
    
    // Initial system prompt implicitly handles the context, we just send a starting message
    const initialMsgs = [{ role: 'user', content: 'I want to reframe this thought.' }];
    
    try {
      const response = await fetch('/api/cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: initialMsgs,
          trigger,
          automatic_thought: automaticThought
        })
      });

      const data = await response.json();
      setMessages([...initialMsgs, { role: 'assistant', content: data.reply }]);
      if (data.detected_distortion) {
        setDetectedDistortion(data.detected_distortion);
      }
    } catch (err) {
      console.error("CBT API Error:", err);
      setMessages([...initialMsgs, { role: 'assistant', content: "I'm here to help. What makes you feel this way?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg = { role: 'user', content: chatInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          trigger,
          automatic_thought: automaticThought
        })
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      if (data.detected_distortion) {
        setDetectedDistortion(data.detected_distortion);
      }
    } catch (err) {
      console.error("CBT API Error:", err);
      setMessages([...newMessages, { role: 'assistant', content: "Could you tell me more about that?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReframe = async (e) => {
    e.preventDefault();
    if (!reframeInput.trim()) return;

    setSaveLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const distortionText = detectedDistortion || 'Unidentified Pattern';
      const cbtContent = `**Anxious Trigger**: ${trigger}\n\n**Automatic Thought**: ${automaticThought}\n\n**Detected Pattern**: ${distortionText}\n\n**Alternative Reframe**: ${reframeInput}`;

      const { error } = await supabase.from('journal_entries').insert({
        user_id: user ? user.id : 'guest',
        title: `🧩 CBT Reframe: ${distortionText}`,
        content: cbtContent,
        mood_before: moodBefore,
        mood_after: moodAfter,
        is_private: true
      });

      if (error) throw error;
      setStep(6); // Success step
      setMessage("✅ Thought grounded and saved to your Journal!");
    } catch (err) {
      console.error("Error saving CBT reframe:", err);
      setMessage("❌ Failed to save to Journal.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper for sliders
  const moodLabels = {
    1: "Calm / Baseline",
    2: "Mildly Uneasy",
    3: "Moderately Anxious",
    4: "Highly Distressed",
    5: "Overwhelmed / Panic"
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '42rem', margin: '0 auto', color: theme.colors.foreground, fontFamily: "'Manrope', sans-serif" }}>
      
      <div style={{
        position: 'absolute', top: '10%', right: '-10%', width: '300px', height: '300px', background: theme.colors.tertiary,
        filter: 'blur(120px)', opacity: 0.05, borderRadius: '50%', zIndex: -1
      }}></div>

      <PageHeader 
        title="Mindset"
        subtitle="Reframe"
        description="Step into the light of clarity. Let's gently explore the shadows of your thoughts through guided reflection."
      />

      <GlassCard style={{ padding: '2rem', minHeight: '400px', transition: 'all 0.4s ease' }}>
        
        {/* STEP 1: PRE-MOOD */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: theme.colors.primary }}>1. Grounding</h3>
            <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '2rem' }}>Before we begin, how intense is your distress right now?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <span style={{ fontSize: '3rem' }}>{['😌', '🤔', '😟', '😨', '😫'][moodBefore - 1]}</span>
              <p style={{ fontWeight: '600', color: theme.colors.primary }}>{moodLabels[moodBefore]}</p>
              <input 
                type="range" min="1" max="5" value={moodBefore} 
                onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                style={{ width: '80%', cursor: 'pointer', accentColor: theme.colors.primary }}
              />
            </div>

            <button onClick={() => setStep(2)} style={primaryBtnStyle}>Next Step <span className="material-symbols-outlined">arrow_forward</span></button>
          </div>
        )}

        {/* STEP 2: CATCH THE THOUGHT */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: theme.colors.primary }}>2. Catch the Thought</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>What triggered this anxiety/stress?</label>
                <textarea 
                  style={inputStyle} placeholder="e.g., A missed deadline, a difficult conversation..." rows="2"
                  value={trigger} onChange={(e) => setTrigger(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>What is the specific thought going through your mind?</label>
                <textarea 
                  style={inputStyle} placeholder="e.g., I'm not good enough, everything is ruined..." rows="3"
                  value={automaticThought} onChange={(e) => setAutomaticThought(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(1)} style={secondaryBtnStyle}>Back</button>
              <button onClick={startChat} disabled={!automaticThought.trim() || loading} style={primaryBtnStyle}>
                {loading ? 'Analyzing...' : 'Explore This Thought'} <span className="material-symbols-outlined">psychology</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOCRATIC CHAT */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.colors.primary }}>3. Reflection</h3>
              {detectedDistortion && (
                <div style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span>
                  {detectedDistortion} Detected
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    padding: '1rem', 
                    borderRadius: '1rem', 
                    backgroundColor: msg.role === 'user' ? theme.colors.primaryContainer : theme.colors.surfaceContainerHighest,
                    color: msg.role === 'user' ? theme.colors.onPrimaryContainer : theme.colors.foreground,
                    borderBottomRightRadius: msg.role === 'user' ? '0.2rem' : '1rem',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '0.2rem' : '1rem',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', padding: '1rem', color: theme.colors.onSurfaceVariant }}>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite' }}>sync</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <input 
                type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your response..."
                style={{ flex: 1, ...inputStyle, padding: '1rem' }}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !chatInput.trim()} style={{ ...primaryBtnStyle, width: 'auto', padding: '0 1.5rem' }}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: `1px solid ${theme.colors.glassBorder}`, paddingTop: '1rem' }}>
              <button onClick={() => setStep(4)} style={{ ...secondaryBtnStyle, width: '100%', borderColor: theme.colors.primary, color: theme.colors.primary }}>
                I'm Ready to Reframe <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REFRAME */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: theme.colors.primary }}>4. The Reframe</h3>
            <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '2rem' }}>Based on our discussion, how can you look at this situation in a more balanced, realistic way?</p>
            
            <textarea 
              style={{ ...inputStyle, minHeight: '120px', marginBottom: '2rem' }} 
              placeholder="Write your new, balanced perspective here..." 
              value={reframeInput} onChange={(e) => setReframeInput(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(3)} style={secondaryBtnStyle}>Back to Chat</button>
              <button onClick={() => setStep(5)} disabled={!reframeInput.trim()} style={primaryBtnStyle}>
                Next <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: POST-MOOD */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: theme.colors.primary }}>5. Reflection</h3>
            <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '2rem' }}>Check in with yourself again. How intense is your distress now?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <span style={{ fontSize: '3rem' }}>{['😌', '🤔', '😟', '😨', '😫'][moodAfter - 1]}</span>
              <p style={{ fontWeight: '600', color: theme.colors.primary }}>{moodLabels[moodAfter]}</p>
              <input 
                type="range" min="1" max="5" value={moodAfter} 
                onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                style={{ width: '80%', cursor: 'pointer', accentColor: theme.colors.primary }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep(4)} style={secondaryBtnStyle}>Back</button>
              <button onClick={handleSaveReframe} disabled={saveLoading} style={primaryBtnStyle}>
                <span className="material-symbols-outlined">save</span>
                {saveLoading ? 'Saving...' : 'Save & Ground'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SUCCESS */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', animation: 'fadeIn 0.5s ease-in-out', textAlign: 'center' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: theme.colors.primaryContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: theme.colors.primary }}>check_circle</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: theme.colors.primary }}>Perspective Shifted</h3>
            <p style={{ color: theme.colors.onSurfaceVariant, marginBottom: '2rem' }}>Your new, balanced perspective has been securely saved to your journal.</p>
            {moodBefore > moodAfter && (
              <p style={{ color: theme.colors.secondary, fontWeight: '700', marginBottom: '2rem' }}>
                You reduced your distress level from {moodBefore} to {moodAfter}. Great job!
              </p>
            )}
            <button onClick={() => {
              setStep(1); setTrigger(''); setAutomaticThought(''); setMessages([]); setReframeInput(''); setDetectedDistortion(null); setMoodBefore(3); setMoodAfter(3);
            }} style={secondaryBtnStyle}>
              Start Another Reflection
            </button>
          </div>
        )}

      </GlassCard>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:hover:not(:disabled) {
          transform: translateY(-3px);
          filter: brightness(1.15);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        button:active:not(:disabled) {
          transform: translateY(1px);
        }
        button {
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
    </div>
  );
}

// Reusable Styles
const inputStyle = {
  width: '100%', 
  backgroundColor: 'var(--glass-bg, rgba(255, 255, 255, 0.05))', 
  border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.1))', 
  borderRadius: '0.75rem', 
  padding: '1rem', 
  color: 'inherit', 
  outline: 'none',
  transition: 'border-color 0.3s'
};

const labelStyle = {
  fontSize: '0.8rem', 
  fontWeight: '600', 
  color: 'var(--muted, #a0a0b0)', 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em'
};

const primaryBtnStyle = {
  flex: 1,
  padding: '1rem', 
  borderRadius: '2rem', 
  background: 'var(--primary, #6b8afc)', 
  color: '#fff',
  fontWeight: '700', 
  fontSize: '1rem', 
  border: 'none', 
  cursor: 'pointer',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '0.5rem',
  boxShadow: '0 4px 14px var(--primary-glow, rgba(107, 138, 252, 0.3))',
  transition: 'all 0.2s'
};

const secondaryBtnStyle = {
  flex: 1,
  padding: '1rem', 
  borderRadius: '2rem', 
  background: 'transparent',
  border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.1))',
  color: 'var(--muted, #a0a0b0)',
  fontWeight: '700', 
  fontSize: '1rem', 
  cursor: 'pointer',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '0.5rem',
  transition: 'all 0.2s'
};
