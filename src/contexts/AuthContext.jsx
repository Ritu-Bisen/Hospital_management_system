import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../SupabaseClient';

const AuthContext = createContext(undefined);

// Define all available pages/menu items with proper structure
export const ALL_PAGES = [
  // Main tabs (single pages)
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard', type: 'single' },
  { key: 'patient-profile', label: 'Patient Profile', path: '/admin/patient-profile', icon: 'User', type: 'single' },
  { key: 'pms', label: 'PMS', path: '/admin/pms', icon: 'FileText', type: 'single' },
  { key: 'roster', label: 'Roster', path: '/admin/roster', icon: 'Calendar', type: 'single' },
  
  // Admission dropdown
  { key: 'admission', label: 'Admission', type: 'group', icon: 'LineChart' },
  { key: 'admission-add-patient', label: 'Add Patient', path: '/admin/admission/add-patient', type: 'item', parent: 'admission' },
  { key: 'admission-department-selection', label: 'Department Selection', path: '/admin/admission/department-selection', type: 'item', parent: 'admission' },
  
  // IPD dropdown
  { key: 'ipd', label: 'IPD', type: 'group', icon: 'History' },
  { key: 'ipd-admission', label: 'IPD Admission', path: '/admin/ipd/admission', type: 'item', parent: 'ipd' },
  
  // OT dropdown
  { key: 'ot', label: 'OT', type: 'group', icon: 'Scissors' },
  { key: 'ot-assign-ot-time', label: 'Assign OT Time', path: '/admin/ot/assign-ot-time', icon: 'Clock', type: 'item', parent: 'ot' },
  { key: 'ot-staff-assign', label: 'OT Staff Assign', path: '/admin/ot/staff-assign', icon: 'Users', type: 'item', parent: 'ot' },
  // { key: 'ot-complete-operation', label: 'Complete Operation', path: '/admin/ot/complete-operation', type: 'item', parent: 'ot' },
  
  // Nurse Station dropdown
  { key: 'nurse-station', label: 'Nurse Station', type: 'group', icon: 'UserCog' },
  { key: 'nurse-station-assign-task', label: 'Assign Nursing Task', path: '/admin/nurse-station/assign-task', icon: 'ClipboardList', type: 'item', parent: 'nurse-station' },
  { key: 'nurse-station-task-list', label: 'Nursing Task List', path: '/admin/nurse-station/task-list', icon: 'CheckSquare', type: 'item', parent: 'nurse-station' },
  { key: 'nurse-station-score-dashboard', label: 'Nursing Score Dashboard', path: '/admin/nurse-station/score-dashboard', icon: 'BarChart3', type: 'item', parent: 'nurse-station' },
  
  // RMO dropdown
  { key: 'rmo', label: 'RMO', type: 'group', icon: 'Shield' },
  { key: 'rmo-assign-task', label: 'Assign Medical Task', path: '/admin/rmo/assign-task', icon: 'ClipboardList', type: 'item', parent: 'rmo' },
  { key: 'rmo-task-list', label: 'Medical Task List', path: '/admin/rmo/task-list', icon: 'FileText', type: 'item', parent: 'rmo' },
  { key: 'rmo-score-dashboard', label: 'RMO Score Dashboard', path: '/admin/rmo/score-dashboard', icon: 'BarChart3', type: 'item', parent: 'rmo' },
  
  // Lab dropdown
  { key: 'lab', label: 'Lab', type: 'group', icon: 'FlaskConical' },
  { key: 'lab-advice', label: 'Advice', path: '/admin/lab/advice', type: 'item', parent: 'lab' },
  { key: 'lab-payment-slip', label: 'Payment Slip', path: '/admin/lab/payment-slip', type: 'item', parent: 'lab' },
  { key: 'lab-pathology', label: 'Pathology', path: '/admin/lab/pathology', type: 'item', parent: 'lab' },
  { key: 'lab-xray', label: 'X-ray', path: '/admin/lab/xray', type: 'item', parent: 'lab' },
  { key: 'lab-ct-scan', label: 'CT Scan', path: '/admin/lab/ct-scan', type: 'item', parent: 'lab' },
  { key: 'lab-usg', label: 'USG', path: '/admin/lab/usg', type: 'item', parent: 'lab' },
  
  // Pharmacy dropdown
  { key: 'pharmacy', label: 'Pharmacy', type: 'group', icon: 'Pill' },
  { key: 'pharmacy-indent', label: 'Indent', path: '/admin/pharmacy/indent', type: 'item', parent: 'pharmacy' },
  { key: 'pharmacy-approval', label: 'Approval', path: '/admin/pharmacy/approval', type: 'item', parent: 'pharmacy' },
  { key: 'pharmacy-store', label: 'Store', path: '/admin/pharmacy/store', type: 'item', parent: 'pharmacy' },
  
  // Discharge dropdown
  { key: 'discharge', label: 'Discharge', type: 'group', icon: 'UserCheck' },
  { key: 'discharge-patient', label: 'Discharge Patient', path: '/admin/discharge/patient', type: 'item', parent: 'discharge' },
  { key: 'discharge-initiation', label: 'Initiation', path: '/admin/discharge/initiation', type: 'item', parent: 'discharge' },
  { key: 'discharge-complete-file', label: 'Complete File Work', path: '/admin/discharge/complete-file', type: 'item', parent: 'discharge' },
  { key: 'discharge-concern-department', label: 'Concern Department', path: '/admin/discharge/concern-department', type: 'item', parent: 'discharge' },
  { key: 'discharge-concern-authority', label: 'Concern Authority', path: '/admin/discharge/concern-authority', type: 'item', parent: 'discharge' },
  { key: 'discharge-bill', label: 'Discharge Bill', path: '/admin/discharge/bill', type: 'item', parent: 'discharge' },
  
  // Masters dropdown
  { key: 'masters', label: 'Masters', type: 'group', icon: 'Users' },
  { key: 'masters-all-staff', label: 'All Staff', path: '/admin/masters/all-staff', icon: 'Users', type: 'item', parent: 'masters' },
  { key: 'masters-medicine', label: 'Medicine', path: '/admin/masters/medicine', icon: 'Pill', type: 'item', parent: 'masters' },
  { key: 'masters-department', label: 'Department', path: '/admin/masters/department', icon: 'Building', type: 'item', parent: 'masters' },
  { key: 'masters-tests', label: 'Tests', path: '/admin/masters/tests', icon: 'FlaskConical', type: 'item', parent: 'masters' },
  { key: 'masters-floor-bed', label: 'Floor & Bed', path: '/admin/masters/floor-bed', icon: 'Bed', type: 'item', parent: 'masters' },
  { key: 'masters-doctors', label: 'Doctors', path: '/admin/masters/doctors', icon: 'Stethoscope', type: 'item', parent: 'masters' },
  { key: 'masters-manage-users', label: 'Manage Users', path: '/admin/masters/manage-users', icon: 'Key', type: 'item', parent: 'masters' },
];

