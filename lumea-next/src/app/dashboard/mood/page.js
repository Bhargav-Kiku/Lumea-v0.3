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
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [viewRange, setViewRange] = useState('monthly'); // 'monthly' or 'weekly'
  const [todayEntry, setTodayEntry] = useState(null); // For Daily Reflection widget
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  const dailyQuotes = [
    '"The moon does not fight the darkness; it simply shines within it."',
    '"Within you there is a stillness and sanctuary to which you can retreat at any time."',
    '"You are the sky. Everything else is just the weather."',
    '"Be gentle with yourself. You are a child of the universe."',
    '"Peace is not the absence of storm, but calm in the midst of it."',
    '"Every emotion is a wave — acknowledge it, then let it pass."',
    '"Your feelings are valid. Your healing is real. Your growth is happening."',
  ];
  const todayQuote = dailyQuotes[new Date().getDay() % dailyQuotes.length];

  const moodOptions = [
    { value: 1, label: "Calm", icon: "flare", color: theme.colors.primary, glow: "rgba(186,195,255,0.4)" },
    { value: 2, label: "Joyful", icon: "wb_sunny", color: theme.colors.tertiary, glow: "rgba(241,231,255,0.4)" },
    { value: 3, label: "Anxious", icon: "grain", color: theme.colors.secondary, glow: "rgba(129, 140, 248, 0.4)" },
    { value: 4, label: "Sad", icon: "water_drop", color: "#b0bbff", glow: "rgba(176,187,255,0.4)" }
  ];

  useEffect(() => {
    fetchRecentEntries();
    fetchTodayEntry();
  }, [viewRange]);

  const fetchTodayEntry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setTodayEntry(data?.[0] || null);
    } catch (err) {
      console.error("Error fetching today's entry:", err);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const limit = viewRange === 'weekly' ? 7 : 30;

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit); 

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (err) {
      console.error("Error fetching mood entries:", err);
      // Mock data for fallback
      const mockEntries = [
        { created_at: new Date().toISOString(), mood: 2, note: "Starting fresh on the new app!", tags: "morning" },
        { created_at: new Date(Date.now() - 86400000).toISOString(), mood: 1, note: "Feeling centered today.", tags: "health" },
        { created_at: new Date(Date.now() - 172800000).toISOString(), mood: 3, note: "A bit nervous about work.", tags: "work" }
      ];
      setRecentEntries(viewRange === 'weekly' ? mockEntries.slice(0, 2) : mockEntries);
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

          {/* Daily Reflection Widget */}
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

              {todayEntry ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', color: moodOptions.find(o => o.value === todayEntry.mood)?.color || '#bac3ff' }}>
                      {moodOptions.find(o => o.value === todayEntry.mood)?.icon || 'flare'}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: moodOptions.find(o => o.value === todayEntry.mood)?.color || '#bac3ff' }}>
                      Feeling {moodOptions.find(o => o.value === todayEntry.mood)?.label || 'Unknown'} today
                    </span>
                  </div>
                  {todayEntry.note && (
                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#d6c9ee', lineHeight: '1.6', maxHeight: '80px', overflow: 'hidden' }}>
                      "{todayEntry.note}"
                    </p>
                  )}
                  <button 
                    onClick={() => setShowReflectionModal(true)}
                    style={{ background: 'none', border: '1px solid rgba(186,195,255,0.3)', borderRadius: '20px', color: '#bac3ff', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', marginTop: '0.5rem', padding: '0.4rem 1.2rem' }}
                  >View Full Entry</button>
                </>
              ) : (
                <>
                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#d6c9ee', lineHeight: '1.6' }}>{todayQuote}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>No entry recorded yet today.</p>
                  <button 
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ background: 'none', border: '1px solid rgba(186,195,255,0.3)', borderRadius: '20px', color: '#bac3ff', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', marginTop: '0.5rem', padding: '0.4rem 1.2rem' }}
                  >Record Now ↑</button>
                </>
              )}
            </div>
          </div>

          {/* Full Today Entry Modal */}
          {showReflectionModal && todayEntry && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'tooltipPop 0.3s ease-out' }} onClick={() => setShowReflectionModal(false)}>
              <GlassCard style={{ maxWidth: '500px', width: '100%', padding: '3rem', position: 'relative', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowReflectionModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.colors.primary, fontWeight: '700' }}>Today's Reflection</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `radial-gradient(circle, ${moodOptions.find(o => o.value === todayEntry.mood)?.glow || 'rgba(186,195,255,0.4)'} 0%, transparent 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: moodOptions.find(o => o.value === todayEntry.mood)?.color }}>
                      {moodOptions.find(o => o.value === todayEntry.mood)?.icon}
                    </span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>Feeling {moodOptions.find(o => o.value === todayEntry.mood)?.label}</h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(todayEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {todayEntry.note && (
                  <p style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: '1.8', fontStyle: 'italic' }}>"{todayEntry.note}"</p>
                )}
                {todayEntry.tags && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    {todayEntry.tags.split(',').map((tag, i) => (
                      <span key={i} style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(129, 140, 248, 0.2)' }}>#{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

        </div>
      </div>

      {/* Galaxy Chart Section (12 Col) */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Your Mood Galaxy</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>The constellations of your emotional history over the last {viewRange === 'weekly' ? '7' : '30'} days.</p>
          </div>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '30px', padding: '0.3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={() => setViewRange('monthly')}
              style={{ 
                background: viewRange === 'monthly' ? 'linear-gradient(135deg, #3c4b9e 0%, #293676 100%)' : 'none', 
                color: viewRange === 'monthly' ? '#fff' : '#94a3b8', 
                border: 'none', 
                borderRadius: '20px', 
                padding: '0.6rem 1.8rem', 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                cursor: 'pointer', 
                boxShadow: viewRange === 'monthly' ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >Monthly</button>
            <button 
              onClick={() => setViewRange('weekly')}
              style={{ 
                background: viewRange === 'weekly' ? 'linear-gradient(135deg, #3c4b9e 0%, #293676 100%)' : 'none', 
                color: viewRange === 'weekly' ? '#fff' : '#94a3b8', 
                border: 'none', 
                borderRadius: '20px', 
                padding: '0.6rem 1.8rem', 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: viewRange === 'weekly' ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >Weekly</button>
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
                  <div 
                    key={idx} 
                    onMouseEnter={() => setHoveredEntry(entry)}
                    onMouseLeave={() => setHoveredEntry(null)}
                    style={{ 
                      position: 'absolute', 
                      left, 
                      top, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: hoveredEntry === entry ? 10 : 2
                    }}
                  >
                    <div style={{
                      width: hoveredEntry === entry ? '24px' : '16px', 
                      height: hoveredEntry === entry ? '24px' : '16px', 
                      borderRadius: '50%', 
                      background: opt.color,
                      boxShadow: `0 0 ${hoveredEntry === entry ? '40px 15px' : '25px 8px'} ${opt.glow}`, 
                      opacity: 0.85,
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}></div>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: '#bac3ff', 
                      background: 'rgba(0,0,0,0.4)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '6px', 
                      backdropFilter: 'blur(10px)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      opacity: hoveredEntry === entry ? 0 : 1, // Hide date when tooltip shown
                      transition: 'opacity 0.2s'
                    }}>
                      {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>

                    {/* Highly Stylized Tooltip Popup */}
                    {hoveredEntry === entry && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2.5rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '240px',
                        background: 'rgba(11, 13, 24, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        padding: '1.2rem',
                        border: `1px solid ${opt.color}44`,
                        boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 20px ${opt.glow}22`,
                        zIndex: 100,
                        animation: 'tooltipPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        pointerEvents: 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: opt.color }}>{opt.icon}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: opt.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{opt.label}</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: '1.5', margin: 0, fontStyle: entry.note ? 'normal' : 'italic' }}>
                          {entry.note ? `"${entry.note}"` : "No reflection recorded for this star."}
                        </p>
                        
                        {entry.tags && (
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            {entry.tags.split(',').map((tag, tIdx) => (
                              <span key={tIdx} style={{ fontSize: '0.6rem', color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Triangle Tip */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `8px solid rgba(11, 13, 24, 0.9)`
                        }}></div>
                      </div>
                    )}
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

      <style jsx="true">{`
        @keyframes tooltipPop {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>

    </div>
  );
}
