'use client';

import { useState, useEffect, useRef } from 'react';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleExportData = () => {
    alert("Preparing your Celestial Data for export... (Feature coming soon)");
    setIsOpen(false);
  };

  const menuOptions = [
    { label: 'See user Profile', icon: 'person', onClick: () => { router.push('/dashboard/profile'); setIsOpen(false); } },
    { label: 'Export Data', icon: 'download', onClick: handleExportData },
    { label: 'Sign out', icon: 'logout', onClick: handleSignOut }
  ];

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 1000 }}>
      {/* Profile Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease',
          boxShadow: isOpen ? '0 0 20px rgba(168, 85, 247, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
          outline: 'none'
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)'}
        onMouseOut={e => !isOpen && (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
      >
        <span>👤</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '3.5rem',
          right: 0,
          width: '220px',
          backgroundColor: '#11131c',
          borderRadius: '16px',
          padding: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          animation: 'fadeInScale 0.2s ease-out forwards',
          transformOrigin: 'top right'
        }}>
          {/* User Info Header in Dropdown */}
          <div style={{ padding: '0.5rem 1rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>
              {user?.user_metadata?.user_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Celestial Traveler'}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
          </div>
          {menuOptions.map((opt, idx) => (
            <button 
              key={idx}
              onClick={opt.onClick}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'none',
                border: 'none',
                borderRadius: '12px',
                color: '#e3e4f7',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                textAlign: 'left'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#e3e4f7';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Styling is using inline styles where possible or globals.css classes */}
    </div>
  );
}