// Helper function to parse user pages
const parseUserPages = (pagesData) => {
  if (!pagesData) return [];
  
  if (pagesData === 'all') {
    // Return all page keys (including single pages and group items)
    return ALL_PAGES.filter(page => page.type !== 'group').map(page => page.key);
  }
  
  try {
    if (typeof pagesData === 'string') {
      const parsed = JSON.parse(pagesData);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    if (Array.isArray(pagesData)) {
      return pagesData;
    }
  } catch (error) {
    console.warn('Error parsing user pages:', error);
    if (typeof pagesData === 'string') {
      return pagesData.split(',').map(p => p.trim()).filter(p => p);
    }
  }
  
  return [];
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user session on mount
  useEffect(() => {
    const checkStoredUser = () => {
      const storedUser = localStorage.getItem('mis_user');
      const storedPages = localStorage.getItem('user_pages');
      
      if (storedUser && storedPages) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const parsedPages = parseUserPages(JSON.parse(storedPages));
          
          setUser(parsedUser);
          setUserPages(parsedPages);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('mis_user');
          localStorage.removeItem('user_pages');
        }
      }
      setLoading(false);
    };

    checkStoredUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    
    try {
      // Query users table for matching username and password
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('user_name', username)
        .eq('password', password)
        .single();

      if (queryError || !userData) {
        console.error('Invalid credentials:', queryError);
        setLoading(false);
        return false;
      }

      // Parse user pages
      const parsedPages = parseUserPages(userData.pages);
      
      // Format user object
      const formattedUser = {
        id: userData.id || userData.user_name,
        email: `${userData.user_name}@hms.com`,
        name: userData.name || userData.user_name,
        role: userData.role || 'user',
        username: userData.user_name,
        image: userData.profile_image || 
               (userData.role === 'admin' 
                 ? 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
                 : 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600'),
        pages: parsedPages
      };
      
      // Update state
      setUser(formattedUser);
      setUserPages(parsedPages);
      
      // Store in localStorage
      localStorage.setItem('mis_user', JSON.stringify(formattedUser));
      localStorage.setItem('user_pages', JSON.stringify(parsedPages));
      
      setLoading(false);
      
      // Redirect to admin dashboard for all roles
      navigate('/admin/dashboard');
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
    localStorage.removeItem('user_pages');
    setUser(null);
    setUserPages([]);
    navigate('/login');
  };

  // Check if user has access to a specific page
  const hasPageAccess = (pageKey) => {
    if (!user || !userPages || userPages.length === 0) return false;
    
    // If user has all pages access
    if (userPages.includes('all')) return true;
    
    // Check if user has this specific page
    return userPages.includes(pageKey);
  };

  // Memoize accessible sidebar items
  const accessibleSidebarItems = useMemo(() => {
    if (!user) return [];
    
    const items = [];
    
    // Get single pages that user has access to
    const singlePages = ALL_PAGES.filter(page => 
      page.type === 'single' && hasPageAccess(page.key)
    );
    
    // Get groups that have at least one accessible child
    const groups = ALL_PAGES.filter(page => page.type === 'group');
    
    groups.forEach(group => {
      // Find all child items of this group that user can access
      const accessibleChildren = ALL_PAGES.filter(child => 
        child.parent === group.key && hasPageAccess(child.key)
      );
      
      // Only add group to sidebar if it has at least one accessible child
      if (accessibleChildren.length > 0) {
        items.push({
          ...group,
          accessibleChildren
        });
      }
    });
    
    return [...singlePages, ...items];
  }, [user, userPages]);

  // Get accessible sidebar items (for AdminLayout)
  const getAccessibleSidebarItems = () => {
    return accessibleSidebarItems;
  };

  // Get accessible child routes for a group
  const getAccessibleGroupRoutes = (groupKey) => {
    return ALL_PAGES.filter(page => 
      page.parent === groupKey && hasPageAccess(page.key)
    );
  };

  const value = {
    user,
    userPages,
    login,
    logout,
    loading,
    hasPageAccess,
    getAccessibleSidebarItems,
    getAccessibleGroupRoutes
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