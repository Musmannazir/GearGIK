import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function OwnerDashboard() {
  const navigate = useNavigate();
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [ownedVehicles, setOwnedVehicles] = useState([
    { id: 1, name: "Toyota Corolla", type: "Sedan", pricePerHour: 1500, image: "https://via.placeholder.com/300x200?text=Toyota", features: ["Fuel Efficient", "Spacious"], bookings: 45, totalEarnings: 67500, location: "FME" },
    { id: 2, name: "Honda Civic", type: "Sedan", pricePerHour: 1800, image: "https://via.placeholder.com/300x200?text=Honda", features: ["Comfort", "Reliable"], bookings: 32, totalEarnings: 57600, location: "FCSE" },
  ]);
  
  const [newCar, setNewCar] = useState({
    name: '',
    type: 'Sedan',
    pricePerHour: '',
    features: [],
    location: 'FME',
    image: 'https://via.placeholder.com/300x200?text=Car',
  });

  const [featureInput, setFeatureInput] = useState('');

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

  const handleAddCar = (e) => {
    e.preventDefault();
    
    if (!newCar.name || !newCar.pricePerHour) {
      alert('Please fill in all required fields');
      return;
    }

    const car = {
      id: ownedVehicles.length + 1,
      ...newCar,
      pricePerHour: parseInt(newCar.pricePerHour),
      bookings: 0,
      totalEarnings: 0,
    };

    setOwnedVehicles([...ownedVehicles, car]);
    setNewCar({
      name: '',
      type: 'Sedan',
      pricePerHour: '',
      features: [],
      image: 'https://via.placeholder.com/300x200?text=Car',
    });
    setShowAddCarForm(false);
    alert('Car added successfully! 🎉');
  };

  const handleRemoveCar = (id) => {
    setOwnedVehicles(ownedVehicles.filter(car => car.id !== id));
  };

  const totalEarnings = ownedVehicles.reduce((sum, car) => sum + car.totalEarnings, 0);
  const totalBookings = ownedVehicles.reduce((sum, car) => sum + car.bookings, 0);

  return (
    <div className="owner-dashboard-container">
      <div className="owner-header">
        <div className="header-content">
          <h1 className="header-title">👤 Owner Dashboard</h1>
          <p className="header-subtitle">Manage your vehicles and earnings</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="switch-mode-btn">Switch to Renter Mode</button>
          <button onClick={() => navigate('/')} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="owner-stats">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <p className="stat-label">Total Vehicles</p>
            <p className="stat-value">{ownedVehicles.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Total Bookings</p>
            <p className="stat-value">{totalBookings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value">PKR {totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Avg Rating</p>
            <p className="stat-value">4.8</p>
          </div>
        </div>
      </div>

      <div className="vehicles-section">
        <div className="section-header">
          <h2 className="section-title">Your Vehicles</h2>
          <button 
            onClick={() => setShowAddCarForm(!showAddCarForm)} 
            className="add-car-btn"
          >
            {showAddCarForm ? '✕ Close' : '+ Add Car'}
          </button>
        </div>

        {showAddCarForm && (
          <div className="add-car-form-container">
            <form onSubmit={handleAddCar} className="add-car-form">
              <h3>Add New Vehicle</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="car-name">Car Name *</label>
                  <input
                    id="car-name"
                    type="text"
                    placeholder="e.g., Toyota Corolla"
                    value={newCar.name}
                    onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="car-type">Car Type *</label>
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

              <div className="form-group">
                <label>Features</label>
                <div className="feature-input-group">
                  <input
                    type="text"
                    placeholder="e.g., AC, Power Steering"
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

        <div className="vehicle-grid">
          {ownedVehicles.length === 0 ? (
            <div className="empty-state">
              <p>📭 No vehicles yet. Add your first car to start earning!</p>
            </div>
          ) : (
            ownedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="owner-vehicle-card">
                <div className="vehicle-image-wrapper">
                  <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                  <span className="vehicle-type-badge">{vehicle.type}</span>
                </div>
                <div className="card-content">
                  <h3>{vehicle.name}</h3>
                  <div className="vehicle-stats">
                    <div className="stat">
                      <span className="label">Rate:</span>
                      <span className="value">PKR {vehicle.pricePerHour.toLocaleString()}/hr</span>
                    </div>
                    <div className="stat">
                      <span className="label">Bookings:</span>
                      <span className="value">{vehicle.bookings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Earnings:</span>
                      <span className="value">PKR {vehicle.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="features">
                    {vehicle.features.map((feature, idx) => (
                      <span key={idx} className="feature-badge">{feature}</span>
                    ))}
                  </div>
                  <div className="card-actions">
                    <button className="edit-btn">✏️ Edit</button>
                    <button 
                      onClick={() => handleRemoveCar(vehicle.id)}
                      className="delete-btn"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
