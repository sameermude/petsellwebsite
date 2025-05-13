import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, Button, Form } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Home from './component/Home';
import Admin from './component/Admin';
import { AuthProvider, useAuth } from './component/AuthContext';
import fishImage from './image/test.png';
import catImage from './image/cat.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const { token, setToken, login, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNo, setMobileNo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileNo('');  // Reset mobile number
    setOtp('');       // Reset OTP
    setShowOtpInput(false); // Reset OTP input visibility
    navigate('/');
  };

  const handleLoginClick = () => setShowModal(true);

  const handleSendOtp = async () => {
    const trimmed = mobileNo.trim();
    const validMobile = /^[6-9]\d{9}$/.test(trimmed);
    if (validMobile) {
      const formattedMobile = `+91${trimmed}`;
      try {
        await axios.post(process.env.REACT_APP_ADDRESS + '/api/send-otp', { mobileno: formattedMobile });
        setShowOtpInput(true);
      } catch (error) {
        alert('Error sending OTP: ' + (error.response?.data?.error || error.message));
      }
    } else {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6-9');
    }
  };

  const handleVerifyOtp = async () => {
    if (/^[0-9]{6}$/.test(otp)) {
      const formattedMobile = `+91${mobileNo.trim()}`;
      try {
        const response = await axios.post(process.env.REACT_APP_ADDRESS + '/api/verify-otp', { mobileno: formattedMobile, otp });
        const receivedToken = response.data.token;
        login(formattedMobile, receivedToken);
        setShowModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
          text: 'You are now logged in.',
        });
      } catch {
        alert('Invalid OTP');
      }
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#5dade2' }}>
        <div className="container-fluid d-flex align-items-center">
          <div className="navbar-brand d-flex align-items-center">
            <h2 className="text-white mb-0 me-3">Pets Care</h2>
            <img src={fishImage} alt="Fish" width="40" height="40" className="me-2" />
            <img src={catImage} alt="Cat" width="40" height="40" />
          </div>

          <ul className="nav nav-pills ms-auto d-flex align-items-center">
            {token ? (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/Home"
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active bg-white text-primary' : ' text-white')
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item ms-2">
                  <NavLink
                    to="/Admin"
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active bg-white text-primary' : ' text-white')
                    }
                  >
                    Admin
                  </NavLink>
                </li>
                <li className="nav-item ms-3">
                  <div className="d-flex align-items-center">
                    <span className="navbar-text text-white me-3">Welcome!</span>
                    <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
                  </div>
                </li>
              </>
            ) : (
              <li className="nav-item ms-3">
                <button className="btn btn-outline-light" onClick={handleLoginClick}>
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Login Modal - Rendered regardless of token */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!showOtpInput ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number (India only)</Form.Label>
                <Form.Control
                  type="text"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value.replace(/\D/, ''))}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleSendOtp}>Send OTP</Button>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Enter OTP</Form.Label>
                <Form.Control
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </Form.Group>
              <Button variant="success" onClick={handleVerifyOtp}>Verify OTP</Button>
            </>
          )}
        </Modal.Body>
      </Modal>

      <div className="mt-2">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
