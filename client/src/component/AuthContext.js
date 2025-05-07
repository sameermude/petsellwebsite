import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [mobileNo, setMobileNo] = useState(localStorage.getItem('mobileNo') || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const login = (mobile, jwt) => {
    setMobileNo(mobile);
    setToken(jwt);
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
    
    localStorage.setItem('mobileNo', mobile);
    localStorage.setItem('token', jwt);
  };

  const logout = () => {
    setMobileNo(null);
    setToken(null);
    localStorage.removeItem('mobileNo');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ mobileNo, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
