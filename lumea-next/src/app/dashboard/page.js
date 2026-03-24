'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Good evening');
  const [name, setName] = useState('Friend');
  const [moodEntries, setMoodEntries] = useState([]);
  const [recentJournal, setRecentJournal] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);
  const router = useRouter();

  const moodOptions = [
    { value: 1, label: 'Calm',    color: '#bac3ff', glow: 'rgba(186,195,255,0.5)' },
    { value: 2, label: 'Joyful',  color: '#f1e7ff', glow: 'rgba(241,231,255,0.5)' },
    { value: 3, label: 'Anxious', color: '#818cf8', glow: 'rgba(129,140,248,0.5)' },
    { value: 4, label: 'Sad',     color: '#7dd3fc', glow: 'rgba(125,211,252,0.5)' },
  ];

  // Deterministic positions for up to 10 stars
  const posPresets = [
    { x: '20%', y: '25%' }, { x: '70%', y: '18%' }, { x: '45%', y: '75%' },
    { x: '80%', y: '60%' }, { x: '15%', y: '65%' }, { x: '55%', y: '35%' },
    { x: '35%', y: '50%' }, { x: '88%', y: '30%' }, { x: '10%', y: '45%' }, { x: '65%', y: '80%' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
        setName(displayName);

        // Fetch last 7 mood entries
        const { data: moods } = await supabase
          .from('mood_entries').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(7);
        const entries = moods || [];
        setMoodEntries(entries);

        // Fetch latest journal entry
        const { data: journals } = await supabase
          .from('journal_entries').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(1);
        setRecentJournal(journals?.[0] || null);

        // Fetch AI insight
        if (entries.length > 0) {
          try {
            const res = await fetch('/api/mood-insight', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ entries })
            });
            const json = await res.json();
            setAiInsight(json.insight || '');
          } catch { setAiInsight('Your stars are aligning beautifully.'); }
        } else {
          setAiInsight('Start tracking your mood to reveal your emotional constellations.');
        }
        setInsightLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      {/* 1. Personalized Greeting */}
      <section style={{ marginBottom: '3rem', animation: 'fadeIn 0.6s ease-out' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '0.4rem', color: theme.colors.foreground, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {greeting}, <span className="text-gradient" style={{ textTransform: 'capitalize', color: theme.colors.primary }}>{name}</span>
        </h1>
        <p style={{ color: theme.colors.muted, fontSize: '1.1rem', fontWeight: '500' }}>Your sanctuary is peaceful {greeting.includes('morning') ? 'today' : greeting.includes('afternoon') ? 'this afternoon' : 'tonight'}.</p>
      </section>

      {/* 2. Quick Actions */}
      <section className="bento-grid" style={{ marginBottom: '4rem' }}>
        {/* Connect / Start Chat */}
        <button className="bento-3" onClick={() => router.push('/dashboard/chat')} style={{ 
          background: `linear-gradient(135deg, ${theme.colors.primaryContainer} 0%, #293676 100%)`, 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: 'none', 
          cursor: 'pointer', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s',
          textAlign: 'left',
          width: '100%'
        }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.primary, opacity: 0.8, fontWeight: '700' }}>Connect</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Start Chat</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: theme.colors.primary }}>forum</span>
        </button>

        {/* Log / Record Mood */}
        <button className="bento-3" onClick={() => router.push('/dashboard/mood')} style={{ 
          background: theme.colors.glass, 
          backdropFilter: 'blur(20px)', 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: `1px solid ${theme.colors.glassBorder}`, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'left',
          width: '100%'
        }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'} onMouseOut={(e) => e.currentTarget.style.background = theme.colors.glass}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.muted, fontWeight: '700' }}>Log</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.colors.secondary }}>Record Mood</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: theme.colors.secondary }}>wb_twilight</span>
        </button>

        {/* Write / New Journal */}
        <button className="bento-3" onClick={() => router.push('/dashboard/journal')} style={{ 
          background: theme.colors.glass, 
          backdropFilter: 'blur(20px)', 
          borderRadius: theme.borderRadius.lg, 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          border: `1px solid ${theme.colors.glassBorder}`, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'left',
          width: '100%'
        }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)'} onMouseOut={(e) => e.currentTarget.style.background = theme.colors.glass}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.muted, fontWeight: '700' }}>Write</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.colors.secondary }}>New Journal</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: theme.colors.secondary }}>auto_stories</span>
        </button>
      </section>

      {/* 3. Bento Grid for Summaries */}
      <section className="bento-grid" style={{ marginBottom: '4rem' }}>
        {/* Mood Summary / Galaxy Mini */}
        <div className="bento-7">
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.colors.foreground, marginBottom: '0.25rem' }}>Mood Galaxy</h3>
                <p style={{ color: theme.colors.muted, fontSize: '0.85rem' }}>
                  {insightLoading ? 'Analyzing your emotional orbit...' : aiInsight}
                </p>
              </div>
              <span style={{ fontSize: '1.5rem', color: theme.colors.accent, opacity: 0.6 }}>🪐</span>
            </div>

            {/* Live Mini Star Gallery */}
            <div style={{ height: '200px', position: 'relative', borderRadius: '16px', background: 'rgba(2,6,23,0.4)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
              {/* Ambient glow */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(186,195,255,0.04)', filter: 'blur(60px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

              {moodEntries.length === 0 ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#475569', fontSize: '0.85rem', fontStyle: 'italic' }}>Record a mood to ignite your galaxy</p>
                </div>
              ) : (
                moodEntries.map((entry, idx) => {
                  const opt = moodOptions.find(o => o.value === entry.mood) || moodOptions[0];
                  const pos = posPresets[idx % posPresets.length];
                  const size = 10 + (5 - entry.mood) * 2;
                  return (
                    <div key={idx} style={{
                      position: 'absolute', left: pos.x, top: pos.y,
                      transform: 'translate(-50%,-50%)',
                      width: `${size}px`, height: `${size}px`,
                      borderRadius: '50%',
                      background: opt.color,
                      boxShadow: `0 0 ${size * 2}px ${size}px ${opt.glow}`,
                      opacity: 0.85
                    }} />
                  );
                })
              )}

              {/* Connect nearby stars */}
              {moodEntries.length > 1 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }}>
                  {moodEntries.slice(0, 5).map((_, i) => {
                    if (i === 0) return null;
                    const a = posPresets[i - 1]; const b = posPresets[i];
                    return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#bac3ff" strokeWidth="0.8" />;
                  })}
                </svg>
              )}
            </div>

            {/* Real mood tags from entries */}
            {moodEntries.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {[...new Set(moodEntries.map(e => moodOptions.find(o => o.value === e.mood)?.label).filter(Boolean))].map(label => (
                  <span key={label} style={{ padding: '0.3rem 0.8rem', background: 'rgba(30,41,59,0.6)', borderRadius: '20px', fontSize: '0.7rem', color: theme.colors.muted }}>{label}</span>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recent Journal Reflection */}
        <div className="bento-5">
          <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: theme.colors.accent }}>menu_book</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.colors.foreground }}>Recent Reflection</h3>
              </div>
              {recentJournal ? (
                <>
                  <span style={{ fontSize: '0.7rem', color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {new Date(recentJournal.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {recentJournal.title && (
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: theme.colors.foreground, marginTop: '0.5rem', marginBottom: '0.5rem' }}>{recentJournal.title}</h4>
                  )}
                  <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6', color: theme.colors.onSurfaceVariant, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{recentJournal.content}"
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#475569', lineHeight: '1.6' }}>No reflections yet. Begin writing to fill your celestial archive.</p>
              )}
            </div>
            <button onClick={() => router.push('/dashboard/journal')} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'flex-start', marginTop: '1.5rem' }}>
              {recentJournal ? 'Continue Writing' : 'Start Writing'} <span>➔</span>
            </button>
          </GlassCard>
        </div>
      </section>

      {/* 4. Celestial Guidance / Quote */}
      <section style={{ 
        position: 'relative', 
        padding: '4rem 2rem', 
        borderRadius: theme.borderRadius.xl, 
        overflow: 'hidden', 
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.3)',
        border: `1px solid ${theme.colors.glassBorder}`
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
          <img alt="Celestial sky" src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #05060b, transparent, #05060b)' }}></div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem', color: theme.colors.primary, opacity: 0.4 }}>“</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.4', color: theme.colors.foreground, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            "The moon does not fight the sun to shine. It waits for its time."
          </p>
          <div style={{ width: '40px', height: '1px', background: theme.colors.primaryContainer }}></div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.muted }}>Celestial Guidance</span>
        </div>
      </section>

    </div>
  );
}
