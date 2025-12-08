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
      {/* ...rest of your JSX remains unchanged */}
    </div>
  );
}

export default Dashboard;
