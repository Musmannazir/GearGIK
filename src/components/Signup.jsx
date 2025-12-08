import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

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
    
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordMatch(
        name === 'confirmPassword' 
          ? value === formData.password 
          : value === formData.confirmPassword
      );
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!passwordMatch) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', 'renter');

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
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
                <span className="feature-icon">⭐</span>
                <span>Exclusive Deals</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Quick Booking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎁</span>
                <span>Loyalty Rewards</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-box">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join GearGIK today</p>
            
            <form onSubmit={handleSignup}>
              {error && <div style={{ color: '#ff6b6b', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>{error}</div>}
              
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  id="fullName"
                  type="text" 
                  name="fullName"
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  name="email"
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password"
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword"
                  type="password" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={!passwordMatch && formData.confirmPassword ? 'input-error' : ''}
                  required 
                />
                {!passwordMatch && formData.confirmPassword && 
                  <p className="error-text">Passwords do not match</p>
                }
              </div>
              
              <label className="terms-checkbox">
                <input type="checkbox" required /> 
                I agree to the Terms & Conditions
              </label>
              
              <button type="submit" className="auth-btn" disabled={isLoading || !passwordMatch}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>Already have an account? <Link to="/" className="auth-link">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;