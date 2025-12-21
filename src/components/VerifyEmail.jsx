import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

function VerifyEmail() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Link may be expired.');
          return;
        }

        setStatus('success');
        setMessage(data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        console.error('Verification error:', error);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

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
            {status === 'verifying' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>⏳</div>
                <h2>Verifying Email</h2>
                <p className="auth-subtitle">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h2>Email Verified!</h2>
                <p className="auth-subtitle">{message}</p>
                <p style={{ color: '#666', marginTop: '20px', fontSize: '14px' }}>
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                <h2>Verification Failed</h2>
                <p className="auth-subtitle" style={{ color: '#d32f2f' }}>{message}</p>
                <button 
                  onClick={() => navigate('/signup')}
                  className="auth-btn"
                  style={{ marginTop: '20px' }}
                >
                  Back to Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
