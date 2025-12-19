import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Use environment variable for backend with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://geargik-backend-3.onrender.com/api';

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
  const [editingCar, setEditingCar] = useState(null);
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
        throw new Error(data.error || 'Failed to add vehicle');
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
      
      setSuccessMessage('vehicle added successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error adding car: ${err.message}`);
      console.error('Add vehicle error:', err);
    }
  };

  const handleDeleteCar = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to remove this car from your fleet?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      setVehicleList(vehicleList.filter(v => v._id !== vehicleId));
      setSuccessMessage('Car removed successfully! 🗑️');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error deleting car: ${err.message}`);
      console.error('Delete error:', err);
    }
  };

  const handleEditCar = (vehicle) => {
    setEditingCar(vehicle._id);
    setNewCar({
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
    setShowAddCarForm(true);
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    
    if (!newCar.name || !newCar.pricePerHour) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/vehicles/${editingCar}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update car');
      }

      setVehicleList(vehicleList.map(v => v._id === editingCar ? data.vehicle : v));
      
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
      setEditingCar(null);
      
      setSuccessMessage('Car updated successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error updating car: ${err.message}`);
      console.error('Update error:', err);
    }
  };

  const handleMakeAvailable = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      const updatedVehicle = await response.json();
      setVehicleList(vehicleList.map(v => v._id === vehicleId ? updatedVehicle.vehicle : v));
      setSuccessMessage('Car is available for rent again! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error updating car: ${err.message}`);
      console.error('Update error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
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
  };

  // Find cars owned by the current user (handle both string and object for owner)
  const myCars = currentUser ? vehicleList.filter(v => {
    if (!v.owner || !currentUser._id) return false;
    if (typeof v.owner === 'string') return v.owner === currentUser._id;
    if (typeof v.owner === 'object' && v.owner._id) return v.owner._id === currentUser._id;
    return false;
  }) : [];

  // State for remove dialog
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedRemoveCar, setSelectedRemoveCar] = useState('');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">GearGIK Dashboard</h1>
          <p className="header-subtitle">Find and book amazing cars near you</p>
        </div>
        <div className="header-actions">
          <button className="add-car-btn" onClick={() => {
            if (editingCar) {
              handleCancelEdit();
            } else {
              setShowAddCarForm(!showAddCarForm);
            }
          }}>
            {showAddCarForm ? '✕ Cancel' : '+ Add vehicle'}
          </button>
          {myCars.length > 0 && (
            <button className="remove-listing-btn" onClick={() => setShowRemoveDialog(true)}>
              🗑️ Remove My Listing
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {/* Remove Listing Dialog */}
      {showRemoveDialog && (
        <div className="modal-overlay" onClick={() => setShowRemoveDialog(false)}>
          <div className="remove-listing-modal" onClick={e => e.stopPropagation()}>
            <h2>Remove Your Car Listing</h2>
            <p>Select a car to remove from your listings:</p>
            <select
              value={selectedRemoveCar}
              onChange={e => setSelectedRemoveCar(e.target.value)}
              className="remove-car-select"
            >
              <option value="">-- Select Your Car --</option>
              {myCars.map(car => (
                <option key={car._id} value={car._id}>{car.name}</option>
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={() => setShowRemoveDialog(false)} className="cancel-btn">Cancel</button>
              <button
                className="confirm-btn"
                disabled={!selectedRemoveCar}
                onClick={() => {
                  if (selectedRemoveCar) {
                    handleDeleteCar(selectedRemoveCar);
                    setShowRemoveDialog(false);
                    setSelectedRemoveCar('');
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && <div className="success-msg">{successMessage}</div>}

      {showAddCarForm && (
        <div className="add-car-form-container">
          <h2>{editingCar ? '✏️ Edit Your Car' : '➕ Add Your Car'}</h2>
          <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="add-car-form">
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
                <label>Vehicle Type</label>
                <select
                  value={newCar.type}
                  onChange={(e) => setNewCar({ ...newCar, type: e.target.value })}
                >
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Hatchback</option>
                  <option>Coupe</option>
                  <option>Truck</option>
                  <option>Bike</option>
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

            <button type="submit" className="submit-btn">
              {editingCar ? '💾 Update  vehicle' : '➕ Add vehicle'}
            </button>
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
              // Robust check for ownership
              const isOwnCar = currentUser && (
                (typeof vehicle.owner === 'string' && vehicle.owner === currentUser._id) ||
                (typeof vehicle.owner === 'object' && vehicle.owner && vehicle.owner._id === currentUser._id)
              );
              return (
                <div key={vehicle._id} className="vehicle-card">
                  <div className="vehicle-image-wrapper">
                    <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                    <span className="vehicle-type-badge">{vehicle.type}</span>
                    {/* Show delete cross for owner's cars */}
                    {isOwnCar && (
                      <button
                        className="delete-cross-btn"
                        title="Delete this ad"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this ad?')) {
                            handleDeleteCar(vehicle._id);
                          }
                        }}
                      >
                        ×
                      </button>
                    )}
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
                        <div className="owner-actions">
                          <p className="owned-tag">Your Car</p>
                          <div className="owner-buttons">
                            <button 
                              className="edit-car-btn"
                              onClick={() => handleEditCar(vehicle)}
                            >
                              ✏️ Edit
                            </button>
                            {!vehicle.isAvailable && (
                              <button 
                                className="make-available-btn"
                                onClick={() => handleMakeAvailable(vehicle._id)}
                              >
                                📋 Available
                              </button>
                            )}
                            <button 
                              className="delete-car-btn"
                              onClick={() => handleDeleteCar(vehicle._id)}
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>
                      ) : !vehicle.isAvailable ? (
                        <button className="rent-btn-rented" disabled>
                          🔒 Rented
                        </button>
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
            
            <div className="modal-vehicle-card">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="modal-vehicle-image" />
              <div className="modal-vehicle-details">
                <h2>{selectedVehicle.name}</h2>
                <p className="modal-vehicle-type">{selectedVehicle.type}</p>
                <p className="modal-vehicle-price">PKR {selectedVehicle.pricePerHour.toLocaleString()}/hour</p>
              </div>
            </div>

            <form onSubmit={confirmBooking} className="booking-form">
              <div className="booking-section">
                <h3>Booking Details</h3>
                
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
                  <label>Owner Location</label>
                  <div className="location-display">
                    📍 {selectedVehicle.location}
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3>Your Information</h3>
                
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
              </div>

              <div className="booking-summary-compact">
                <div className="summary-row">
                  <span>Vehicle:</span>
                  <strong>{selectedVehicle.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <strong>{bookingData.hours} hour{bookingData.hours > 1 ? 's' : ''}</strong>
                </div>
                <div className="summary-row">
                  <span>Rate:</span>
                  <strong>PKR {selectedVehicle.pricePerHour.toLocaleString()}/hour</strong>
                </div>
                <div className="summary-row total">
                  <span>Total Cost:</span>
                  <strong>PKR {totalCost.toLocaleString()}</strong>
                </div>
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




