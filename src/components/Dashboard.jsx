import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

const AVAILABLE_LOCATIONS = [
  { value: 'FME', label: 'FME' },
  { value: 'FCSE', label: 'FCSE' },
  { value: 'AcB', label: 'AcB' },
  { value: 'FMCE', label: 'FMCE' },
  { value: 'H11/12', label: 'H11/12' },
  { value: 'Brabers', label: 'Brabers' },
  { value: 'H9/10', label: 'H9/10' },
  { value: 'H1/2', label: 'H1/2' },
  { value: 'H5/6', label: 'H5/6' },
  { value: 'H3/4', label: 'H3/4' },
];

function Dashboard() {
  const navigate = useNavigate();

  const [vehicleList, setVehicleList] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({ hours: 1, phone: '', regNo: '' });
  const [totalCost, setTotalCost] = useState(0);

  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'Sedan',
    pricePerHour: '',
    features: [],
    location: 'FME',
    image: null,
    phone: '',
    regNo: '',
  });

  const [featureInput, setFeatureInput] = useState('');

  /* ================= FETCH USER & VEHICLES ================= */

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/vehicles`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load vehicles');
      setVehicleList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD / UPDATE VEHICLE ================= */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setNewVehicle({ ...newVehicle, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setNewVehicle({
      ...newVehicle,
      features: [...newVehicle.features, featureInput],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setNewVehicle({
      ...newVehicle,
      features: newVehicle.features.filter((_, i) => i !== idx),
    });
  };

  const submitVehicle = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const method = editingVehicleId ? 'PUT' : 'POST';
    const url = editingVehicleId
      ? `${API_URL}/vehicles/${editingVehicleId}`
      : `${API_URL}/vehicles`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newVehicle,
          pricePerHour: parseInt(newVehicle.pricePerHour),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(editingVehicleId ? 'Vehicle updated successfully ✅' : 'Vehicle added successfully 🎉');
      setShowAddVehicleForm(false);
      setEditingVehicleId(null);
      setImagePreview(null);
      fetchVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle._id);
    setNewVehicle({
      name: vehicle.name,
      type: vehicle.type,
      pricePerHour: vehicle.pricePerHour,
      features: vehicle.features,
      location: vehicle.location,
      image: vehicle.image,
      phone: vehicle.ownerPhone,
      regNo: vehicle.ownerRegNo,
    });
    setImagePreview(vehicle.image);
    setShowAddVehicleForm(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    const token = localStorage.getItem('token');

    await fetch(`${API_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchVehicles();
  };

  /* ================= BOOKING ================= */

  const handleBookClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setTotalCost(vehicle.pricePerHour);
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vehicleId: selectedVehicle._id,
        duration: bookingData.hours,
        phone: bookingData.phone,
        regNo: bookingData.regNo,
      }),
    });

    if (!res.ok) return alert('Booking failed');
    alert('Booking Confirmed ✅');
    setSelectedVehicle(null);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>GearGIK Dashboard</h1>
        <div>
          <button onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}>
            {showAddVehicleForm ? '✕ Cancel' : '+ Add Vehicle'}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {successMessage && <p className="success-msg">{successMessage}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* ADD / EDIT VEHICLE */}
      {showAddVehicleForm && (
        <form onSubmit={submitVehicle} className="add-vehicle-form">
          <h2>{editingVehicleId ? '✏️ Edit Vehicle' : '➕ Add Vehicle'}</h2>

          <input placeholder="Vehicle Name" value={newVehicle.name}
            onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} required />

          <input type="number" placeholder="Price Per Hour"
            value={newVehicle.pricePerHour}
            onChange={e => setNewVehicle({ ...newVehicle, pricePerHour: e.target.value })} required />

          <input placeholder="Phone"
            value={newVehicle.phone}
            onChange={e => setNewVehicle({ ...newVehicle, phone: e.target.value })} required />

          <input placeholder="Registration No"
            value={newVehicle.regNo}
            onChange={e => setNewVehicle({ ...newVehicle, regNo: e.target.value })} required />

          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && <img src={imagePreview} alt="preview" width="120" />}

          <button type="submit">
            {editingVehicleId ? '💾 Update Vehicle' : '➕ Add Vehicle'}
          </button>
        </form>
      )}

      {/* VEHICLES GRID */}
      <div className="vehicles-grid">
        {loading ? 'Loading...' : vehicleList.map(vehicle => {
          const isOwner =
            currentUser &&
            ((typeof vehicle.owner === 'string' && vehicle.owner === currentUser._id) ||
              (vehicle.owner?._id === currentUser._id));

          return (
            <div key={vehicle._id} className="vehicle-card">
              <img src={vehicle.image} alt={vehicle.name} />
              <h3>{vehicle.name}</h3>
              <p>PKR {vehicle.pricePerHour}/hour</p>

              {isOwner ? (
                <>
                  <button onClick={() => handleEditVehicle(vehicle)}>✏️ Edit</button>
                  <button onClick={() => handleDeleteVehicle(vehicle._id)}>🗑️ Delete</button>
                </>
              ) : (
                <button onClick={() => handleBookClick(vehicle)}>Book Now</button>
              )}
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {selectedVehicle && (
        <div className="modal">
          <h2>Book {selectedVehicle.name}</h2>
          <form onSubmit={confirmBooking}>
            <input placeholder="Phone" required
              onChange={e => setBookingData({ ...bookingData, phone: e.target.value })} />
            <input placeholder="Reg No" required
              onChange={e => setBookingData({ ...bookingData, regNo: e.target.value })} />
            <button type="submit">Confirm Booking</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
