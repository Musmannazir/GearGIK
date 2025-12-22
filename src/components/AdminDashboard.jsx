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

  // --- HARDCODED CREDENTIALS ---
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
      
      // You need to create this endpoint in your backend: GET /admin/data
      const response = await fetch(`${API_URL}/admin/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if(response.ok) {
        const data = await response.json();
        setUsers(data.users); // Array of all users with debt info
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
    
    // Call Backend: PUT /admin/users/:id/clear-debt
    // Update local state to reflect change
    const updatedUsers = users.map(u => u._id === userId ? { ...u, debt: 0 } : u);
    setUsers(updatedUsers);
    alert("Bill Cleared! User can now post ads.");
  };

  const handleApproveAccount = async (userId) => {
    // Call Backend: PUT /admin/users/:id/approve
    const updatedUsers = users.map(u => u._id === userId ? { ...u, isApproved: true } : u);
    setUsers(updatedUsers);
    alert("Account Approved! User can post beyond 3 ads.");
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Are you sure? This will delete the user and their ads.")) return;
    // Call Backend: DELETE /admin/users/:id
    setUsers(users.filter(u => u._id !== userId));
  };

  const handleDeletePost = async (vehicleId) => {
    if(!window.confirm("Remove this post?")) return;
    // Call Backend: DELETE /vehicles/:id
    setVehicles(vehicles.filter(v => v._id !== vehicleId));
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h2>Admin Login</h2>
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
            <button type="submit" style={styles.btn}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => setIsAuthenticated(false)} style={styles.logoutBtn}>Logout</button>
      </div>

      {loading ? <p>Loading records...</p> : (
        <>
          {/* USER MANAGEMENT SECTION */}
          <div style={styles.section}>
            <h2>User Management & Payments</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Ads Posted</th>
                  <th>Platform Debt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{backgroundColor: user.debt >= 60 ? '#ffebee' : 'transparent'}}>
                    <td>
                        {user.fullName} <br/>
                        <small>{user.email}</small>
                    </td>
                    <td>{user.adsPosted || 0} / 3</td>
                    <td style={{color: user.debt >= 60 ? 'red' : 'green', fontWeight:'bold'}}>
                      PKR {user.debt || 0}
                    </td>
                    <td>
                      {user.debt >= 60 ? '⛔ BLOCKED (Unpaid)' : 'Active'} <br/>
                      {!user.isApproved && user.adsPosted >= 3 ? '⚠️ Needs Approval' : ''}
                    </td>
                    <td>
                      {user.debt >= 60 && (
                        <button onClick={() => handleApprovePayment(user._id)} style={styles.payBtn}>
                           ✅ Clear Bill (60)
                        </button>
                      )}
                      
                      {!user.isApproved && user.adsPosted >= 3 && (
                        <button onClick={() => handleApproveAccount(user._id)} style={styles.approveBtn}>
                           ⭐ Approve Account
                        </button>
                      )}

                      <button onClick={() => handleDeleteUser(user._id)} style={styles.deleteBtn}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* POST MANAGEMENT SECTION */}
          <div style={styles.section}>
            <h2>All Posts</h2>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'15px'}}>
              {vehicles.map(v => (
                <div key={v._id} style={styles.card}>
                   <img src={v.image} alt="car" style={{width:'100%', height:'100px', objectFit:'cover'}}/>
                   <div style={{padding:'10px'}}>
                     <h4>{v.name}</h4>
                     <p>Owner: {v.owner?.fullName}</p>
                     <button onClick={() => handleDeletePost(v._id)} style={styles.deleteBtnFull}>Remove Post</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  loginContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' },
  loginBox: { padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '300px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' },
  btn: { width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  section: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  payBtn: { background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.8rem' },
  approveBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '0.8rem' },
  deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  deleteBtnFull: { width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  card: { border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' },
  logoutBtn: { padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default AdminDashboard;