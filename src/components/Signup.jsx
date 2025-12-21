import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Use environment variable for backend URL with fallback
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
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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

      // SUCCESS: Show verification message
      setRegisteredEmail(formData.email);
      setShowVerificationMessage(true);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If showing verification message
  if (showVerificationMessage) {
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
            <div className="auth-box" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✉️</div>
              <h2>Verify Your Email</h2>
              <p className="auth-subtitle">Almost there!</p>
              
              <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                textAlign: 'left',
                color: '#1565c0'
              }}>
                <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  We've sent a verification email to <strong>{registeredEmail}</strong>
                </p>
                <p style={{ marginBottom: '0', lineHeight: '1.6' }}>
                  Please click the link in the email to confirm your account. This link will expire in 24 hours.
                </p>
              </div>

              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>

              <button 
                onClick={() => setShowVerificationMessage(false)}
                className="auth-btn"
                style={{ marginBottom: '10px' }}
              >
                Back to Sign Up
              </button>

              <Link to="/" className="auth-link" style={{ display: 'block', marginTop: '10px' }}>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {error && (
                <div style={{ color: '#ff6b6b', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>
                  {error}
                </div>
              )}
              
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
              {error && (
                <div style={{ color: '#ff6b6b', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px' }}>
                  {error}
                </div>
              )}
              
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
