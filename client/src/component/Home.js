import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAuth } from './AuthContext'; // adjust path if needed
import catImage from '../image/cat.png';
import Swal from 'sweetalert2';

const Home = () => {
  const { token, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mobileNo, setMobileNo] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleLoginClick = () => setShowModal(true);

  const handleSendOtp = async () => {
    const trimmed = mobileNo.trim();
    const validMobile = /^[6-9]\d{9}$/.test(trimmed);
    if (validMobile) {
      const formattedMobile = `+91${trimmed}`;
      try {
        await axios.post('http://localhost:5000/api/send-otp', { mobileno: formattedMobile });
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
        const response = await axios.post('http://localhost:5000/api/verify-otp', { mobileno: formattedMobile, otp });
        const receivedToken = response.data.token;
        login(formattedMobile, receivedToken);
        setShowModal(false);
        //alert('Login successful!');
        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
          text: 'Login successful!.',
        })
      } catch {
        alert('Invalid OTP');
      }
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#5dade2' }}>
        <div className="container-fluid">
          <a className="navbar-brand text-white" href="#"></a>
          <div className="d-flex ms-auto">
            {!token ? (
              <button className="btn btn-light" onClick={handleLoginClick}>Login</button>
            ) : (
              <div className="d-flex align-items-center">
                <span className="navbar-text text-white me-3">Welcome!</span>
                <button className="btn btn-outline-light" onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Watermark Text */}

      <div style={{
        backgroundColor: '#d6eaf8', // Light blue
        backgroundImage: `url(${catImage})`, // Background image URL
        backgroundRepeat: 'no-repeat',
        backgroundSize: '40%', // Reduce the image size (you can try smaller or larger values)
        backgroundPosition: 'center',
        minHeight: '90vh',
        paddingTop: '10px',
        paddingBottom: '10px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#1b2631',
          boxShadow: 'none', // Remove box shadow
          backgroundColor: 'transparent', // Make background transparent
          borderRadius: '0', // Remove border radius if needed
        }}>
          <h2>Welcome to Pets Care</h2>
          <p style={{ fontSize: '1.2rem' }}>This site sells pets, as well as accessories, food, and care items for your beloved animals.</p>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered // This will vertically center the modal
        dialogClassName="modal-dialog-centered-custom" // Custom class for additional styling
      >
        <Modal.Header closeButton><Modal.Title>Login</Modal.Title></Modal.Header>
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
    </>
  );
};

export default Home;
