'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';

export default function JournalPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState([]);
  const [reflections, setReflections] = useState({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      // Fallback mock data
      setEntries([
        { id: 1, created_at: new Date().toISOString(), title: "A peaceful morning", content: "Today I woke up feeling refreshed. Wrote down some goals for the week.", is_private: true },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), title: "Untitled Reflection", content: "Had a long day at work but managed to meditate for 10 minutes.", is_private: true }
      ]);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Please write something before saving.");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('journal_entries').insert({
        user_id: user ? user.id : 'guest',
        title: title || 'Untitled Reflection',
        content: content,
        is_private: isPrivate
      });

      if (error) throw error;

      setMessage("✅ Journal entry saved elegantly!");
      setTitle('');
      setContent('');
      fetchEntries(); // Refresh list
    } catch (err) {
      console.error("Error saving journal:", err);
      setMessage("❌ Failed to save. Database might be missing the table.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiReflection = async (entryId, text) => {
    setReflections(prev => ({ ...prev, [entryId]: "Generating reflection..." }));
    
    try {
      // Mocking get_journal_reflection
      setTimeout(() => {
        setReflections(prev => ({ 
          ...prev, 
          [entryId]: "That sounds like a constructive moment of mindfulness. Keep tracking your thoughts!" 
        }));
      }, 1500);
    } catch (err) {
      setReflections(prev => ({ ...prev, [entryId]: "Error generating reflection." }));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem', position: 'relative' }}>
      
      <PageHeader 
        title="Deep"
        subtitle="Reflection"
        description="A sacred space for your thoughts to wander and settle like the evening mist."
      />

      {/* 2. Bento Layout Grid */}
      <div className="bento-grid" style={{ gap: '3rem' }}>
        
        {/* Column 1: Editor Column (8 Col) */}
        <div className="bento-8">
          
          <GlassCard style={{ padding: '2.5rem' }}>
            
            {/* Tactile Notebook Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: '700' }}>Current Entry</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <input 
                      type="text" 
                      placeholder="Title your reflection..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        color: theme.colors.foreground, 
                        padding: 0, 
                        outline: 'none', 
                        boxShadow: 'none', 
                        width: '100%',
                        marginBottom: 0
                      }}
                    />
                  </div>
                </div>
                
                {/* Save Button */}
                <button type="submit" onClick={handleSaveEntry} disabled={loading} style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.primaryContainer} 0%, #293676 100%)`, 
                  border: 'none', 
                  borderRadius: theme.borderRadius.lg, 
                  padding: '0.6rem 1.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  color: '#fff', 
                  fontWeight: '600', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: loading ? 0.6 : 1
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>check</span>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Bottom formatting tools row mockup */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.3rem', borderRadius: theme.borderRadius.full, width: 'fit-content', border: `1px solid ${theme.colors.glassBorder}` }}>
                {['Photo', 'Voice', 'Tags'].map((tool, idx) => (
                  <button key={idx} type="button" style={{ background: 'none', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.75rem', color: theme.colors.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{tool === 'Photo' ? 'image' : tool === 'Voice' ? 'mic' : 'sell'}</span> {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Body */}
            <div style={{ position: 'relative' }}>
              <textarea 
                placeholder="Begin your reflection here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  boxShadow: 'none', 
                  color: theme.colors.foreground, 
                  fontSize: '1.1rem', 
                  lineHeight: '2.2rem', 
                  minHeight: '380px', 
                  resize: 'none', 
                  padding: 0, 
                  position: 'relative', 
                  zIndex: 2,
                  marginBottom: 0
                }}
              />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, borderTop: `1px solid ${theme.colors.foreground}`, backgroundSize: '100% 2.2rem', backgroundImage: `linear-gradient(${theme.colors.foreground} 1px, transparent 1px)`, pointerEvents: 'none', zIndex: 1 }}></div>
            </div>

            {message && <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', textAlign: 'center', color: message.startsWith('✅') ? theme.colors.accent : '#ef4444' }}>{message}</p>}
          </GlassCard>

        </div>

        {/* Column 2: Archive & Lunar Timeline (4 Col) */}
        <div className="bento-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Archive Calendar Display static mock grid */}
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.2)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '20px', 
            padding: '1.5rem', 
            border: '1px solid rgba(255,255,255,0.04)' 
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#818cf8' }}>📅</span> Archive Calendar
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => <span key={idx} style={{ fontWeight: '700', fontSize: '0.7rem' }}>{d}</span>)}
              {[...Array(28)].map((_, i) => (
                <button key={i} type="button" style={{ 
                  background: i === 23 ? 'linear-gradient(135deg, #3c4b9e 0%, #293676 100%)' : 'none', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '0.4rem', 
                  color: i === 23 ? '#fff' : '#e2e8f0', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  fontWeight: i === 23 ? '700' : '500',
                }}>{i + 1}</button>
              ))}
            </div>
          </div>

          {/* Lunar Phases Timeline mapped from historical entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#c084fc' }}>🌙</span> Lunar Phases
            </h3>

            <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, rgba(99,102,241,0.3), rgba(255,255,255,0.05))' }}></div>

              {entries.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No historical phases logged yet.</p>
              ) : (
                entries.map((entry, idx) => (
                  <div key={entry.id} style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-29px', 
                      top: '4px', 
                      width: '16px', 
                      height: '16px', 
                      background: idx === 0 ? '#818cf8' : '#1e293b', 
                      border: '2px solid #818cf8', 
                      borderRadius: '50%', 
                      boxShadow: idx === 0 ? '0 0 10px rgba(99,102,241,0.6)' : 'none' 
                    }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: '700' }}>
                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{entry.title || 'Untitled Reflection'}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{entry.content}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
