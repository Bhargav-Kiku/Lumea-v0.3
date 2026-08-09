'use client';

import { useState, useRef, useEffect } from 'react';
import { theme } from '@/lib/theme';
import PageHeader from '@/components/PageHeader';

const AMBIENT_TRACKS = [
  {
    id: 1,
    title: 'Weightless',
    subtitle: 'Marconi Union',
    icon: 'spa',
    url: '/music/Marconi%20Union%20-%20Weightless%20(Official%20Video).mp3'
  },
  {
    id: 2,
    title: 'Moving Mountains',
    subtitle: 'Kilometre Club',
    icon: 'landscape',
    url: '/music/Kilometre%20Club%20-%20Moving%20Mountains%20%5Bambient%20relaxing%20classical%5D.mp3'
  },
  {
    id: 3,
    title: 'Magnetic',
    subtitle: 'NCS Ambient',
    icon: 'headphones',
    url: '/music/magnetic--pluggnb--ncs---copyright-free-music.mp3'
  }
];

export default function LunarBreathingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const audioRef = useRef(null);
  const currentTrack = AMBIENT_TRACKS[currentTrackIndex];

  // Load persistent timer on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('lumea_breathing_time');
      if (savedTime) setTotalTime(parseInt(savedTime, 10));
    }
  }, []);

  // Increment timer while playing
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTotalTime((prev) => {
          const newTime = prev + 1;
          localStorage.setItem('lumea_breathing_time', newTime.toString());
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []); // Run once on mount

  // Handle Track Changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (audioRef.current.src !== currentTrack.url) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }
  }, [currentTrackIndex, currentTrack.url]); // Re-run when track changes

  // Sync Audio Playback with Breathing State & Mute
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = isMuted;

    if (isPlaying && !isMuted) {
      audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isMuted]);

  const toggleBreathing = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % AMBIENT_TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const formatTotalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const MathMax = Math.max(0, Math.min(1, x / rect.width));
    const newTime = MathMax * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="relative overflow-hidden w-full max-w-lg mx-auto" style={{ paddingBottom: '6rem' }}>
      
      {/* Ambient Orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '-15%', width: '384px', height: '384px', background: theme.colors.primary, opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '-15%', width: '384px', height: '384px', background: theme.colors.tertiary, opacity: 0.1, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }}></div>

      {/* Header */}
      <PageHeader 
        title="Lunar"
        subtitle="Solace"
        description="A celestial technique to center your mind. Box breathing helps regulate the nervous system, quieting the storm within."
      />

      {/* Reflection Orb / Breathing Guide */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '4rem', position: 'relative' }}>
        
        {/* Mindful Timer Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem',
          padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)', borderRadius: '30px',
          color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)',
          letterSpacing: '0.05em', textTransform: 'uppercase'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>schedule</span>
          Mindful Time: {formatTotalTime(totalTime)}
        </div>

        {/* The Orb Stack */}
        <div 
          onClick={toggleBreathing}
          style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          title={isPlaying ? 'Click to Pause' : 'Click to Start'}
        >
          
          {/* Inner Core */}
          <div className={`orb-core ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--primary)',
            borderRadius: '50%',
            boxShadow: '0 0 80px 20px var(--primary-glow)',
            opacity: 0.9,
            zIndex: 1
          }}></div>
          
          {/* Outer Pulse Rings */}
          <div className={`orb-ring-1 ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute', inset: 0, border: `1px solid ${theme.colors.primary}33`, borderRadius: '50%', opacity: 0.3, zIndex: 0
          }}></div>
          <div className={`orb-ring-2 ${!isPlaying ? 'paused' : ''}`} style={{
            position: 'absolute', inset: 0, border: `1px solid ${theme.colors.primary}1A`, borderRadius: '50%', opacity: 0.1, zIndex: 0
          }}></div>
          
          {/* Current Instruction */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
             <h2 className={isPlaying ? "orb-text" : ""} style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--foreground)', marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
               {!isPlaying && 'Ready?'}
             </h2>
             <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>
               {isPlaying ? '(Click to pause)' : 'Click to start'}
             </p>
          </div>
        </div>

        {/* Phase Indicator Dots */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
          <div className={`dot dot-1 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-2 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-3 ${!isPlaying ? 'paused' : ''}`}></div>
          <div className={`dot dot-4 ${!isPlaying ? 'paused' : ''}`}></div>
        </div>
      </section>

      {/* Information & Technique */}
      <section style={{ width: '100%', marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {[
            { icon: 'air', title: 'Inhale', desc: 'Fill your lungs slowly for 4s.' },
            { icon: 'pause_circle', title: 'Hold', desc: 'Suspend your breath for 4s.' },
            { icon: 'wind_power', title: 'Exhale', desc: 'Release every drop for 4s.' },
            { icon: 'all_inclusive', title: 'Hold', desc: 'Wait in the stillness for 4s.' }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', padding: '1.25rem', borderRadius: theme.borderRadius.md, border: `1px solid var(--glass-border)`,
              transition: 'all 0.3s ease', cursor: 'default'
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>{item.icon}</span>
              <h4 style={{ fontWeight: '600', color: 'var(--foreground)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Play Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5rem', width: '100%' }}>
        <button onClick={toggleBreathing} style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 3rem',
          background: 'var(--primary)', color: '#fff',
          borderRadius: theme.borderRadius.full, border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 30px var(--primary-glow)', transition: 'transform 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '0.025em' }}>{isPlaying ? 'Pause Practice' : 'Resume Practice'}</span>
        </button>
      </div>

      {/* Spotify-Like Ambient Player */}
      <div style={{ 
        width: '100%', padding: '1.5rem 2rem', borderRadius: theme.borderRadius.xl, position: 'relative', overflow: 'hidden',
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Background Decorative Icon */}
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.05, pointerEvents: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '10rem' }}>{currentTrack.icon}</span>
        </div>
        
        {/* Header/Track Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{currentTrack.icon}</span>
              Ambient Track
            </p>
            <h4 style={{ fontSize: '1.4rem', color: 'var(--foreground)', fontWeight: '800', marginBottom: '0.2rem' }}>{currentTrack.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{currentTrack.subtitle}</p>
          </div>
          
          <button onClick={toggleMute} style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
            width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', color: isMuted ? 'var(--muted)' : 'var(--primary)', transition: 'all 0.2s ease' 
          }} title={isMuted ? 'Unmute' : 'Mute'}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{isMuted ? 'volume_off' : 'volume_up'}</span>
          </button>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 2 }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', width: '35px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
            
            <div 
              onClick={handleSeek}
              style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.1s linear' }}></div>
            </div>
            
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', width: '35px' }}>{formatTime(duration)}</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
            <button onClick={prevTrack} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>skip_previous</span>
            </button>
            
            <button onClick={toggleBreathing} style={{ 
              background: 'var(--primary)', border: 'none', color: '#fff', width: '56px', height: '56px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 15px var(--primary-glow)',
              transition: 'transform 0.2s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{isPlaying && !isMuted ? 'pause' : 'play_arrow'}</span>
            </button>

            <button onClick={nextTrack} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.7}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>skip_next</span>
            </button>
          </div>

        </div>
      </div>

      {/* Inject Scoped CSS for Animations */}
      <style>{`
        /* 16 Second Total Loop: 4s Inhale (0-25%), 4s Hold (25-50%), 4s Exhale (50-75%), 4s Hold (75-100%) */
        @keyframes breath-cycle {
          0%, 100% { transform: scale(1); }
          25%, 50% { transform: scale(1.4); }
          75%, 99.9% { transform: scale(1); }
        }

        @keyframes breath-ring-1 {
          0%, 100% { transform: scale(1.25); opacity: 0.15; }
          25%, 50% { transform: scale(1.65); opacity: 0.3; }
          75%, 99.9% { transform: scale(1.25); opacity: 0.15; }
        }

        @keyframes breath-ring-2 {
          0%, 100% { transform: scale(1.5); opacity: 0.05; }
          25%, 50% { transform: scale(1.9); opacity: 0.1; }
          75%, 99.9% { transform: scale(1.5); opacity: 0.05; }
        }

        @keyframes breath-text {
          0%, 24.9% { content: 'Inhale'; }
          25%, 49.9% { content: 'Hold'; }
          50%, 74.9% { content: 'Exhale'; }
          75%, 100% { content: 'Hold'; }
        }

        /* Dot Indicators */
        @keyframes active-dot-1 {
          0%, 24.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          25%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-2 {
          0%, 24.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          25%, 49.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          50%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-3 {
          0%, 49.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          50%, 74.9% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
          75%, 100% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
        }
        @keyframes active-dot-4 {
          0%, 74.9% { background: transparent; box-shadow: none; border-color: var(--glass-border); }
          75%, 100% { background: var(--primary); box-shadow: 0 0 12px var(--primary-glow); border-color: transparent; }
        }

        .orb-core { animation: breath-cycle 16s ease-in-out infinite; }
        .orb-ring-1 { animation: breath-ring-1 16s ease-in-out infinite; }
        .orb-ring-2 { animation: breath-ring-2 16s ease-in-out infinite; }
        .orb-text::after { content: 'Inhale'; animation: breath-text 16s infinite; }
        
        .dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--glass-border); background: transparent; }
        .dot-1 { animation: active-dot-1 16s infinite; }
        .dot-2 { animation: active-dot-2 16s infinite; }
        .dot-3 { animation: active-dot-3 16s infinite; }
        .dot-4 { animation: active-dot-4 16s infinite; }

        .paused { animation-play-state: paused !important; }
      `}</style>

    </div>
  );
}
