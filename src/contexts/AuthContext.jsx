import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../SupabaseClient';

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
    
    try {
      // Query users table for matching username and password
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select(' user_name,name, role, pages')
        .eq('user_name', username)
        .eq('password', password) // WARNING: Plain text password storage
        .single();

      if (queryError || !userData) {
        console.error('Invalid credentials:', queryError);
        setLoading(false);
        return false;
      }

      // Format user object for your application
      // const formattedUser = {
      //   id: userData.id,
      //   email: userData.email || `${userData.user_name}@example.com`,
      //   name: userData.full_name || userData.user_name,
      //   role: userData.role || 'user',
      //   image: userData.avatar_url || 
      //          (userData.role === 'admin' 
      //            ? 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
      //            : 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600')
      // };
      
      setUser(userData);
      localStorage.setItem('mis_user', JSON.stringify(userData));
      setLoading(false);
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
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