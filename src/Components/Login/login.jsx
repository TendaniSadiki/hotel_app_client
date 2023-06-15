import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import './login.css'; // Import CSS file for styling

export default function Login({ handleSwitchToSignup, handleCloseModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      const authInstance = getAuth(); // Get the auth instance
      // Sign in the user with the provided email and password
      await signInWithEmailAndPassword(authInstance, email, password);
      // Clear the form fields
      setEmail('');
      setPassword('');
      setError(null);
      // Optionally, you can perform additional actions after successful login
      console.log('User logged in successfully!');
    } catch (error) {
      // Handle login errors
      setError(error.message);
      console.log('Error logging in:', error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const authInstance = getAuth(); // Get the auth instance
      // Send password reset email to the provided email address
      await sendPasswordResetEmail(authInstance, resetEmail);
      setResetSuccess(true);
      setResetError(null);
      setResetEmail('');
      console.log('Password reset email sent!');
    } catch (error) {
      setResetSuccess(false);
      setResetError(error.message);
      console.log('Error sending password reset email:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <label>Email:</label>
      <input
      autoComplete='on'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>Password:</label>
      <input
      autoComplete='on'
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>

      <div className="forgot-password-link">
        <p onClick={() => setShowResetModal(true)}>Forgot password?</p>
      </div>

      <div className="switch-auth">
        <p>Don't have an account?</p>
        <button onClick={handleSwitchToSignup}>Switch to Signup</button>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="reset-password-modal">
          <div className="reset-password-content">
            <button className="close-button" onClick={() => setShowResetModal(false)}>
              x
            </button>
            <h3>Reset Password</h3>
            <p>
              Enter your email address below and we'll send you a link to reset
              your password.
            </p>
            {resetSuccess && (
              <p className="reset-success-message">
                Password reset email sent. Please check your email.
              </p>
            )}
            {resetError && (
              <p className="reset-error-message">{resetError}</p>
            )}
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <div className="reset-password-actions">
              <button onClick={handleForgotPassword}>Send Reset Email</button>
              <button onClick={() => setShowResetModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
