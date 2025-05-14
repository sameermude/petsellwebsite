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

  return (
    <>
      <div className="container-fluid">
      </div>
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
    </>
  );
};

export default Home;
