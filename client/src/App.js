import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';
import Home from './component/Home';
import Admin from './component/Admin';
import { AuthProvider, useAuth } from './component/AuthContext';
import fishImage from './image/test.png';
import catImage from './image/cat.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function AppContent() {
  const { token } = useAuth();

  return (
    <div className="container-fluid p-0">
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{ backgroundColor: '#5dade2' }}
      >
        <div className="container-fluid d-flex align-items-center">
          <div className="navbar-brand d-flex align-items-center">
            <h2 className="text-white mb-0 me-3">Pets Care</h2>
            <img
              src={fishImage}
              alt="Fish"
              width="40"
              height="40"
              className="me-2"
            />
            <img src={catImage} alt="Cat" width="40" height="40" />
          </div>

          <ul className="nav nav-pills ms-auto">
            {token && (
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
            )}
            {token && (
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
            )}
          </ul>
        </div>
      </nav>

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
