import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import './signup.css';

export default function Signup({ handleSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSignup = async () => {
    try {
      const authInstance = getAuth();
      const { user } = await createUserWithEmailAndPassword(authInstance, email, password);

      const userCollection = collection(db, 'users');
      const userProfileDoc = doc(userCollection, user.uid);
      await setDoc(userProfileDoc, {
        email,
        username: '',
        surname: '',
        image: '',
        contactNumber: '',
        address: ''
      });

      setEmail('');
      setPassword('');
      setError(null);

      // Send email verification
      await sendEmailVerification(authInstance.currentUser);

      setIsEmailSent(true);
      console.log('Email verification sent');
    } catch (error) {
      setError(error.message);
      console.log('Error signing up:', error);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {error && <p className="error-message">{error}</p>}
      {isEmailSent && (
        <div className="email-verification-modal">
          <p>A verification email has been sent to your email address.</p>
          <p>Please check your email and follow the instructions to verify your account.</p>
        </div>
      )}
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="signup-button" onClick={handleSignup}>Signup</button>
      <div className="switch-auth">
        <p>Already have an account?</p>
        <button onClick={handleSwitchToLogin}>Switch to Login</button>
      </div>
    </div>
  );
}
