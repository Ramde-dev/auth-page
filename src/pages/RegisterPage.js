import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInWithGitHub, saveUserToFirestore } from '../firebase';

const RegisterPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // Email/password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!email || !password || !confirmPassword) {
      setMessage({ text: 'All fields are required', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    if (!agreeTerms) {
      setMessage({ text: 'You must agree to the terms and conditions', type: 'error' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });
      setMessage({ text: 'Account created! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      let errorMsg = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') errorMsg = 'Email already registered';
      if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address';
      if (error.code === 'auth/weak-password') errorMsg = 'Password is too weak (min 6 chars)';
      setMessage({ text: errorMsg, type: 'error' });
    }
  };

  // Google sign‑up
  const handleGoogleSignUp = async () => {
    setMessage({ text: '', type: '' });
    try {
      const user = await signInWithGoogle(false);
      await saveUserToFirestore(user);
      onLogin(user.email);
      navigate('/');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setMessage({ text: `Google sign‑up failed: ${error.message}`, type: 'error' });
      }
    }
  };

  // GitHub sign‑up (new)
  const handleGitHubSignUp = async () => {
    setMessage({ text: '', type: '' });
    try {
      const user = await signInWithGitHub(false);
      await saveUserToFirestore(user);
      onLogin(user.email);
      navigate('/');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setMessage({ text: `GitHub sign‑up failed: ${error.message}`, type: 'error' });
      }
    }
  };

  const handleSocialSignup = (provider) => {
    if (provider === 'Google') {
      handleGoogleSignUp();
    } else if (provider === 'GitHub') {
      handleGitHubSignUp();
    } else {
      alert(`Signing up with ${provider} – not implemented.`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="subtitle">Join us today – it only takes a minute.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label>Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retype password"
              autoComplete="off"
            />
          </div>

          <div className="options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>I agree to the <a href="/terms" className="inline-link">Terms</a> and <a href="/privacy" className="inline-link">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary">Sign up with email</button>
        </form>

        <div className="divider"><span>or sign up with</span></div>

        <div className="social-buttons-vertical">
          <button onClick={() => handleSocialSignup('Google')} className="social-btn google">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button onClick={() => handleSocialSignup('GitHub')} className="social-btn github">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#333" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.72-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;