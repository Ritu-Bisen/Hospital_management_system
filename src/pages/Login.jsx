import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        // Navigation will be handled by the useEffect above
        // since the user state will be updated
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <span className="text-2xl">🏥</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Mamta Super Speciality Hospital</p>
              </div>

              {error && (
                <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle size={18} className="text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="mt-4 sm:mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-700">Administrator</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Username: admin</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Password: admin123</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right side - Feature Showcase */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
          
          <div className="w-full flex flex-col justify-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 leading-tight">Comprehensive Healthcare Management</h2>
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">Patient Management</h3>
                  <p className="text-blue-100 leading-relaxed">Efficiently manage patient records, appointments, and medical history in one centralized system</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">Department Coordination</h3>
                  <p className="text-blue-100 leading-relaxed">Seamlessly coordinate between departments, staff, and resources for optimal care delivery</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">Analytics & Reports</h3>
                  <p className="text-blue-100 leading-relaxed">Generate comprehensive reports and track key performance indicators for better decision-making</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                  <span className="text-xl">🏥</span>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">Resource Management</h3>
                  <p className="text-blue-100 leading-relaxed">Track beds, equipment, inventory, and staff allocation in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;