import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { FcGoogle } from 'react-icons/fc'; 
import { MdErrorOutline } from 'react-icons/md'; 

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setError('');

    // ✅ 1. VALID GMAIL CONSTRAINT
    // We trim whitespace and convert to lowercase to ensure accurate checking
    const email = formData.email.trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) {
      setError('Please use a valid Gmail address (ending in @gmail.com)');
      return;
    }

    // 2. Check Password Length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // 3. Check Password Match
    if (!passwordMatch) {
        setError('Passwords do not match');
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: email, // Send the trimmed/lowercased email
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`; 
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
              
              {/* Error Alert */}
              {error && (
                <div className="error-alert">
                  <MdErrorOutline className="error-icon" size={22} />
                  <span>{error}</span>
                </div>
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
                  placeholder="example@gmail.com" 
                  required
                />
              </div>

              <div className="form-group password-group">
                <label>Password</label>
                <div className="input-wrapper">
                    <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    />
                    <button 
                        type="button" 
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {formData.password && formData.password.length < 8 && (
                    <p className="hint-text" style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>
                        Must be at least 8 characters
                    </p>
                )}
              </div>

              <div className="form-group password-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={!passwordMatch ? 'input-error' : ''}
                    required
                    />
                    <button 
                        type="button" 
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {!passwordMatch && <p className="error-text">Passwords do not match</p>}
              </div>

              <button type="submit" className="auth-btn" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="divider">
                <span>OR</span>
            </div>

            <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogleSignup}
            >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
            </button>

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
