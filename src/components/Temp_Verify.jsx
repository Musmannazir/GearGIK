import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Use environment variable for backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        
        if (response.ok) {
          setStatus('✅ Email Verified Successfully!');
          setIsSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus(`❌ Error: ${data.error}`);
        }
      } catch (err) {
        setStatus('❌ Verification failed. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('❌ Invalid verification link.');
    }
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Email Verification</h2>
        <p style={{ fontSize: '1.2rem', margin: '20px 0', color: isSuccess ? 'green' : 'red' }}>
          {status}
        </p>
        {isSuccess && <p>Redirecting to login page...</p>}
      </div>
    </div>
  );
}

// Simple internal styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  }
};

export default Verify;