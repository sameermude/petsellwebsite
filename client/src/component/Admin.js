import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from './Tree';
import Company from './Company';
import AddressDetail from './AddressDetail';
import Dashboard from './Dashboard';
import Ad from './Ad';
import './style.css';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useWindowWidth from './useWindowWidth';
import Analyzer from './Analyzar';

const treeData = [
  {
    id: 1,
    name: 'Admin',
    children: [
      { id: 9, name: 'Company' },
      { id: 4, name: 'Address' },
      { id: 6, name: 'Advertisement' },
      { id: 7, name: 'Dashboard' },
    ],
  },
];

const Admin = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [userId, setUserId] = useState(null);
  const { mobileNo, logout } = useAuth();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 600;

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          process.env.REACT_APP_ADDRESS + `/api/getdatatoken/${mobileNo}/User`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data._id) {
          setUserId(response.data._id);
        } else {
          console.warn("No users found in response.");
        }
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
          logout();
          Swal.fire({
            icon: 'error',
            title: 'Authentication Failed',
            text: 'Your session has expired or is invalid. Please log in again.',
          }).then(() => {
            navigate('/');
          });
        } else {
          console.error("Error fetching user ID:", error);
        }
      }
    };

    fetchUserId();
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const renderMobileNav = () => (
    <div className="mobile-nav">
      {['Company', 'Address', 'Advertisement', 'Dashboard', 'Lens'].map((name) => (
        <button
          key={name}
          className={`nav-btn ${selectedNode?.name === name ? 'active' : ''}`}
          onClick={() => handleNodeSelect({ name })}
        >
          {name}
        </button>
      ))}
    </div>
  );

  const renderPanelContent = () => {
    switch (selectedNode?.name) {
      case 'Company':
        return <Company userId={userId} />;
      case 'Address':
        return <AddressDetail userId={userId} />;
      case 'Advertisement':
        return <Ad userId={userId} />;
      case 'Dashboard':
        return <Dashboard userId={userId} />;
      default:
        return <div className="placeholder-text">Please select a section from the left.</div>;
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        {isMobile ? renderMobileNav() : (
          <div className="left-panel">
            <Tree data={treeData} onSelect={handleNodeSelect} />
          </div>
        )}

        {!isMobile && <div className="separator1" />}

        <div className="right-panel">
          {renderPanelContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
