'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';
import PageHeader from '@/components/PageHeader';

export default function ProfilePage() {
  const { currentTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ name: 'Friend', joinDate: 'March 2026' });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setUser(user);
        const name = user.user_metadata?.user_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
        const date = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        setUserData({ name, joinDate: date });
      }
    };
    fetchUser();
  }, []);

  const themeProfiles = {
    'none': {
      title: 'User',
      subtitle: 'Profile',
      description: 'Manage your settings and personal details. Make this space your own.',
      avatarIcon: 'person',
      avatarShape: '50%', 
      badge1: 'Mindful Member',
      badge2: 'Active Explorer',
      settings: [
        { label: 'Color Mode', value: 'Light', icon: 'light_mode' },
        { label: 'Ambient Noise', value: 'Disabled', icon: 'volume_off' },
        { label: 'Notifications', value: 'Minimal', icon: 'notifications' }
      ]
    },
    'dark': {
      title: 'Shadow',
      subtitle: 'Identity',
      description: 'Manage your settings and personal details. The quiet is yours.',
      avatarIcon: 'dark_mode',
      avatarShape: '50%', 
      badge1: 'Shadow Walker',
      badge2: 'Deep Thinker',
      settings: [
        { label: 'Color Mode', value: 'Dark', icon: 'dark_mode' },
        { label: 'White Noise', value: 'Enabled', icon: 'graphic_eq' },
        { label: 'Notifications', value: 'Minimal', icon: 'notifications' }
      ]
    },
    'desert': {
      title: 'Desert',
      subtitle: 'Nomad',
      description: 'Manage your journey settings and gear. The path is open.',
      avatarIcon: 'wb_sunny',
      avatarShape: '20px', 
      badge1: 'Dune Walker',
      badge2: 'Sun Kissed',
      settings: [
        { label: 'Atmosphere', value: 'Warm', icon: 'thermostat' },
        { label: 'Wind Sounds', value: 'Enabled', icon: 'air' },
        { label: 'Notifications', value: 'Minimal', icon: 'notifications' }
      ]
    },
    'ocean': {
      title: 'Deep',
      subtitle: 'Diver',
      description: 'Manage your depth settings and sonar. The water is calm.',
      avatarIcon: 'water',
      avatarShape: '50%', 
      badge1: 'Tide Rider',
      badge2: 'Oceanic Flow',
      settings: [
        { label: 'Tide Level', value: 'High', icon: 'waves' },
        { label: 'Ocean Waves', value: 'Enabled', icon: 'tsunami' },
        { label: 'Notifications', value: 'Minimal', icon: 'notifications' }
      ]
    },
    'night-sky': {
      title: 'Celestial',
      subtitle: 'Identity',
      description: 'Manage your sanctuary settings and personal details. Your journey is uniquely yours.',
      avatarIcon: 'flare',
      avatarShape: '50%', 
      badge1: 'Celestial Core',
      badge2: 'Stellar Mindset',
      settings: [
        { label: 'Night Mode', value: 'Always On', icon: 'nights_stay' },
        { label: 'Cosmic Freqs', value: 'Enabled', icon: 'satellite_alt' },
        { label: 'Notifications', value: 'Minimal', icon: 'notifications' }
      ]
    }
  };

  const currentProfile = themeProfiles[currentTheme?.id] || themeProfiles['none'];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem', paddingBottom: '5rem' }}>
      
      <PageHeader 
        title={currentProfile.title}
        subtitle={currentProfile.subtitle}
        description={currentProfile.description}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Main Identity Card */}
        <section style={{ 
          padding: '3rem', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(25px)',
          border: '1px solid var(--glass-border)',
          borderRadius: theme.borderRadius.xl,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, top: '-100px', right: '-100px', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', width: '100%', zIndex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Glowing Avatar */}
            <div style={{
              position: 'relative',
              width: '120px', 
              height: '120px',
              flexShrink: 0
            }}>
              <div style={{ 
                position: 'absolute',
                inset: 0,
                borderRadius: currentProfile.avatarShape, 
                background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`,
                opacity: 0.2,
                filter: 'blur(15px)',
                transition: 'border-radius 0.4s ease'
              }} />
              <div style={{ 
                position: 'absolute',
                inset: 0,
                borderRadius: currentProfile.avatarShape, 
                background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `inset 0 0 20px rgba(255,255,255,0.2), 0 10px 20px rgba(0,0,0,0.3)`,
                transition: 'border-radius 0.4s ease',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: '#fff' }}>{currentProfile.avatarIcon}</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)', textTransform: 'capitalize', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                {userData.name}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '500' }}>Member since {userData.joinDate}</p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  padding: '0.6rem 1.2rem', 
                  background: 'var(--glass-bg)', 
                  borderRadius: '30px', 
                  fontSize: '0.85rem', 
                  color: 'var(--primary)', 
                  border: `1px solid var(--primary)`, 
                  fontWeight: '700',
                  boxShadow: '0 0 15px var(--primary-glow)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {currentProfile.badge1}
                </div>
                <div style={{ 
                  padding: '0.6rem 1.2rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '30px', 
                  fontSize: '0.85rem', 
                  color: 'var(--foreground)', 
                  border: `1px solid var(--glass-border)`, 
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {currentProfile.badge2}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Preferences Card */}
          <section style={{ 
            padding: '2.5rem', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: theme.borderRadius.xl,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>tune</span>
              Sanctuary Preferences
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              {currentProfile.settings.map((setting, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingBottom: '1.5rem',
                  borderBottom: idx !== currentProfile.settings.length - 1 ? '1px solid var(--glass-border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>{setting.icon}</span>
                    </div>
                    <span style={{ color: 'var(--foreground)', fontSize: '1.05rem', fontWeight: '600' }}>{setting.label}</span>
                  </div>
                  <span style={{ 
                    color: 'var(--primary)', 
                    fontWeight: '700', 
                    fontSize: '0.9rem',
                    background: 'var(--primary-glow)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid var(--primary)'
                  }}>
                    {setting.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Security Card */}
          <section style={{ 
            padding: '2.5rem', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: theme.borderRadius.xl,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>shield_person</span>
              Account Security
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
              
              <button style={{ 
                width: '100%', padding: '1.2rem', 
                background: 'rgba(255,255,255,0.02)', border: `1px solid var(--glass-border)`, borderRadius: theme.borderRadius.lg, 
                color: 'var(--foreground)', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>key</span>
                Change Password
              </button>

              <button style={{ 
                width: '100%', padding: '1.2rem', 
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: theme.borderRadius.lg, 
                color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(239, 68, 68, 0.2)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete_forever</span>
                Delete Identity
              </button>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
