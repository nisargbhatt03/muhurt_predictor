import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, LogIn, UserPlus, LogOut, CheckCircle2, Phone, Loader2 } from 'lucide-react';
import { apiSignIn, apiSignUp, setAuthToken } from './api';

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Primary Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [loginInput, setLoginInput] = useState('');

  // Sign Up States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Password States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setLoginInput('');
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  };

  const handleSwitchMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    resetForm();
  };

  // Direct Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const identifier = loginInput.trim();
    if (!identifier) {
      setErrorMsg('Please enter your email address or phone number.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const isDummyCredentials = (identifier.toLowerCase() === 'muhurtp@gmail.com' || identifier.toLowerCase() === 'muhurtp') && password === 'muhurt123';

    try {
      const res = await apiSignIn({
        login_input: identifier,
        password: password,
      });

      setAuthToken(res.access_token);

      const user: UserAccount = {
        name: res.user.name,
        email: res.user.email || '',
        phone: res.user.phone || '',
        isLoggedIn: true,
      };

      onLoginSuccess(user);
      resetForm();
      onClose();
    } catch (err: any) {
      // If DB connection is down or auth fails but dummy credentials were provided, log in as dummy user
      if (isDummyCredentials) {
        setAuthToken('dummy_muhurt_token');
        const dummyUser: UserAccount = {
          name: "Muhurt User",
          email: "muhurtp@gmail.com",
          phone: "+91 98765 43210",
          isLoggedIn: true,
        };
        onLoginSuccess(dummyUser);
        resetForm();
        onClose();
      } else {
        setErrorMsg(err.message || 'Sign in failed. Please check credentials or use demo login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPhone = `${countryCode} ${cleanPhone}`;
      const res = await apiSignUp({
        name: name.trim(),
        email: email.trim(),
        phone: formattedPhone,
        password: password,
      });

      setAuthToken(res.access_token);

      const user: UserAccount = {
        name: res.user.name,
        email: res.user.email || '',
        phone: res.user.phone || '',
        isLoggedIn: true,
      };

      onLoginSuccess(user);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 3, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
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
          maxWidth: '400px',
          background: 'var(--bg-dark, #0d0926)',
          border: '1px solid var(--gold-primary, #ffd700)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(255, 215, 0, 0.2)',
          color: 'var(--text-primary, #ffffff)',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-primary, #ffd700)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Close Modal"
        >
          <X size={14} />
        </button>

        {/* If User is Already Logged In */}
        {currentUser && currentUser.isLoggedIn ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #df9f28, #ffd700)',
                color: '#0a081a',
                fontSize: '1.5rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                boxShadow: '0 0 16px rgba(255, 215, 0, 0.4)'
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'var(--heading-font)', color: 'var(--gold-primary, #ffd700)', fontSize: '1.2rem', margin: '0 0 2px' }}>
              {currentUser.name}
            </h2>
            {currentUser.email && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, rgba(255,255,255,0.7))', margin: '0 0 2px' }}>
                ✉ {currentUser.email}
              </p>
            )}
            {currentUser.phone && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, rgba(255,255,255,0.7))', margin: '0 0 14px' }}>
                📱 {currentUser.phone}
              </p>
            )}

            <div
              style={{
                background: 'rgba(255, 215, 0, 0.06)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '10px',
                padding: '8px 10px',
                marginBottom: '14px',
                fontSize: '0.78rem',
                color: 'var(--text-primary)'
              }}
            >
              <Sparkles size={14} color="#ffd700" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Logged in with full access to all Vedic Muhurt predictions.
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="predict-button"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: '#ef4444',
                color: '#ef4444',
                width: '100%',
                justifyContent: 'center',
                padding: '8px 12px',
                fontSize: '0.82rem'
              }}
            >
              <LogOut size={16} /> Sign Out Account
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Forms */
          <>
            {/* Header Title */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--gold-primary, #ffd700)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Sparkles size={12} /> Sacred Portal Access
              </div>
              <h2 style={{ fontFamily: 'var(--heading-font)', fontSize: '1.2rem', color: 'var(--gold-primary, #ffd700)', margin: '2px 0 0' }}>
                {authMode === 'signin' ? 'Sign In to Account' : 'Create New Account'}
              </h2>
              {authMode === 'signup' && (
                <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '4px', fontWeight: 600, backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block' }}>
                  🎁 Get 3 Free Credits on Sign Up to test predictions!
                </div>
              )}
            </div>

            {/* Mode Switch Tabs (Sign In vs Sign Up) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '3px',
                borderRadius: '10px',
                marginBottom: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: authMode === 'signin' ? 'var(--gold-primary, #ffd700)' : 'transparent',
                  color: authMode === 'signin' ? '#0a081a' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <LogIn size={13} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: authMode === 'signup' ? 'var(--gold-primary, #ffd700)' : 'transparent',
                  color: authMode === 'signup' ? '#0a081a' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <UserPlus size={13} /> Sign Up
              </button>
            </div>

            {/* Error & Success Feedback Messages */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  marginBottom: '10px'
                }}
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#4ade80',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={14} /> {successMsg}
              </div>
            )}

            {/* FORM AREA */}
            {authMode === 'signin' ? (
              /* SIGN IN FORM */
              <form onSubmit={handleSignIn}>
                {/* Email or Phone Field */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Email address or mobile number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type="text"
                      placeholder="Email address or mobile number"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 32px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{
                  margin: '8px 0 12px 0',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px dashed rgba(234, 179, 8, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  color: '#fde047'
                }}>
                  🔑 <strong>Demo Login (Offline / No-DB):</strong><br />
                  ID: <code style={{ color: '#fff' }}>muhurtp@gmail.com</code> | Pass: <code style={{ color: '#fff' }}>muhurt123</code>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="predict-button"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '8px 12px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    <>
                      <LogIn size={15} /> Sign In
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp}>
                {/* Full Name */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        padding: '6px 6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#ffd700',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 32px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 215, 0, 0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 32px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 500 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold-primary)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.8rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="predict-button"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '8px 12px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} /> Complete Sign Up
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
