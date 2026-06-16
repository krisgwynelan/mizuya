// ─────────────────────────────────────────────────────────────────────────────
//  src/components/admin/AdminLogin.jsx  —  Firebase Auth version
//  Design is 100% unchanged. Only the login logic is swapped to Firebase.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.js';
import styles from '../../styles/admin/AdminLogin.module.css';

const AdminLogin = ({ onLogin }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Pass the Firebase user object so AdminDashboard receives { email, uid, … }
      onLogin({ email: credential.user.email, uid: credential.user.uid });
    } catch (err) {
      // Map Firebase error codes to human-friendly messages
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Incorrect email or password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please wait a moment and try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        default:
          setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.kanji}>管理</div>
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Mizuya Exclusive Resort</p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="admin@mizuya.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <p className={styles.error}>⚠ {error}</p>}

          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>Sign In <span>→</span></>
            )}
          </button>
        </div>

        {/* Remove or hide this hint block in production */}
        <p className={styles.hint}>
          Sign in with your Firebase account credentials.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;