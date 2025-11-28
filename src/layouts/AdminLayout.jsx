import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, LineChart, History, ChevronDown, ChevronRight, FlaskConical, Pill, UserCheck, User } from 'lucide-react';

// Import the actual useAuth from your context
import { useAuth } from '../contexts/AuthContext';
// Import Footer component
import Footer from '../components/Footer';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [ipdOpen, setIpdOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [pharmacyOpen, setPharmacyOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);


  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Open dropdowns if on respective pages
  useEffect(() => {
    if (location.pathname.startsWith('/admin/admission')) {
      setAdmissionOpen(true);
    }
    if (location.pathname.startsWith('/admin/ipd')) {
      setIpdOpen(true);
    }
    if (location.pathname.startsWith('/admin/lab')) {
      setLabOpen(true);
    }
    if (location.pathname.startsWith('/admin/pharmacy')) {
      setPharmacyOpen(true);
    }
    if (location.pathname.startsWith('/admin/discharge')) {
      setDischargeOpen(true);
    }
  }, [location.pathname]);

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  const toggleAdmission = () => {
    setAdmissionOpen(!admissionOpen);
  };

  const toggleIpd = () => {
    setIpdOpen(!ipdOpen);
  };

  const toggleLab = () => {
    setLabOpen(!labOpen);
  };

  const togglePharmacy = () => {
    setPharmacyOpen(!pharmacyOpen);
  };

  const toggleDischarge = () => {
    setDischargeOpen(!dischargeOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdmissionActive = () => {
    return location.pathname.startsWith('/admin/admission');
  };

  const isIpdActive = () => {
    return location.pathname.startsWith('/admin/ipd');
  };

  const isLabActive = () => {
    return location.pathname.startsWith('/admin/lab');
  };

  const isPharmacyActive = () => {
    return location.pathname.startsWith('/admin/pharmacy');
  };

  const isDischargeActive = () => {
    return location.pathname.startsWith('/admin/discharge');
  };

  return (
    <div className="min-h-[80vh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-t border-gray-200 fixed top-0 left-0 right-0 z-30 h-16 sm:h-18 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">HMS</span>
              <span className="text-xs sm:text-sm bg-blue-600 text-white px-2 sm:px-3 py-1 rounded whitespace-nowrap">ADMIN</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <img 
                  src={user.image || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
                />
                <span className="text-sm sm:text-base font-medium text-gray-700 hidden md:inline-block truncate max-w-32 lg:max-w-none">
                  {user.name}
                </span>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 transition-colors"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline-block text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 sm:pt-18">
        {/* Sidebar */}
        <aside 
          className={`w-56 sm:w-60 lg:w-64 bg-white border-r border-gray-200 fixed top-16 sm:top-18 bottom-10 sm:bottom-12 left-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto mobile-scroll">
            <nav className="p-4 sm:p-5 space-y-2">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                  isActive('/admin/dashboard')
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={closeSidebar}
              >
                <LayoutDashboard size={20} className="shrink-0" />
                <span className="truncate">Dashboard</span>
              </Link>

              {/* Patient Profile Link */}
              <Link
                to="/admin/patient-profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                  isActive('/admin/patient-profile')
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={closeSidebar}
              >
                <User size={20} className="shrink-0" />
                <span className="truncate">Patient Profile</span>
              </Link>

              {/* Admission Dropdown */}
              <div>
                <button
                  onClick={toggleAdmission}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                    isAdmissionActive()
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LineChart size={20} className="shrink-0" />
                  <span className="truncate flex-1 text-left">Admission</span>
                  {admissionOpen ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                </button>
                
                {admissionOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    <Link
                      to="/admin/admission/add-patient"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/admission/add-patient')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Add Patient</span>
                    </Link>
                    <Link
                      to="/admin/admission/department-selection"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/admission/department-selection')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Department Selection</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* IPD Dropdown */}
              <div>
                <button
                  onClick={toggleIpd}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                    isIpdActive()
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <History size={20} className="shrink-0" />
                  <span className="truncate flex-1 text-left">IPD</span>
                  {ipdOpen ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                </button>
                
                {ipdOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    <Link
                      to="/admin/ipd/admission"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/ipd/admission')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">IPD Admission</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Lab Dropdown */}
              <div>
                <button
                  onClick={toggleLab}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                    isLabActive()
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FlaskConical size={20} className="shrink-0" />
                  <span className="truncate flex-1 text-left">Lab</span>
                  {labOpen ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                </button>
                
                {labOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    <Link
                      to="/admin/lab/advice"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/advice')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Advice</span>
                    </Link>
                    <Link
                      to="/admin/lab/payment-slip"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/payment-slip')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Payment Slip</span>
                    </Link>
                    <Link
                      to="/admin/lab/pathology"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/pathology')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Pathology</span>
                    </Link>
                    <Link
                      to="/admin/lab/xray"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/xray')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">X-ray</span>
                    </Link>
                    <Link
                      to="/admin/lab/ct-scan"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/ct-scan')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">CT Scan</span>
                    </Link>
                    <Link
                      to="/admin/lab/usg"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/lab/usg')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">USG</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pharmacy Dropdown */}
              <div>
                <button
                  onClick={togglePharmacy}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                    isPharmacyActive()
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Pill size={20} className="shrink-0" />
                  <span className="truncate flex-1 text-left">Pharmacy</span>
                  {pharmacyOpen ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                </button>
                
                {pharmacyOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    <Link
                      to="/admin/pharmacy/indent"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/pharmacy/indent')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Indent</span>
                    </Link>
                    <Link
                      to="/admin/pharmacy/approval"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/pharmacy/approval')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Approval</span>
                    </Link>
                    <Link
                      to="/admin/pharmacy/store"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/pharmacy/store')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Store</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Discharge Dropdown */}
              <div>
                <button
                  onClick={toggleDischarge}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium ${
                    isDischargeActive()
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <UserCheck size={20} className="shrink-0" />
                  <span className="truncate flex-1 text-left">Discharge</span>
                  {dischargeOpen ? (
                    <ChevronDown size={16} className="shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0" />
                  )}
                </button>
                
                {dischargeOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    <Link
                      to="/admin/discharge/patient"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/patient')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Discharge Patient</span>
                    </Link>
                    <Link
                      to="/admin/discharge/initiation"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/initiation')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Initiation</span>
                    </Link>
                    <Link
                      to="/admin/discharge/complete-file"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/complete-file')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Complete File Work</span>
                    </Link>
                    <Link
                      to="/admin/discharge/concern-department"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/concern-department')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Concern Department</span>
                    </Link>
                    <Link
                      to="/admin/discharge/concern-authority"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/concern-authority')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Concern Authority</span>
                    </Link>
                    <Link
                      to="/admin/discharge/bill"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        isActive('/admin/discharge/bill')
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={closeSidebar}
                    >
                      <span className="truncate">Discharge Bill</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main 
          className="flex-1 ml-0 lg:ml-64 pb-10 sm:pb-12 overflow-auto mobile-scroll"
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed Footer */}
      <Footer />

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;