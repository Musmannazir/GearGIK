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

const VEHICLE_TYPES = ['All Types', 'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Truck', 'Bike'];

function Dashboard() {
  const navigate = useNavigate();
  const [vehicleList, setVehicleList] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Booking Data State
  const [bookingData, setBookingData] = useState({ 
    hours: 1, 
    seats: 1, 
    location: '', 
    phone: '', 
    regNo: '',
    paymentMethod: 'Cash' // Default payment
  });
  
  const [totalCost, setTotalCost] = useState(0);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- NEW: Toggle for Seat Sharing vs Full Rental ---
  const [isSeatSharing, setIsSeatSharing] = useState(false);

  const [filters, setFilters] = useState({
    type: 'All Types',
    hours: 1
  });

  const [newCar, setNewCar] = useState({
    name: '',
    type: 'Sedan',
    pricePerHour: '', // For Full Rental
    maxDuration: '',  // For Full Rental
    isShared: false,  // Toggle State
    pricePerSeat: '', // For Seat Sharing
    routeFrom: '',    // For Seat Sharing
    routeTo: '',      // For Seat Sharing
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
  }, []);

  // Fetch vehicles when the mode toggle changes
  useEffect(() => {
    fetchVehicles();
  }, [isSeatSharing]);

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
      
      const vehicleUrl = `${API_URL}/vehicles?isShared=${isSeatSharing}`;
      const response = await fetch(vehicleUrl);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to load vehicles (${response.status})`);
      }
      
      const data = await response.json();
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
    // Reset booking data
    setBookingData(prev => ({ 
      ...prev, 
      hours: filters.hours, 
      seats: 1,
      paymentMethod: 'Cash'
    }));
    setSelectedVehicle(vehicle);
    
    // Calculate initial cost based on mode
    if (vehicle.isShared) {
      setTotalCost(vehicle.pricePerSeat * 1); // Use SEAT price
    } else {
      setTotalCost(vehicle.pricePerHour * filters.hours); // Use HOURLY price
    }
  };

  const handleBookingChange = (field, value) => {
    const newData = { ...bookingData, [field]: value };
    setBookingData(newData);
    
    // Recalculate cost dynamically
    if (selectedVehicle) {
      if (selectedVehicle.isShared) {
        setTotalCost(selectedVehicle.pricePerSeat * (field === 'seats' ? value : bookingData.seats));
      } else {
        setTotalCost(selectedVehicle.pricePerHour * (field === 'hours' ? value : bookingData.hours));
      }
    }
  };

  const filteredVehicles = vehicleList
    .filter(vehicle => {
      const typeMatch = filters.type === 'All Types' || vehicle.type === filters.type;
      
      if (isSeatSharing) {
        return typeMatch && vehicle.seatsAvailable > 0;
      }
      
      const durationMatch = !vehicle.maxDuration || vehicle.maxDuration >= filters.hours;
      return typeMatch && durationMatch;
    })
    .sort((a, b) => {
      const priceA = isSeatSharing ? a.pricePerSeat : a.pricePerHour;
      const priceB = isSeatSharing ? b.pricePerSeat : b.pricePerHour;
      return priceA - priceB;
    });

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
          seatsToBook: bookingData.seats,
          pickupLocation: selectedVehicle.location,
          startTime: new Date(),
          phone: bookingData.phone,
          regNo: bookingData.regNo,
          paymentMethod: bookingData.paymentMethod,
          status: 'pending' // Send as request
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      let methodMsg = "";
      if(bookingData.paymentMethod === 'Cash') {
          methodMsg = "Please pay cash to the owner upon meetup.";
      } else {
          methodMsg = `Please send PKR ${totalCost} via ${bookingData.paymentMethod} to the owner's number (${selectedVehicle.ownerPhone}) and show the screenshot upon meetup.`;
      }

      alert(`✅ Request Sent to Owner!\n\nMode: ${selectedVehicle.isShared ? 'Seat Reservation' : 'Full Rental'}\nThe owner has been notified. \n\nPayment: ${bookingData.paymentMethod}\n${methodMsg}`);
      
      fetchVehicles();
      setSelectedVehicle(null);
      setBookingData({ hours: 1, seats: 1, location: '', phone: '', regNo: '', paymentMethod: 'Cash' });
      setTotalCost(0);
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
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
    if (!newCar.name || !newCar.image || !newCar.phone || !newCar.regNo) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validation based on type
    if (newCar.isShared) {
        if(!newCar.pricePerSeat || !newCar.routeFrom || !newCar.routeTo) {
            alert("Please fill in Seat Price, From and To locations.");
            return;
        }
    } else {
        if(!newCar.pricePerHour) {
            alert("Please fill in Price Per Hour.");
            return;
        }
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
          ...newCar,
          pricePerHour: parseInt(newCar.pricePerHour) || 0,
          pricePerSeat: parseInt(newCar.pricePerSeat) || 0,
          maxDuration: parseInt(newCar.maxDuration) || 24,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add vehicle');
      setVehicleList([data.vehicle, ...vehicleList]);
      
      // Reset Form
      setNewCar({
        name: '', type: 'Sedan', pricePerHour: '', maxDuration: '', isShared: false, pricePerSeat: '',
        routeFrom: '', routeTo: '', features: [], location: 'FME', image: null, phone: '', regNo: '',
      });
      setImagePreview(null);
      setShowAddCarForm(false);
      setSuccessMessage('Vehicle added successfully! 🎉');
      fetchVehicles();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error adding car: ${err.message}`);
    }
  };

  const handleDeleteCar = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to remove this car from your fleet?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      setVehicleList(vehicleList.filter(v => v._id !== vehicleId));
      setSuccessMessage('Car removed successfully! 🗑️');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error deleting car: ${err.message}`);
    }
  };

  const handleEditCar = (vehicle) => {
    setEditingCar(vehicle._id);
    setNewCar({
      name: vehicle.name, 
      type: vehicle.type, 
      pricePerHour: vehicle.pricePerHour || '', 
      pricePerSeat: vehicle.pricePerSeat || '',
      isShared: vehicle.isShared, 
      maxDuration: vehicle.maxDuration || '', 
      routeFrom: vehicle.routeFrom || '', 
      routeTo: vehicle.routeTo || '', 
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vehicles/${editingCar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newCar,
          pricePerHour: parseInt(newCar.pricePerHour) || 0,
          pricePerSeat: parseInt(newCar.pricePerSeat) || 0,
          maxDuration: parseInt(newCar.maxDuration) || 24,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update car');
      setVehicleList(vehicleList.map(v => v._id === editingCar ? data.vehicle : v));
      setEditingCar(null);
      setShowAddCarForm(false);
      setSuccessMessage('Car updated successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error updating car: ${err.message}`);
    }
  };

  const handleMakeAvailable = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: true }),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      const updatedVehicle = await response.json();
      setVehicleList(vehicleList.map(v => v._id === vehicleId ? updatedVehicle.vehicle : v));
      setSuccessMessage('Car is available again! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Error updating car: ${err.message}`);
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
        name: '', type: 'Sedan', pricePerHour: '', maxDuration: '', isShared: false, pricePerSeat: '',
        routeFrom: '', routeTo: '', features: [], location: 'FME', image: null, phone: '', regNo: '',
    });
    setImagePreview(null);
    setShowAddCarForm(false);
  };

  const myCars = currentUser ? vehicleList.filter(v => {
    if (!v.owner || !currentUser._id) return false;
    if (typeof v.owner === 'string') return v.owner === currentUser._id;
    if (typeof v.owner === 'object' && v.owner._id) return v.owner._id === currentUser._id;
    return false;
  }) : [];

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedRemoveCar, setSelectedRemoveCar] = useState('');
  const canShare = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Truck'].includes(newCar.type);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">GearGIK Dashboard</h1>
          <p className="header-subtitle">Find and book amazing cars near you</p>
        </div>
        <div className="header-actions">
          <button className="add-car-btn" onClick={() => {
            if (editingCar) handleCancelEdit();
            else setShowAddCarForm(!showAddCarForm);
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

      {/* --- FILTER SECTION --- */}
      <div className="filter-section" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', margin: '20px auto', maxWidth: '1200px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
            <button onClick={() => setIsSeatSharing(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', background: !isSeatSharing ? '#2563eb' : 'transparent', color: !isSeatSharing ? 'white' : '#64748b', transition: 'all 0.2s' }}>🚗 Full Rental</button>
            <button onClick={() => setIsSeatSharing(true)} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', background: isSeatSharing ? '#2563eb' : 'transparent', color: isSeatSharing ? 'white' : '#64748b', transition: 'all 0.2s' }}>👥 Book a Seat</button>
        </div>
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500', color: '#666' }}>Type:</label>
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
            {VEHICLE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        {!isSeatSharing && (
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: '500', color: '#666' }}>Duration:</label>
            <select value={filters.hours} onChange={(e) => setFilters({...filters, hours: parseInt(e.target.value)})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                {[1, 2, 3, 4, 6, 8, 12, 24].map(hr => <option key={hr} value={hr}>{hr} Hours</option>)}
            </select>
            </div>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#888' }}>
          Showing <strong>{filteredVehicles.length}</strong> {isSeatSharing ? 'shared rides' : 'vehicles'}
        </div>
      </div>

      {showRemoveDialog && (
        <div className="modal-overlay" onClick={() => setShowRemoveDialog(false)}>
          <div className="remove-listing-modal" onClick={e => e.stopPropagation()}>
            <h2>Remove Your Car Listing</h2>
            <p>Select a car to remove from your listings:</p>
            <select value={selectedRemoveCar} onChange={e => setSelectedRemoveCar(e.target.value)} className="remove-car-select">
              <option value="">-- Select Your Car --</option>
              {myCars.map(car => <option key={car._id} value={car._id}>{car.name}</option>)}
            </select>
            <div className="modal-buttons">
              <button onClick={() => setShowRemoveDialog(false)} className="cancel-btn">Cancel</button>
              <button className="confirm-btn" disabled={!selectedRemoveCar} onClick={() => { if (selectedRemoveCar) { handleDeleteCar(selectedRemoveCar); setShowRemoveDialog(false); setSelectedRemoveCar(''); }}}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {successMessage && <div className="success-msg">{successMessage}</div>}

      {/* --- ADD/EDIT CAR FORM --- */}
      {showAddCarForm && (
        <div className="add-car-form-container">
          <h2>{editingCar ? '✏️ Edit Your Car' : '➕ Add Your Car'}</h2>
          <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="add-car-form">
            <div className="form-row">
              <div className="form-group"><label>Car Name *</label><input type="text" value={newCar.name} onChange={(e) => setNewCar({ ...newCar, name: e.target.value })} placeholder="Honda Civic" required /></div>
              <div className="form-group"><label>Vehicle Type</label><select value={newCar.type} onChange={(e) => setNewCar({ ...newCar, type: e.target.value })}>{VEHICLE_TYPES.filter(t => t !== 'All Types').map(type => <option key={type} value={type}>{type}</option>)}</select></div>
            </div>
            
            {canShare && (
              <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#1e3a8a', fontWeight: '700' }}>
                  <input type="checkbox" checked={newCar.isShared} onChange={e => setNewCar({...newCar, isShared: e.target.checked})} style={{ width: '18px', height: '18px' }} /> Enable Seat Sharing? (Student Carpool)
                </label>
                {newCar.isShared && <p style={{ fontSize: '0.85rem', color: '#3b82f6', marginTop: '5px' }}>Students can book individual seats (Max 4). Full car rental will be disabled.</p>}
              </div>
            )}

            {/* --- DYNAMIC FORM FIELDS --- */}
            <div className="form-row">
              {newCar.isShared ? (
                 <>
                   {/* FIELDS FOR SEAT SHARING MODE */}
                   <div className="form-group"><label>From (Start) *</label><input type="text" value={newCar.routeFrom} onChange={(e) => setNewCar({ ...newCar, routeFrom: e.target.value })} placeholder="e.g. GIKI Hostels" /></div>
                   <div className="form-group"><label>To (Destination) *</label><input type="text" value={newCar.routeTo} onChange={(e) => setNewCar({ ...newCar, routeTo: e.target.value })} placeholder="e.g. Islamabad" /></div>
                   <div className="form-group">
                       <label>Price Per Seat (PKR) *</label> 
                       <input type="number" value={newCar.pricePerSeat} onChange={(e) => setNewCar({ ...newCar, pricePerSeat: e.target.value })} placeholder="e.g., 800" />
                   </div>
                 </>
              ) : (
                 <>
                    {/* FIELDS FOR FULL RENTAL MODE */}
                    <div className="form-group">
                        <label>Price Per Hour (PKR) *</label>
                        <input type="number" value={newCar.pricePerHour} onChange={(e) => setNewCar({ ...newCar, pricePerHour: e.target.value })} placeholder="e.g., 500" />
                    </div>
                    <div className="form-group"><label>Max Duration (Hours)</label><input type="number" value={newCar.maxDuration} onChange={(e) => setNewCar({ ...newCar, maxDuration: e.target.value })} placeholder="24" /></div>
                 </>
              )}
            </div>

            <div className="form-row">
              <div className="form-group"><label>Your Phone *</label><input type="text" value={newCar.phone} onChange={(e) => setNewCar({ ...newCar, phone: e.target.value })} required /></div>
              <div className="form-group"><label>Reg Number *</label><input type="text" value={newCar.regNo} onChange={(e) => setNewCar({ ...newCar, regNo: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Location</label><select value={newCar.location} onChange={(e) => setNewCar({ ...newCar, location: e.target.value })}>{AVAILABLE_LOCATIONS.map((loc) => <option key={loc.value} value={loc.value}>{loc.label}</option>)}</select></div>
            <div className="form-group"><label>Car Image *</label><input type="file" accept="image/*" onChange={handleImageUpload} required={!editingCar} />{imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}</div>
            <div className="form-group">
              <label>Features</label>
              <div className="feature-input-group"><input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="AC, Music..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())} /><button type="button" onClick={handleAddFeature}>Add</button></div>
              <div className="features-list">{newCar.features.map((feature, idx) => (<span key={idx} className="feature-tag">{feature} <button type="button" onClick={() => handleRemoveFeature(idx)} className="remove-feature">✕</button></span>))}</div>
            </div>
            <button type="submit" className="submit-btn">{editingCar ? '💾 Update vehicle' : '➕ Add vehicle'}</button>
          </form>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      <div className="vehicles-container">
        {loading ? <div className="loading-spinner"><p className="loading">Loading vehicles...</p></div> : filteredVehicles.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}><h3>No vehicles found.</h3><p>Try changing the filter or mode.</p></div> : (
          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => {
              const isOwnCar = vehicle.owner === currentUser?._id || vehicle.owner?._id === currentUser?._id;
              return (
                <div key={vehicle._id} className="vehicle-card">
                  <div className="vehicle-image-wrapper">
                    <img src={vehicle.image} alt={vehicle.name} className="vehicle-image" />
                    <span className="vehicle-type-badge">{vehicle.type}</span>
                    {isOwnCar && <button className="delete-cross-btn" onClick={() => { if (window.confirm('Delete this ad?')) handleDeleteCar(vehicle._id); }}>×</button>}
                  </div>
                  <div className="card-content">
                    <div className="card-header"><h3>{vehicle.name}</h3></div>
                    
                    {/* DISPLAY LOGIC FOR PRICES */}
                    {isSeatSharing ? (
                        <div style={{ marginBottom: '10px' }}>
                            <p className="vehicle-price" style={{marginBottom: '5px', color: '#16a34a'}}>PKR {vehicle.pricePerSeat} <span style={{fontSize: '0.8rem', color: '#666'}}>/ seat</span></p>
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{vehicle.seatsAvailable} Seats Left</span>
                        </div>
                    ) : (
                        <p className="vehicle-price">PKR {vehicle.pricePerHour.toLocaleString()} <span style={{fontSize: '0.8rem', color: '#666'}}>/ hour</span></p>
                    )}
                    
                    {/* DISPLAY ROUTE IF SHARED */}
                    {isSeatSharing && vehicle.routeFrom && (
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', color: '#475569', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}><span style={{fontWeight: '600'}}>🛫 From:</span> <span>{vehicle.routeFrom}</span></div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{fontWeight: '600'}}>🏁 To:</span> <span>{vehicle.routeTo}</span></div>
                      </div>
                    )}
                    
                    {vehicle.maxDuration && !isSeatSharing && vehicle.maxDuration < 24 && <div style={{ fontSize: '12px', color: '#d32f2f', fontWeight: 'bold', marginBottom: '5px' }}>⏱️ Max: {vehicle.maxDuration}h</div>}
                    <div className="owner-info-card"><p><strong>Owner:</strong> {vehicle.owner?.fullName || 'You'}</p><p><strong>📞</strong> {vehicle.ownerPhone}</p></div>
                    <div className="card-footer">
                      {isOwnCar ? (
                        <div className="owner-actions"><p className="owned-tag">Your Car</p><div className="owner-buttons"><button className="edit-car-btn" onClick={() => handleEditCar(vehicle)}>✏️ Edit</button>{!vehicle.isAvailable && <button className="make-available-btn" onClick={() => handleMakeAvailable(vehicle._id)}>📋 Available</button>}</div></div>
                      ) : !vehicle.isAvailable ? <button className="rent-btn-rented" disabled>🔒 Rented</button> : (
                        <button className="rent-btn" onClick={() => handleBookClick(vehicle)}>{isSeatSharing ? 'Book Seat' : 'Book Now'}</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- BOOKING MODAL WITH PAYMENT OPTIONS --- */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVehicle(null)}>✕</button>
            <div className="modal-vehicle-card">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="modal-vehicle-image" />
              <div className="modal-vehicle-details">
                <h2>{selectedVehicle.name}</h2>
                <p>{selectedVehicle.isShared ? `PKR ${selectedVehicle.pricePerSeat} / seat` : `PKR ${selectedVehicle.pricePerHour} / hour`}</p>
                {selectedVehicle.isShared && <div style={{fontSize: '0.85rem', color: '#666', marginTop: '4px'}}>{selectedVehicle.routeFrom} ➔ {selectedVehicle.routeTo}</div>}
              </div>
            </div>

            <form onSubmit={confirmBooking} className="booking-form">
              <div className="booking-section">
                <h3>Booking Details</h3>
                {selectedVehicle.isShared ? (
                    <div className="form-group"><label>How many seats?</label><select value={bookingData.seats} onChange={(e) => handleBookingChange('seats', parseInt(e.target.value))}>{[...Array(selectedVehicle.seatsAvailable).keys()].map(i => (<option key={i+1} value={i+1}>{i+1} Seat{i > 0 ? 's' : ''}</option>))}</select></div>
                ) : (
                    <div className="form-group"><label>Duration (hours)</label><select value={bookingData.hours} onChange={(e) => handleBookingChange('hours', parseInt(e.target.value))}>{[1, 2, 3, 4, 6, 8, 12, 24].map((hr) => (<option key={hr} value={hr} disabled={selectedVehicle.maxDuration && hr > selectedVehicle.maxDuration}>{hr} hour{hr > 1 ? 's' : ''} {selectedVehicle.maxDuration && hr > selectedVehicle.maxDuration ? '(Over Limit)' : ''}</option>))}</select></div>
                )}
                <div className="form-group"><label>Owner Location</label><div className="location-display">📍 {selectedVehicle.location}</div></div>
              </div>

              <div className="booking-section">
                <h3>Select Payment Method</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div onClick={() => setBookingData({...bookingData, paymentMethod: 'Cash'})} style={{ border: bookingData.paymentMethod === 'Cash' ? '2px solid #2563eb' : '1px solid #ddd', backgroundColor: bookingData.paymentMethod === 'Cash' ? '#eff6ff' : '#fff', borderRadius: '8px', padding: '10px', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' }}><div style={{fontSize: '1.2rem', marginBottom: '5px'}}>💸</div><strong>Cash</strong></div>
                    <div onClick={() => setBookingData({...bookingData, paymentMethod: 'JazzCash'})} style={{ border: bookingData.paymentMethod === 'JazzCash' ? '2px solid #dc2626' : '1px solid #ddd', backgroundColor: bookingData.paymentMethod === 'JazzCash' ? '#fef2f2' : '#fff', borderRadius: '8px', padding: '10px', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' }}><div style={{fontSize: '1.2rem', marginBottom: '5px'}}>🔴</div><strong>JazzCash</strong></div>
                    <div onClick={() => setBookingData({...bookingData, paymentMethod: 'EasyPaisa'})} style={{ border: bookingData.paymentMethod === 'EasyPaisa' ? '2px solid #16a34a' : '1px solid #ddd', backgroundColor: bookingData.paymentMethod === 'EasyPaisa' ? '#f0fdf4' : '#fff', borderRadius: '8px', padding: '10px', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' }}><div style={{fontSize: '1.2rem', marginBottom: '5px'}}>🟢</div><strong>EasyPaisa</strong></div>
                </div>
                {bookingData.paymentMethod !== 'Cash' && (<p style={{fontSize: '0.8rem', color: '#666', marginTop: '8px'}}>ℹ️ You will need to send money to the owner's number <strong>({selectedVehicle.ownerPhone})</strong> and show proof.</p>)}
              </div>

              <div className="booking-section">
                <h3>Your Information</h3>
                <div className="form-group"><label>Phone *</label><input type="text" value={bookingData.phone} onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })} required /></div>
                <div className="form-group"><label>Registration No *</label><input type="text" value={bookingData.regNo} onChange={(e) => setBookingData({ ...bookingData, regNo: e.target.value })} required /></div>
              </div>

              <div className="booking-summary-compact">
                <div className="summary-row"><span>Vehicle:</span><strong>{selectedVehicle.name}</strong></div>
                {selectedVehicle.isShared ? (<div className="summary-row"><span>Seats:</span><strong>{bookingData.seats}</strong></div>) : (<div className="summary-row"><span>Duration:</span><strong>{bookingData.hours} hr</strong></div>)}
                <div className="summary-row total"><span>Total Cost:</span><strong>PKR {totalCost.toLocaleString()}</strong></div>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setSelectedVehicle(null)} className="cancel-btn">Cancel</button>
                <button type="submit" className="confirm-btn">Send Request 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
