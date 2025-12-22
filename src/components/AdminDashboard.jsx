import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New State for Tab Switching
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'posts'

  const ADMIN_EMAIL = "gikigear123@gmail.com";
  const ADMIN_PASS = "021546388";

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (creds.email === ADMIN_EMAIL && creds.password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("Admin fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleApprovePayment = async (userId) => {
    if(!window.confirm("Confirm that this user has paid 60 PKR?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/admin/users/${userId}/clear-debt`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        setUsers(users.map(u => u._id === userId ? { ...u, debt: 0 } : u));
        alert("Bill Cleared!");
    } catch(err) { alert("Error clearing bill"); }
  };

  const handleApproveAccount = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/admin/users/${userId}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
        setUsers(users.map(u => u._id === userId ? { ...u, isApproved: true } : u));
        alert("Account Approved!");
    } catch(err) { alert("Error approving account"); }
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Are you sure? This will delete the user and their ads.")) return;
    setUsers(users.filter(u => u._id !== userId));
    // Add backend call here if needed
  };

  const handleDeletePost = async (vehicleId) => {
    if(!window.confirm("Remove this post?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/vehicles/${vehicleId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        setVehicles(vehicles.filter(v => v._id !== vehicleId));
    } catch(err) { alert("Error deleting post"); }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h2 style={{textAlign: 'center', marginBottom: '20px', color: '#1e293b'}}>Admin Portal</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={creds.email}
              onChange={e => setCreds({...creds, email: e.target.value})}
              style={styles.input}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={creds.password}
              onChange={e => setCreds({...creds, password: e.target.value})}
              style={styles.input}
            />
            <button type="submit" style={styles.loginBtn}>Secure Login</button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD LAYOUT ---
  return (
    <div style={styles.dashboardContainer}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <h2>⚙️ Admin</h2>
        </div>
        <nav style={styles.nav}>
          <button 
            style={activeTab === 'users' ? styles.navBtnActive : styles.navBtn} 
            onClick={() => setActiveTab('users')}
          >
            👥 Accounts
          </button>
          <button 
            style={activeTab === 'posts' ? styles.navBtnActive : styles.navBtn} 
            onClick={() => setActiveTab('posts')}
          >
            🚗 Posts
          </button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} style={styles.logoutBtn}>
          ↪ Logout
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1>{activeTab === 'users' ? 'User Management' : 'Vehicle Listings'}</h1>
          <button onClick={fetchData} style={styles.refreshBtn}>🔄 Refresh Data</button>
        </header>

        {loading ? <div style={styles.loading}>Loading data...</div> : (
          <div style={styles.contentArea}>
            
            {/* TAB: USERS */}
            {activeTab === 'users' && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Status</th>
                      <th>Debt</th>
                      <th>Ads</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #eee', background: user.debt >= 60 ? '#fff1f2' : 'white' }}>
                        <td style={{padding: '12px'}}>
                            <div style={{fontWeight: 'bold'}}>{user.fullName}</div>
                            <div style={{fontSize: '0.85rem', color: '#64748b'}}>{user.email}</div>
                        </td>
                        <td style={{padding: '12px'}}>
                            {user.debt >= 60 ? <span style={styles.badgeBlocked}>Blocked</span> : <span style={styles.badgeActive}>Active</span>}
                            {!user.isApproved && user.adsPosted >= 3 && <div style={styles.badgeWarning}>Needs Approval</div>}
                        </td>
                        <td style={{padding: '12px', color: user.debt > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold'}}>
                            PKR {user.debt || 0}
                        </td>
                        <td style={{padding: '12px'}}>
                            {user.adsPosted || 0} / 3
                        </td>
                        <td style={{padding: '12px'}}>
                          <div style={{display: 'flex', gap: '8px'}}>
                            {user.debt >= 60 && (
                                <button onClick={() => handleApprovePayment(user._id)} style={styles.actionBtnGreen} title="Clear Debt">💰 Pay</button>
                            )}
                            {!user.isApproved && user.adsPosted >= 3 && (
                                <button onClick={() => handleApproveAccount(user._id)} style={styles.actionBtnBlue} title="Approve Account">⭐ Approve</button>
                            )}
                            <button onClick={() => handleDeleteUser(user._id)} style={styles.actionBtnRed} title="Delete User">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: POSTS */}
            {activeTab === 'posts' && (
              <div style={styles.grid}>
                {vehicles.map(v => (
                  <div key={v._id} style={styles.card}>
                     <div style={{height: '140px', overflow: 'hidden'}}>
                        <img src={v.image} alt="car" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                     </div>
                     <div style={{padding:'15px'}}>
                       <h3 style={{fontSize: '1.1rem', marginBottom: '5px'}}>{v.name}</h3>
                       <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '10px'}}>Owner: {v.owner?.fullName}</p>
                       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={styles.typeBadge}>{v.type}</span>
                            <button onClick={() => handleDeletePost(v._id)} style={styles.deleteBtnSmall}>Delete</button>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  // Login Styles
  loginContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' },
  loginBox: { padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '350px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' },
  loginBtn: { width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },

  // Dashboard Layout
  dashboardContainer: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc' },
  sidebar: { width: '250px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' },
  logoArea: { marginBottom: '40px', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 },
  mainContent: { flex: 1, padding: '30px', overflowY: 'auto' },
  
  // Navigation Buttons
  navBtn: { padding: '12px 15px', textAlign: 'left', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '1rem', borderRadius: '6px', transition: '0.2s' },
  navBtnActive: { padding: '12px 15px', textAlign: 'left', background: '#1e293b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', borderRadius: '6px', fontWeight: '600' },
  logoutBtn: { padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: 'auto' },

  // Content Styles
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  refreshBtn: { padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '40px', color: '#64748b' },
  contentArea: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },

  // Table Styles
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  
  // Badges
  badgeActive: { background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgeBlocked: { background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgeWarning: { background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '5px', display: 'inline-block' },
  typeBadge: { background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' },

  // Buttons
  actionBtnGreen: { background: '#22c55e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  actionBtnBlue: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  actionBtnRed: { background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtnSmall: { background: '#fff', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },

  // Grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s' }
};

export default AdminDashboard;
