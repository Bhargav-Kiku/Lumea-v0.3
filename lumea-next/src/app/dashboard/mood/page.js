'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);

  const moodOptions = [
    { value: 1, label: "Calm", icon: "flare", color: theme.colors.primary, glow: "rgba(186,195,255,0.4)" },
    { value: 2, label: "Joyful", icon: "wb_sunny", color: theme.colors.tertiary, glow: "rgba(241,231,255,0.4)" },
    { value: 3, label: "Anxious", icon: "grain", color: theme.colors.secondary, glow: "rgba(129, 140, 248, 0.4)" },
    { value: 4, label: "Sad", icon: "water_drop", color: "#b0bbff", glow: "rgba(176,187,255,0.4)" }
  ];

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10); 

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (err) {
      console.error("Error fetching mood entries:", err);
      setRecentEntries([
        { created_at: new Date().toISOString(), mood: 2, note: "Starting fresh on the new app!", tags: "morning" },
        { created_at: new Date(Date.now() - 86400000).toISOString(), mood: 1, note: "Feeling centered today.", tags: "health" },
        { created_at: new Date(Date.now() - 172800000).toISOString(), mood: 3, note: "A bit nervous about work.", tags: "work" }
      ]);
    }
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      alert("Please select your inner state first.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('mood_entries').insert({
        user_id: user ? user.id : 'guest',
        mood: selectedMood,
        note: note,
        tags: tags
      });

      if (error) throw error;

      setMessage("✅ Entry recorded into your galaxy.");
      setSelectedMood(null);
      setNote('');
      setTags('');
      fetchRecentEntries();
    } catch (err) {
      console.error("Error saving mood:", err);
      setMessage("❌ Failed to save. Database might be missing the table.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      {/* Background Decor Elements - Atmospheric Auroras */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: theme.colors.primaryContainer, filter: 'blur(150px)', opacity: 0.1, zIndex: -1, top: '-5rem', right: '-5rem', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: theme.colors.accent, filter: 'blur(120px)', opacity: 0.08, zIndex: -1, bottom: '10%', left: '-5rem', pointerEvents: 'none' }}></div>
      
      {/* Header */}
      <PageHeader 
        title="How is your"
        subtitle="inner sky"
        description="Take a moment to center yourself. Your emotions are like shifting stars; let's map them together in your celestial sanctuary."
      />

      {/* Bento Grid */}
      <div className="bento-grid" style={{ gap: '3rem', marginBottom: '5rem' }}>
        
        {/* Column 1: Record Mood (8 Col) */}
        <div className="bento-8">
          <GlassCard style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', color: theme.colors.foreground }}>Select Your Current State</h2>
            
            {/* Mood Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {moodOptions.map((opt) => {
                const isActive = selectedMood === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMood(opt.value)}
                    type="button"
                    style={{
                      height: '140px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      border: isActive ? `1px solid ${opt.color}` : `1px solid ${theme.colors.glassBorder}`,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.6)',
                      borderRadius: theme.borderRadius.lg,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? `0 0 20px ${opt.glow}` : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%', 
                      background: `radial-gradient(circle, ${opt.glow} 0%, transparent 70%)`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: isActive ? opt.color : theme.colors.outline, transition: 'color 0.3s ease' }}>{opt.icon}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? opt.color : theme.colors.muted, transition: 'color 0.3s ease' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Section */}
            <form onSubmit={handleSaveMood}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: '500', color: theme.colors.foreground }}>What's illuminating this feeling?</label>
              <textarea 
                placeholder="A brief note on your journey..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  border: `1px solid ${theme.colors.glassBorder}`, 
                  borderRadius: theme.borderRadius.md, 
                  padding: '1.5rem', 
                  color: theme.colors.foreground, 
                  fontSize: '1.05rem', 
                  lineHeight: '1.6', 
                  minHeight: '120px', 
                  resize: 'none', 
                  marginBottom: '1rem',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ 
                  background: 'linear-gradient(135deg, #3c4b9e 0%, #293676 100%)', 
                  border: 'none', 
                  borderRadius: '30px', 
                  padding: '1.2rem 2.5rem', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '1.1rem', 
                  cursor: 'pointer', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {loading ? 'Recording...' : 'Record Entry'}
                </button>
              </div>
              {message && <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'right', color: message.startsWith('✅') ? theme.colors.accent : '#ef4444', fontWeight: '600' }}>{message}</p>}
            </form>
          </GlassCard>
        </div>

        {/* Column 2: Side Insights (4 Col) */}
        <div className="bento-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Luminous Streak */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.3)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem' }}>Luminous Streak</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: '800', color: '#bac3ff', lineHeight: 0.9 }}>12</span>
              <span style={{ fontSize: '1rem', fontWeight: '500', color: '#94a3b8', paddingBottom: '0.4rem' }}>days of mindful tracking</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>You're building a beautiful pattern of self-awareness. Keep shining.</p>
          </div>

          {/* Daily Reflection Mockup */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.3)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '20px', 
            padding: '2.5rem', 
            border: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            flex: 1
          }}>
            <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80" alt="Nebula" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', height: '100%', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#f1e7ff' }}>auto_awesome</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>Daily Reflection</h3>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#d6c9ee', lineHeight: '1.6' }}>"The moon does not fight the darkness; it simply shines within it."</p>
              <button style={{ background: 'none', border: 'none', color: '#bac3ff', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', marginTop: '0.5rem' }}>Read More</button>
            </div>
          </div>

        </div>
      </div>

      {/* Galaxy Chart Section (12 Col) */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Your Mood Galaxy</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>The constellations of your emotional history over the last 30 days.</p>
          </div>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '30px', padding: '0.3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button style={{ background: 'linear-gradient(135deg, #3c4b9e 0%, #293676 100%)', color: '#fff', border: 'none', borderRadius: '20px', padding: '0.6rem 1.8rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>Monthly</button>
            <button style={{ background: 'none', color: '#94a3b8', border: 'none', borderRadius: '20px', padding: '0.6rem 1.8rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Weekly</button>
          </div>
        </div>

        {/* Canvas Area */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: '24px', 
          border: '1px solid rgba(255,255,255,0.04)',
          minHeight: '450px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        }}>
          {/* Central Glow Orb */}
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(186,195,255,0.05)', filter: 'blur(80px)', zIndex: 0 }}></div>

          {/* Rendering the "Stars" mapped from recentEntries. */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', minHeight: '350px' }}>
            {recentEntries.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>Record your first star to ignite your galaxy.</p>
              </div>
            ) : (
              recentEntries.map((entry, idx) => {
                const opt = moodOptions.find(o => o.value === entry.mood) || moodOptions[0];
                // Math.random for visual layout (in production, use dates X/Y coordinates)
                // We use pseudo-random deterministic positions based on index to prevent jumpy rerenders
                const posX = [25, 33, 50, 75, 66, 20, 80, 40, 60, 10];
                const posY = [20, 60, 80, 30, 70, 40, 50, 25, 85, 15];
                
                const left = `${posX[idx % posX.length]}%`;
                const top = `${posY[idx % posY.length]}%`;
                return (
                  <div key={idx} style={{ position: 'absolute', left, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transform: 'translate(-50%, -50%)' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%', background: opt.color,
                      boxShadow: `0 0 25px 8px ${opt.glow}`, opacity: 0.85
                    }}></div>
                    <span style={{ fontSize: '0.7rem', color: '#bac3ff', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.5rem', borderRadius: '6px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })
            )}

            {/* Connection Paths Mock */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15, zIndex: 0 }}>
               <path d="M250,150 Q450,50 650,300 T850,200" fill="none" stroke="#bac3ff" strokeWidth="1" strokeDasharray="4,6" />
               <path d="M150,350 Q350,400 550,250 T750,100" fill="none" stroke="#f1e7ff" strokeWidth="1" strokeDasharray="3,8" />
            </svg>
          </div>

          {/* Central Report Floating text */}
          <div style={{ position: 'absolute', zIndex: 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ color: '#bac3ff', opacity: 0.3, marginBottom: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>blur_on</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.5rem' }}>Steady Ascension</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>This month shows a consistent trend toward 'Calm'. Your reflections are anchoring your energy.</p>
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '2.5rem', zIndex: 3, padding: '1.5rem', background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
             {moodOptions.map(opt => (
               <div key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color, boxShadow: `0 0 10px ${opt.color}` }}></div>
                 <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', fontWeight: '700' }}>{opt.label}</span>
               </div>
             ))}
          </div>

        </div>
      </section>

    </div>
  );
}
