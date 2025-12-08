import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Use environment variable for backend URL
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-left">
          <div className="brand-section">
            <h1>GearGIK</h1>
            <p>Premium Vehicle Rental Service</p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🚗</span>
                <span>Wide Selection</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span>Best Prices</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>Secure & Safe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-box">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>

            <form onSubmit={handleLogin}>
              {error && (
                <div style={{ color: '#ff6b6b', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/signup" className="auth-link">Create one</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
