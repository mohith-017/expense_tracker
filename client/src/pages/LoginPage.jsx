// File: client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        const res = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        const res = await api.post('/auth/register', {
          name,
          username,
          password,
          confirmPassword,
        });
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed');
      }
    }
  };

  return (
    // Use the layout from the hostel's index.html
    <div className="login-page-wrapper">
      <div id="auth-box" className="auth-box frost-container">
        <div id={isLogin ? 'login-section' : 'signup-section'} className="form-section">
          <h2>{isLogin ? 'Expense Login' : 'Create Account'}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
              />
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            {!isLogin && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            )}
            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          </form>

          {/* Use the #message div for errors */}
          <div id="message" className={error ? 'error' : ''} style={{ display: error ? 'block' : 'none' }}>
            {error}
          </div>

          <p>
            {isLogin ? 'New here? ' : 'Already a member? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Create an Account' : 'Login Instead'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;