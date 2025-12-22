import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCarSide, FaUserFriends, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="logo">GearGIK</div>
        <div className="nav-links">
          <button className="nav-btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Student Mobility, <span className="highlight">Simplified.</span></h1>
          <p className="hero-subtitle">
            The exclusive peer-to-peer car sharing platform for GIKI students. 
            Rent a car for the weekend or book a seat for your next trip home.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn-main" onClick={() => navigate('/signup')}>
              Get Started <FaArrowRight />
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
              Browse Cars
            </button>
          </div>
        </div>
        <div className="hero-visuals">
          {/* Abstract representation or car image */}
          <div className="glass-card">
            <div className="glass-icon"><FaCarSide /></div>
            <div>
              <strong>20+ Vehicles</strong>
              <span>Available on campus</span>
            </div>
          </div>
          <div className="glass-card float-right">
            <div className="glass-icon"><FaUserFriends /></div>
            <div>
              <strong>Seat Sharing</strong>
              <span>Travel together, save money</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="section-header-center">
          <h2>Why Choose GearGIK?</h2>
          <p>Built by students, for students.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper blue"><FaCarSide /></div>
            <h3>Rent a Car</h3>
            <p>Need a car for a day out? Rent directly from fellow students at affordable hourly rates.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper green"><FaUserFriends /></div>
            <h3>Share a Seat</h3>
            <p>Heading to Islamabad or Peshawar? Book a single seat in a shared ride and split the cost.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper purple"><FaShieldAlt /></div>
            <h3>Verified Community</h3>
            <p>Safe and secure. Every user is verified with their university registration details.</p>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Got a car on campus?</h2>
          <p>Turn your idle vehicle into passive income. List your car or offer seats for your next trip.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>Become a Host</button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>GearGIK</h3>
            <p>© 2025 GearGIK Inc.</p>
          </div>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;