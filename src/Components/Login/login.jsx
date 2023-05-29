import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import './login.css'; // Import CSS file for styling

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

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

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
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
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
