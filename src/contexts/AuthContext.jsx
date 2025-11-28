import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    
    // Mock authentication (replace with actual API call in production)
    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin-001',
        name: 'Admin User',
        role: 'admin',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      setUser(adminUser);
      localStorage.setItem('mis_user', JSON.stringify(adminUser));
      setLoading(false);
      return true;
    } else if (username === 'user' && password === 'user123') {
      const regularUser = {
        id: 'user-001',
        name: 'John Doe',
        role: 'user',
        image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      setUser(regularUser);
      localStorage.setItem('mis_user', JSON.stringify(regularUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('mis_user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}