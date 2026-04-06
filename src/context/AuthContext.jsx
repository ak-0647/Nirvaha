import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('nirvaha_token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('nirvaha_token');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Register - Step 1: Send OTP
  const register = async (formData) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  // Register - Step 2: Verify OTP
  const verifyOTP = async (email, otp) => {
    const res = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Save token & user
    localStorage.setItem('nirvaha_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  // Resend OTP
  const resendOTP = async (email) => {
    const res = await fetch(`${API_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  // Login
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Login failed');
      error.data = data;
      throw error;
    }

    // Save token & user
    localStorage.setItem('nirvaha_token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('nirvaha_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  // Reset Password
  const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  };

  // Update Profile
  const updateProfile = async (userData) => {
    const token = localStorage.getItem('nirvaha_token');
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, loading,
      register, verifyOTP, resendOTP, login, logout,
      forgotPassword, resetPassword, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
