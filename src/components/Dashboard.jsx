import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

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

  // Fetch vehicles on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchVehicles();
  }, []);

  // Close modal on Escape key
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
      
      const response = await fetch(`${API_URL}/vehicles`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load vehicles');
      }

      setVehicleList(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vehicles:', err);
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

  // Handle image upload
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">🚗 GearGIK Renter Dashboard</h1>
          <p className="header-subtitle">Rent vehicles by the hour at the best prices</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowAddCarForm(!showAddCarForm)} className="add-car-btn">
            {showAddCarForm ? '✕ Close' : '+ Add Your Car/Bike'}
          </button>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            navigate('/');
          }} className="logout-btn">Logout</button>
        </div>
      </div>

      {successMessage && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '5px', marginBottom: '15px', marginLeft: '20px', marginRight: '20px' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '5px', marginBottom: '15px', marginLeft: '20px', marginRight: '20px' }}>
          Error: {error}
        </div>
      )}

      <div className="search-filter-section">
        <input type="text" placeholder="Search vehicles..." className="search-input" />
        <select className="filter-select">
          <option>All Types</option>
          <option>Sedan</option>
          <option>SUV</option>
          <option>Electric</option>
        </select>
      </div>

      {showAddCarForm && (
        <div className="add-car-form-container">
          <form onSubmit={handleAddCar} className="add-car-form">
            <h3>Add Your Vehicle to Rent</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="car-name">Vehicle Name *</label>
                <input
                  id="car-name"
                  type="text"
                  placeholder="e.g., Toyota Corolla 2022"
                  value={newCar.name}
                  onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="car-type">Vehicle Type *</label>
                <select
                  id="car-type"
                  value={newCar.type}
                  onChange={(e) => setNewCar({ ...newCar, type: e.target.value })}
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Electric">Electric</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Van">Van</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="car-price">Hourly Rate (PKR) *</label>
                <input
                  id="car-price"
                  type="number"
                  placeholder="e.g., 1500"
                  value={newCar.pricePerHour}
                  onChange={(e) => setNewCar({ ...newCar, pricePerHour: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="car-location">Location *</label>
                <select
                  id="car-location"
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="car-phone">Your Phone Number *</label>
                <input
                  id="car-phone"
                  type="text"
                  placeholder="e.g., 03001234567"
                  value={newCar.phone}
                  onChange={(e) => setNewCar({ ...newCar, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="car-regno">Registration Number *</label>
                <input
                  id="car-regno"
                  type="text"
                  placeholder="e.g., GIK-2024-001"
                  value={newCar.regNo}
                  onChange={(e) => setNewCar({ ...newCar, regNo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="car-image">Upload Vehicle Image *</label>
              <div className="image-upload-group">
                <input
                  id="car-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-input"
                  required
                />
                <span className="image-upload-label">Click to upload or drag and drop</span>
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <p>Image preview</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Features</label>
              <div className="feature-input-group">
                <input
                  type="text"
                  placeholder="e.g., AC, Power Steering, Airbags"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <button type="button" onClick={handleAddFeature} className="add-feature-btn">Add</button>
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

            <div className="form-actions">
              <button type="submit" className="confirm-btn">Add Vehicle</button>
              <button 
                type="button" 
                onClick={() => setShowAddCarForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="section-title">Available Vehicles</h2>
      <div className="vehicle-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', fontSize: '18px' }}>
            Loading vehicles...
          </div>
        ) : vehicleList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', fontSize: '18px' }}>
            No vehicles available. Be the first to add one! 🚗
          </div>
        ) : (
          vehicleList.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-image-wrapper">
                <img src={vehicle.image || 'https://via.placeholder.com/300x200'} alt={vehicle.name} className="vehicle-image" />
                <span className="vehicle-type-badge">{vehicle.type}</span>
              </div>
              <div className="card-content">
                <div className="card-header">
                  <h3>{vehicle.name}</h3>
                  <span className="rating">⭐ {(vehicle.rating || 0).toFixed(1)}</span>
                </div>
                <p className="reviews-count">({vehicle.reviews?.length || 0} reviews)</p>
                <p className="owner-name">Owner: {vehicle.owner?.fullName || 'Unknown'}</p>
                <p className="location-info">📍 {vehicle.location}</p>
                <div className="features">
                  {vehicle.features?.slice(0, 2).map((feature, idx) => (
                    <span key={idx} className="feature-badge">{feature}</span>
                  ))}
                </div>
                <p className="price">PKR {vehicle.pricePerHour?.toLocaleString()}/hour</p>
                {vehicle.isAvailable ? (
                  <button onClick={() => handleBookClick(vehicle)} className="rent-btn">Rent Now</button>
                ) : (
                  <button disabled className="rent-btn-disabled">🔒 Already Booked</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedVehicle && (
        <div className="booking-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book {selectedVehicle.name}</h3>
              <button className="close-btn" onClick={() => setSelectedVehicle(null)}>✕</button>
            </div>
            
            <div className="modal-vehicle-info">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} />
              <div className="vehicle-info-text">
                <p><strong>{selectedVehicle.name}</strong></p>
                <p className="owner-info">Owner: {selectedVehicle.owner?.fullName || 'Unknown'}</p>
                <p className="owner-phone">📞 {selectedVehicle.ownerPhone || 'Not provided'}</p>
                <p className="owner-regno">🏷️ {selectedVehicle.ownerRegNo || 'Not provided'}</p>
                <p className="price-highlight">PKR {selectedVehicle.pricePerHour.toLocaleString()}/hour</p>
              </div>
            </div>
            
            <form onSubmit={confirmBooking}>
              <div className="form-group">
                <label htmlFor="hours">Rental Duration (Hours)</label>
                <input 
                  id="hours"
                  type="number"
                  min="1"
                  max="72"
                  value={bookingData.hours}
                  onChange={handleHoursChange}
                  required 
                />
              </div>

              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Hourly Rate:</span>
                  <span>PKR {selectedVehicle.pricePerHour.toLocaleString()}</span>
                </div>
                <div className="cost-row">
                  <span>Duration:</span>
                  <span>{bookingData.hours} hour(s)</span>
                </div>
                <div className="cost-row total">
                  <span>Total Cost:</span>
                  <span>PKR {totalCost.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Pick-up Location</label>
                <p className="location-display">{selectedVehicle.location}</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="renter-phone">Your Phone Number *</label>
                  <input
                    id="renter-phone"
                    type="text"
                    placeholder="e.g., 03001234567"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="renter-regno">Your Registration No *</label>
                  <input
                    id="renter-regno"
                    type="text"
                    placeholder="e.g., GIK-2024-001"
                    value={bookingData.regNo}
                    onChange={(e) => setBookingData({...bookingData, regNo: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setSelectedVehicle(null)}>Cancel</button>
                <button type="submit" className="confirm-btn">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;