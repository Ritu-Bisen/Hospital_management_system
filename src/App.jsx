import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard/Dashboard';
import AdminLabAdvice from './pages/admin/Lab/Labadvice';
import Admission from './pages/admin/Admission/Admission';
import DepartmentSelection from './pages/admin/Admission/DepartmentSelection';
import IPDAdmission from './pages/admin/IPD/IPDAdmission';
import LabPaymentSlip from './pages/admin/Lab/Labpaymentslip';
import LabXray from './pages/admin/Lab/Labxray';
import LabCT from './pages/admin/Lab/LabCT';
import LabUSG from './pages/admin/Lab/Labusg';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';
import Pathology from './pages/admin/Lab/Pathology';
import PharmacyIndent from './pages/admin/Pharmacy/PharmacyIndent';
import PharmacyApproval from './pages/admin/Pharmacy/PharmacyApproval';
import PharmacyStore from './pages/admin/Pharmacy/PharmacyStore';
import DischargePatient from './pages/admin/Discharge/Dischargepatient';
import InitiationRMO from './pages/admin/Discharge/InitiationRMO';
import CompleteFileWork from './pages/admin/Discharge/CompleteFileWork';
import ConcernDepartment from './pages/admin/Discharge/ConcernDepartment';
import ConcernAuthority from './pages/admin/Discharge/ConcernAuthority';
import DischargeBill from './pages/admin/Discharge/DischargeBill';
import ProfilePatient from './pages/admin/PatientProfile/ProfilePatient';
import ProfilePatientDetails from './pages/admin/PatientProfile/ProfilePatientDetails';
import Treatment from './pages/admin/PatientProfile/Treatment';
import RMOTask from './pages/admin/PatientProfile/RMOTask';
import Nursing from './pages/admin/PatientProfile/Nursing';
import Lab from './pages/admin/PatientProfile/Lab';
import Pharmacy from './pages/admin/PatientProfile/Pharmacy';
import OT from './pages/admin/PatientProfile/OT';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Patient Profile Routes */}
        <Route path="patient-profile" element={<ProfilePatient />} />
        <Route path="patient-profile/:id" element={<ProfilePatientDetails />} />
        <Route path="patient-profile/:id/treatment" element={<Treatment />} />
        <Route path="patient-profile/:id/rmo" element={<RMOTask />} />
        <Route path="patient-profile/:id/nursing" element={<Nursing />} />
        <Route path="patient-profile/:id/lab" element={<Lab />} />
        <Route path="patient-profile/:id/pharmacy" element={<Pharmacy />} />
        <Route path="patient-profile/:id/ot" element={<OT />} />
        
        {/* Admission Routes */}
        <Route path="admission/add-patient" element={<Admission />} />
        <Route path="admission/department-selection" element={<DepartmentSelection />} />
        
        {/* IPD Routes */}
        <Route path="ipd/admission" element={<IPDAdmission />} />
        
        {/* Lab Routes */}
        <Route path="lab/advice" element={<AdminLabAdvice />} />
        <Route path="lab/payment-slip" element={<LabPaymentSlip />} />
        <Route path="lab/xray" element={<LabXray />} />
        <Route path="lab/ct-scan" element={<LabCT />} />
        <Route path="lab/usg" element={<LabUSG />} />
        <Route path="lab/pathology" element={<Pathology />} />
        
        {/* Pharmacy Routes */}
        <Route path="pharmacy/indent" element={<PharmacyIndent />} />
        <Route path="pharmacy/approval" element={<PharmacyApproval />} />
        <Route path="pharmacy/store" element={<PharmacyStore />} />
        
        {/* Discharge Routes */}
        <Route path="discharge/patient" element={<DischargePatient />} />
        <Route path="discharge/initiation" element={<InitiationRMO />} />
        <Route path="discharge/complete-file" element={<CompleteFileWork />} />
        <Route path="discharge/concern-department" element={<ConcernDepartment />} />
        <Route path="discharge/concern-authority" element={<ConcernAuthority />} />
        <Route path="discharge/bill" element={<DischargeBill />} />
      </Route>
      
      {/* Root route */}
      <Route 
        path="/" 
        element={
          <Navigate to={user ? '/admin/dashboard' : '/login'} replace />
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Authentication guard component
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
}

export default App;