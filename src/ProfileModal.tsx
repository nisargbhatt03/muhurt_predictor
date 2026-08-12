import React from 'react';
import { X, Phone, Award, GraduationCap, Sparkles, MessageCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Instagram SVG Icon
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// Twitter / X SVG Icon
const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  // Static Astrologer Profile Information
  const profileName = 'Astrologer Yashesh Joshi';
  const profileDegree = 'Jyotish Ratna • Vedic Astrology & Vastu Specialist (B.E., M.S. Astro Shastra)';
  const profileContact = '+91 99248 48727';
  const profilePhoto = '/astrologer_profile.png';

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 3, 20, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animated fadeIn"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--gold-primary)',
          borderRadius: '20px',
          padding: '24px 20px 20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.25)',
          textAlign: 'center',
          color: 'var(--text-primary)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid var(--card-border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Close Popup"
        >
          <X size={16} />
        </button>

        {/* Header Mantra Banner */}
        <div
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--heading-font)',
            color: 'var(--gold-primary)',
            letterSpacing: '1px',
            marginBottom: '12px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          ✦ VEDIC ASTROLOGY CONSULTANT ✦
        </div>

        {/* Profile Avatar Frame */}
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 12px' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, var(--gold-primary), transparent 60%, var(--gold-secondary))',
              animation: 'spinSlow 20s linear infinite'
            }}
          />
          <img
            src={profilePhoto}
            alt={profileName}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid var(--bg-dark)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.5)'
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: 'var(--gold-primary)',
              color: '#07051a',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}
          >
            <Sparkles size={11} />
          </div>
        </div>

        {/* Profile Details */}
        {/* Name */}
        <h2
          style={{
            fontFamily: 'var(--heading-font)',
            fontSize: '1.35rem',
            margin: '0 0 4px',
            color: 'var(--gold-primary)',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}
        >
          {profileName}
        </h2>

        {/* Degree / Qualification */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '16px',
            padding: '4px 10px',
            fontSize: '0.76rem',
            color: 'var(--text-primary)',
            marginBottom: '12px',
            fontWeight: 500,
            maxWidth: '100%'
          }}
        >
          <GraduationCap size={13} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
          <span>{profileDegree}</span>
        </div>

        {/* Contact Number Card */}
        <div
          style={{
            background: 'rgba(10, 8, 30, 0.6)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>
              Direct Contact & Consultation
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
              {profileContact}
            </span>
          </div>
          <a
            href={`tel:${profileContact.replace(/[^0-9+]/g, '')}`}
            className="dev-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              fontSize: '0.78rem',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            <Phone size={12} /> Call
          </a>
        </div>

        {/* Social Media & Instant Chat Links */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            CONNECT & CONSULT ONLINE
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {/* WhatsApp Direct Chat */}
            <a
              href="https://wa.me/919924848727?text=Hello%20Astrologer%20Yashesh%20Joshi,%20I%20would%20like%20to%20consult%20regarding%20Vedic%20Muhurt."
              target="_blank"
              rel="noopener noreferrer"
              className="dev-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                textDecoration: 'none',
                borderRadius: '10px',
                background: 'rgba(37, 211, 102, 0.12)',
                borderColor: 'rgba(37, 211, 102, 0.3)',
                color: '#25D366'
              }}
              title="Chat on WhatsApp"
            >
              <MessageCircle size={14} /> WhatsApp Chat
            </a>

            {/* Instagram Profile */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                textDecoration: 'none',
                background: 'rgba(225, 48, 108, 0.12)',
                borderColor: 'rgba(225, 48, 108, 0.3)',
                color: '#E1306C'
              }}
              title="Follow on Instagram"
            >
              <InstagramIcon size={16} />
            </a>

            {/* Twitter / X Profile */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                textDecoration: 'none',
                background: 'rgba(29, 161, 242, 0.12)',
                borderColor: 'rgba(29, 161, 242, 0.3)',
                color: '#1DA1F2'
              }}
              title="Follow on Twitter"
            >
              <TwitterIcon size={16} />
            </a>
          </div>
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
            <Award size={11} color="var(--gold-primary)" style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Certified Astrologer
          </span>
          <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
            ✦ 8+ Yrs Experience
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="predict-button"
          onClick={onClose}
          style={{ fontSize: '0.88rem', padding: '10px', width: '100%' }}
        >
          Continue to Muhurt Predictor
        </button>

      </div>
    </div>
  );
};
