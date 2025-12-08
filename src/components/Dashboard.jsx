import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Use environment variable for backend with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-2.onrender.com/api';

// Available Locations
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
  const [bookingData, setBookingData] = useState({ hours: 1, location: '', phone: '', regNo: '' });
  const [totalCost, setTotalCost] = useState(0);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const [newCar, setNewCar] = useState({
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchVehicles();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedVehicle) {
        setSelectedVehicle(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const vehicleUrl = `${API_URL}/vehicles`;
      console.log('Using API_URL:', API_URL);
      console.log('Fetching vehicles from:', vehicleUrl);
      
      const response = await fetch(vehicleUrl);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('API response not ok. Status:', response.status);
        const data = await response.json();
        throw new Error(data.error || `Failed to load vehicles (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Vehicles fetched successfully:', data);
      setVehicleList(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
      setVehicleList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setTotalCost(vehicle.pricePerHour * 1);
  };

  const handleHoursChange = (e) => {
    const hours = parseInt(e.target.value);
    setBookingData({ ...bookingData, hours });
    if (selectedVehicle) {
      setTotalCost(selectedVehicle.pricePerHour * hours);
    }
  };

  const confirmBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.phone || !bookingData.regNo) {
      alert('Please enter your phone number and registration number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          duration: bookingData.hours,
          pickupLocation: selectedVehicle.location,
          startTime: new Date(),
          phone: bookingData.phone,
          regNo: bookingData.regNo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      alert(`Booking Confirmed!\n\nVehicle: ${selectedVehicle.name}\nDuration: ${bookingData.hours} hour(s)\nLocation: ${selectedVehicle.location}\nTotal Cost: PKR ${totalCost.toLocaleString()}`);
      setSelectedVehicle(null);
      setBookingData({ hours: 1, location: '', phone: '', regNo: '' });
      setTotalCost(0);
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
      console.error('Booking error:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewCar({ ...newCar, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewCar({
        ...newCar,
        features: [...newCar.features, featureInput]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx) => {
    setNewCar({
      ...newCar,
      features: newCar.features.filter((_, i) => i !== idx)
    });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    if (!newCar.name || !newCar.pricePerHour || !newCar.image || !newCar.phone || !newCar.regNo) {
      alert('Please fill in all required fields including phone and registration number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCar.name,
          type: newCar.type,
          pricePerHour: parseInt(newCar.pricePerHour),
          features: newCar.features,
          location: newCar.location,
          image: newCar.image,
          phone: newCar.phone,
          regNo: newCar.regNo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add car');
      }

      setVehicleList([data.vehicle, ...vehicleList]);
      
      setNewCar({
        name: '',
        type: 'Sedan',
        pricePerHour: '',
        features: [],
        location: 'FME',
        image: null,
        phone: '',
        regNo: '',
      });
      setImagePreview(null);
      setShowAddCarForm(false);
      
      setSuccessMessage('Car added successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error adding car: ${err.message}`);
      console.error('Add car error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">GearGIK Dashboard</h1>
          <p className="header-subtitle">Find and book amazing cars near you</p>
        </div>
        <div className="header-actions">
          <button className="add-car-btn" onClick={() => setShowAddCarForm(!showAddCarForm)}>
            {showAddCarForm ? '✕ Cancel' : '+ Add Car'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {successMessage && <div className="success-msg">{successMessage}</div>}

      {showAddCarForm && (
        <div className="add-car-form-container">
          <h2>Add Your Car</h2>
          <form onSubmit={handleAddCar} className="add-car-form">
            <div className="form-row">
              <div className="form-group">
                <label>Car Name *</label>
                <input
                  type="text"
                  value={newCar.name}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  placeholder="e.g., Honda Civic 2020"
                  required
                />
              </div>
              <div className="form-group">
                <label>Car Type</label>
                <select
                  value={newCar.type}
                  onChange={(e) => setNewCar({ ...newCar, type: e.target.value })}
                >
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Hatchback</option>
                  <option>Coupe</option>
                  <option>Truck</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price Per Hour (PKR) *</label>
                <input
                  type="number"
                  value={newCar.pricePerHour}
                  onChange={(e) => setNewCar({ ...newCar, pricePerHour: e.target.value })}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Phone Number *</label>
                <input
                  type="text"
                  value={newCar.phone}
                  onChange={(e) => setNewCar({ ...newCar, phone: e.target.value })}
                  placeholder="e.g., 03001234567"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your Registration Number *</label>
                <input
                  type="text"
                  value={newCar.regNo}
                  onChange={(e) => setNewCar({ ...newCar, regNo: e.target.value })}
                  placeholder="e.g., ABC-1234"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <select
                  value={newCar.location}
                  onChange={(e) => setNewCar({ ...newCar, location: e.target.value })}
                >
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Car Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            </div>

            <div className="form-group">
              <label>Features</label>
              <div className="feature-input-group">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., AC, Power Steering, ABS"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <button type="button" onClick={handleAddFeature}>Add Feature</button>
              </div>
              <div className="features-list">
                {newCar.features.map((feature, idx) => (
                  <span key={idx} className="feature-tag">
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="remove-feature"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn">Add Car</button>
          </form>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      <div className="vehicles-container">
        {loading ? (
          <div className="loading-spinner">
            <p className="loading">Loading vehicles...</p>
          </div>
        ) : vehicleList.length === 0 ? (
          <p className="no-vehicles">No vehicles available yet. Be the first to add one!</p>
        ) : (
          <div className="vehicles-grid">
            {vehicleList.map((vehicle) => {
              const isOwnCar = currentUser && vehicle.owner === currentUser._id;
              return (
                <div key={vehicle._id} className="vehicle-card">
                  <div className="vehicle-image-wrapper">
                    <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                    <span className="vehicle-type-badge">{vehicle.type}</span>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <h3>{vehicle.name}</h3>
                    </div>
                    
                    <p className="vehicle-price">PKR {vehicle.pricePerHour.toLocaleString()}/hour</p>
                    
                    <div className="owner-info-card">
                      <p><strong>Owner:</strong> {vehicle.owner?.fullName}</p>
                      <p><strong>📞</strong> {vehicle.ownerPhone}</p>
                      <p><strong>🏷️</strong> {vehicle.ownerRegNo}</p>
                    </div>

                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="features-container">
                        {vehicle.features.map((feature, idx) => (
                          <span key={idx} className="feature-badge">{feature}</span>
                        ))}
                      </div>
                    )}

                    <div className="card-footer">
                      {isOwnCar ? (
                        <p className="owned-tag">Your Car</p>
                      ) : !vehicle.isAvailable ? (
                        <button className="rent-btn-disabled" disabled>Already Booked</button>
                      ) : (
                        <button className="rent-btn" onClick={() => handleBookClick(vehicle)}>
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedVehicle(null)}
            >
              ✕
            </button>
            <h2>Book {selectedVehicle.name}</h2>
            
            <form onSubmit={confirmBooking} className="booking-form">
              <div className="form-group">
                <label>Owner Location:</label>
                <div className="location-display">
                  {selectedVehicle.location}
                </div>
              </div>

              <div className="form-group">
                <label>Duration (hours) *</label>
                <select value={bookingData.hours} onChange={handleHoursChange} required>
                  {[1, 2, 3, 4, 6, 8, 12, 24].map((hr) => (
                    <option key={hr} value={hr}>
                      {hr} hour{hr > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Your Phone Number *</label>
                <input
                  type="text"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="03001234567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Registration Number *</label>
                <input
                  type="text"
                  value={bookingData.regNo}
                  onChange={(e) => setBookingData({ ...bookingData, regNo: e.target.value })}
                  placeholder="ABC-1234"
                  required
                />
              </div>

              <div className="booking-summary">
                <p>Vehicle: <strong>{selectedVehicle.name}</strong></p>
                <p>Duration: <strong>{bookingData.hours} hour{bookingData.hours > 1 ? 's' : ''}</strong></p>
                <p>Price: <strong>PKR {selectedVehicle.pricePerHour}/hour</strong></p>
                <p className="total-cost">
                  Total: <strong>PKR {totalCost.toLocaleString()}</strong>
                </p>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setSelectedVehicle(null)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
