import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMatch(
        name === 'password'
          ? value === formData.confirmPassword
          : value === formData.password
      );
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!passwordMatch) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // ✅ Redirect to login after successful signup
      navigate('/');

    } catch (err) {
      setError(err.message);
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
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-box">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join GearGIK today</p>

            <form onSubmit={handleSignup}>
              {error && (
                <div className="error-box">{error}</div>
              )}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={!passwordMatch ? 'input-error' : ''}
                  required
                />
                {!passwordMatch && <p className="error-text">Passwords do not match</p>}
              </div>

              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/">Sign in</Link></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;
