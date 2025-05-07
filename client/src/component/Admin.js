import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from './Tree';
import Aboutus from './Aboutus';
import Company from './Company';
import AddressDetail from './AddressDetail';
import Dashboard from './Dashboard';
import Ad from './Ad';
import './style.css'; // Custom CSS
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';  // <-- add this
const treeData = [
  {
    id: 1,
    name: 'Admin',
    children: [
      { id: 9, name: 'Company' },
      { id: 4, name: 'Address' },
      { id: 6, name: 'Advertisement' },
      { id: 6, name: 'Dashboard' },
    ],
  },
];

const Admin = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [userId, setUserId] = useState(null);
  const { mobileNo, logout } = useAuth();
  // Fetch the userId from the backend
  const navigate = useNavigate();  // <-- add this inside your Admin component

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/getdatatoken/${mobileNo}/User`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data._id) {
          setUserId(response.data._id);
        } else {
          console.warn("No users found in response.");
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
          logout()
          Swal.fire({
            icon: 'error',
            title: 'Authentication Failed',
            text: 'Your session has expired or is invalid. Please log in again.',
          }).then(() => {
            navigate('/'); // Redirect to home
          });
        } else {
          console.error("Error fetching user ID:", error);
        }
      }
    };

    fetchUserId();
  }, []);


  useEffect(() => {
    if (userId) {
      console.log('User ID updated:', userId);
    }
  }, [userId]);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const renderPanelContent = () => {
    switch (selectedNode?.name) {
      case 'Company':
        return <Company userId={userId} />;
      case 'About us':
        return <Aboutus userId={userId} />;
      case 'Address':
        return <AddressDetail userId={userId} />;
      case 'Advertisement':
        return <Ad userId={userId} />;
      case 'Dashboard':
        return <Dashboard />;
      default:
        return <div className="placeholder-text">Please select a section from the left.</div>;
    }
  };

  return (
    <div className="admin-container">
      <div className="top-banner">
        <h2>Admin Dashboard</h2>
      </div>

      <div className="admin-content">
        <div className="left-panel">
          <Tree data={treeData} onSelect={handleNodeSelect} />
        </div>

        <div className="separator1" />

        <div className="right-panel">
          {renderPanelContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
