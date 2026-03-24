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
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Greeting based on time
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      // 2. Get User Name from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
        setName(displayName);
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
        {/* Mood Summary / Galaxy Mini (7 Col) */}
        <div className="bento-7">
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.colors.foreground, marginBottom: '0.2rem' }}>Mood Galaxy</h3>
                <p style={{ color: theme.colors.muted, fontSize: '0.9rem' }}>Your emotional orbit is stable.</p>
              </div>
              <span style={{ fontSize: '1.5rem', color: theme.colors.accent, opacity: 0.6 }}>🪐</span>
            </div>

            {/* Miniature Galaxy Visualization */}
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div className="animate-pulse" style={{ width: '180px', height: '180px', border: `1px solid ${theme.colors.primaryContainer}`, borderRadius: '50%', opacity: 0.1, position: 'absolute' }}></div>
              <div style={{ width: '120px', height: '120px', border: `1px solid ${theme.colors.accent}`, borderRadius: '50%', opacity: 0.15, position: 'absolute' }}></div>
              
              {/* Orbiting Orbs */}
              <div style={{ width: '16px', height: '16px', background: theme.colors.secondary, borderRadius: '50%', position: 'absolute', top: '20px', left: '40px', boxShadow: `0 0 15px ${theme.colors.secondary}` }}></div>
              <div style={{ width: '12px', height: '12px', background: theme.colors.accent, borderRadius: '50%', position: 'absolute', bottom: '40px', right: '50px', boxShadow: `0 0 12px ${theme.colors.accent}` }}></div>
              <div style={{ width: '8px', height: '8px', background: theme.colors.primary, borderRadius: '50%', position: 'absolute', top: '120px', right: '20px' }}></div>
              
              {/* Center Self */}
              <div style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.accent} 100%)`, borderRadius: '50%', boxShadow: `0 0 30px ${theme.colors.secondary}` }}></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
              {['Stable', 'Reflective', 'Peaceful'].map((tag) => (
                <span key={tag} style={{ padding: '0.4rem 0.8rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '20px', fontSize: '0.75rem', color: theme.colors.muted }}>{tag}</span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Recent Reflection (5 Col) */}
        <div className="bento-5">
          <GlassCard style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <span className="material-symbols-outlined" style={{ color: theme.colors.accent }}>menu_book</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.colors.foreground, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Reflection</h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: theme.colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today, 2:40 PM</span>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.6', color: theme.colors.onSurfaceVariant, marginTop: '0.8rem' }}>
                "The twilight brought a sense of clarity I haven't felt all week. Watching the stars emerge reminded me that even in darkness, there is guidance..."
              </p>
            </div>
            <button onClick={() => router.push('/dashboard/journal')} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', alignSelf: 'flex-start', marginTop: '2rem' }}>
              Continue Writing <span>➔</span>
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
