import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Stethoscope,
  Activity,
  Bed,
  Users,
  ChevronDown,
  ChevronUp,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Predefined Tasks Template
const getDefaultTasks = () => ({
  nurseTasks: [
    { id: 1, task: 'Vital Signs Monitoring', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 2, task: 'Medication Administration', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 3, task: 'Blood Sample Collection', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 4, task: 'Wound Dressing', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 5, task: 'Patient Hygiene Care', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
    { id: 6, task: 'ECG Monitoring Setup', status: 'Pending', time: 'N/A', assignedTo: 'Nurse on Duty', dueDate: new Date().toISOString().split('T')[0] },
  ],
  labTests: [
    {
      name: 'Complete Blood Count (CBC)',
      type: 'Pathology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting sample collection',
    },
    {
      name: 'Blood Glucose',
      type: 'Pathology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting sample collection',
    },
    {
      name: 'Chest X-Ray',
      type: 'Radiology',
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportDate: 'N/A',
      results: 'Awaiting scan',
    },
  ],
  pharmacyIndent: [
    {
      date: new Date().toISOString().split('T')[0],
      medicineName: 'To be prescribed',
      quantity: 0,
      status: 'Pending',
      approvedBy: 'Pending',
    },
  ],
  treatmentPlan: {
    diagnosis: 'To be diagnosed by doctor',
    procedures: [
      { name: 'Initial Assessment', date: new Date().toISOString().split('T')[0], status: 'Scheduled', notes: 'Pending doctor review' },
    ],
    medications: [],
  },
  vitalsMonitoring: {
    lastUpdated: new Date().toLocaleString(),
    bloodPressure: 'N/A',
    heartRate: 'N/A',
    temperature: 'N/A',
    respiratoryRate: 'N/A',
    oxygenSaturation: 'N/A',
    status: 'Pending Assessment',
  },
  staffAssigned: {
    rmo: {
      name: 'To be assigned',
      designation: 'Resident Medical Officer',
      contact: 'N/A',
      assignedDate: new Date().toISOString().split('T')[0],
    },
    nurses: [
      { name: 'To be assigned', shift: 'Morning (6 AM - 2 PM)', assignedDate: new Date().toISOString().split('T')[0] },
      { name: 'To be assigned', shift: 'Evening (2 PM - 10 PM)', assignedDate: new Date().toISOString().split('T')[0] },
      { name: 'To be assigned', shift: 'Night (10 PM - 6 AM)', assignedDate: new Date().toISOString().split('T')[0] },
    ],
  },
});
// Status Badge Component
const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed' || status === 'Active' || status === 'Approved & Dispensed') {
      return 'bg-green-100 text-green-700 border-green-300';
    } else if (status === 'Pending' || status === 'Pending Approval') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    } else if (status === 'In Progress') {
      return 'bg-blue-100 text-blue-700 border-blue-300';
    } else if (status === 'Emergency' || status === 'Occupied') {
      return 'bg-red-100 text-red-700 border-red-300';
    } else if (status === 'Stable') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {status}
    </span>
  );
};

// Expandable Section Component
const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
      </button>
      {isOpen && <div className="px-6 py-4 border-t border-gray-200">{children}</div>}
    </div>
  );
};

// Information Grid Component
const InfoGrid = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 font-medium">{key}</p>
        <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    ))}
  </div>
);

// Main Component
export default function PatientProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get patient data from navigation state or localStorage
  const [data, setData] = useState(null);

  useEffect(() => {
    // First try to get data from navigation state
    if (location.state?.patient) {
      const patient = location.state.patient;
      setData(transformPatientData(patient));
    } else {
      // If no state, try to load from localStorage
      try {
        const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
        if (storedIpdRecords) {
          const records = JSON.parse(storedIpdRecords);
          const patient = records.find(p => p.id.toString() === id);
          if (patient) {
            setData(transformPatientData(patient));
          }
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    }
  }, [id, location]);

  // Transform IPD patient data to match the display format
  const transformPatientData = (patient) => {
    const defaultTasks = getDefaultTasks();
    
    return {
      personalInfo: {
        name: patient.patientName || 'N/A',
        uhid: patient.admissionNumber || patient.ipdNumber || 'N/A',
        ipd: patient.ipdNumber || 'N/A',
        age: patient.age || 'N/A',
        gender: patient.gender || 'N/A',
        phone: patient.mobileNumber || patient.phoneNumber || 'N/A',
        address: `${patient.houseStreet || ''}, ${patient.areaColony || ''}, ${patient.city || ''}, ${patient.state || ''}`.trim() || 'N/A',
        bloodGroup: patient.bloodGroup || 'N/A',
        allergies: patient.allergies || 'None reported',
        emergencyContact: `${patient.kinName || 'N/A'} - ${patient.kinMobile || 'N/A'}`,
      },
      admissionInfo: {
        admissionDate: patient.timestamp || new Date().toLocaleString(),
        admissionType: patient.patientCase || 'General',
        admissionMode: patient.medicalSurgical || 'N/A',
        reasonForAdmission: patient.admissionPurpose || 'N/A',
        status: 'Active',
      },
      departmentInfo: {
        department: patient.department || 'N/A',
        ward: patient.bedLocation || patient.locationStatus || 'N/A',
        bedNumber: patient.bedNo || 'N/A',
        bedStatus: 'Occupied',
      },
      doctorInfo: {
        primaryDoctor: patient.consultantDr || 'To be assigned',
        specialty: patient.department || 'N/A',
        consultants: patient.referByDr ? [patient.referByDr] : [],
        doctorPhone: 'N/A',
        officeHours: '10:00 AM - 4:00 PM',
      },
      billing: {
        totalBilledAmount: parseFloat(patient.advanceAmount || 0),
        outstandingAmount: 0,
        paymentMode: patient.patCategory || 'N/A',
        insuranceCompany: patient.patCategory || 'N/A',
      },
      // Use predefined tasks
      ...defaultTasks,
    };
  };

  const calculateDaysInHospital = (admissionDate) => {
    if (!admissionDate) return '0';
    try {
      const admitted = new Date(admissionDate);
      const now = new Date();
      const diffTime = Math.abs(now - admitted);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays.toString();
    } catch (error) {
      return '0';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h1>
          <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/patient-profile')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/admin/patient-profile')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </button>
        </div>

        {/* Header - Green Theme */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Name</p>
              <p className="text-sm md:text-base font-bold truncate">{data.personalInfo.name}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Admission Type</p>
              <p className="text-sm md:text-base font-bold">{data.admissionInfo.admissionType}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">UHID</p>
              <p className="text-sm md:text-base font-bold">{data.personalInfo.uhid}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Admission No</p>
              <p className="text-sm md:text-base font-bold">{data.personalInfo.ipd}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Age</p>
              <p className="text-sm md:text-base font-bold">{data.personalInfo.age} Years</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Blood Group</p>
              <p className="text-sm md:text-base font-bold">{data.personalInfo.bloodGroup}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Department</p>
              <p className="text-sm md:text-base font-bold truncate">{data.departmentInfo.department}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Ward Name</p>
              <p className="text-sm md:text-base font-bold truncate">{data.departmentInfo.ward}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Room Number</p>
              <p className="text-sm md:text-base font-bold">{data.departmentInfo.bedNumber}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">Days in Hospital</p>
              <p className="text-sm md:text-base font-bold">{data.admissionInfo.admissionDate ? calculateDaysInHospital(data.admissionInfo.admissionDate) : '0'} Days</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-1 px-6 py-3">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'treatment', label: 'Treatment' },
              { key: 'rmo', label: 'RMO Task' },
              { key: 'nursing', label: 'Nursing Task' },
              { key: 'lab', label: 'Lab' },
              { key: 'pharmacy', label: 'Pharmacy' },
              { key: 'ot', label: 'OT Task' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'overview') {
                    setActiveTab('overview');
                  } else {
                    navigate(`/admin/patient-profile/${id}/${tab.key}`, { state: { patient: location.state?.patient, data } });
                  }
                }}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections - Overview Only */}
        <div className="p-6 space-y-6">
          <ExpandableSection title="Personal Information" icon={User} defaultOpen={true}>
            <InfoGrid
              data={{
                'Full Name': data.personalInfo.name,
                'UHID No.': data.personalInfo.uhid,
                'IPD No.': data.personalInfo.ipd,
                'Age': `${data.personalInfo.age} years`,
                'Gender': data.personalInfo.gender,
                'Blood Group': data.personalInfo.bloodGroup,
                'Phone': data.personalInfo.phone,
                'Address': data.personalInfo.address,
                'Allergies': data.personalInfo.allergies,
                'Emergency Contact': data.personalInfo.emergencyContact,
              }}
            />
          </ExpandableSection>

          <ExpandableSection title="Admission Information" icon={Calendar} defaultOpen={true}>
            <InfoGrid
              data={{
                'Admission Date': data.admissionInfo.admissionDate,
                'Admission Type': data.admissionInfo.admissionType,
                'Mode of Admission': data.admissionInfo.admissionMode,
                'Reason': data.admissionInfo.reasonForAdmission,
                'Status': data.admissionInfo.status,
                'Duration': `${data.admissionInfo.admissionDate ? calculateDaysInHospital(data.admissionInfo.admissionDate) : '0'} days`,
              }}
            />
          </ExpandableSection>

          <ExpandableSection title="Department & Ward Information" icon={Bed} defaultOpen={true}>
            <InfoGrid
              data={{
                'Department': data.departmentInfo.department,
                'Ward': data.departmentInfo.ward,
                'Bed Number': `${data.departmentInfo.bedNumber}`,
                'Bed Status': data.departmentInfo.bedStatus,
              }}
            />
          </ExpandableSection>

          <ExpandableSection title="Doctor Information" icon={Stethoscope} defaultOpen={true}>
            <InfoGrid
              data={{
                'Primary Doctor': data.doctorInfo.primaryDoctor,
                'Specialty': data.doctorInfo.specialty,
                'Doctor Phone': data.doctorInfo.doctorPhone,
                'Office Hours': data.doctorInfo.officeHours,
              }}
            />
          </ExpandableSection>

          <ExpandableSection title="Current Vitals Monitoring" icon={Activity} defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Last Updated: {data.vitalsMonitoring.lastUpdated}</p>
                <StatusBadge status={data.vitalsMonitoring.status} />
              </div>
              <InfoGrid
                data={{
                  'Blood Pressure': data.vitalsMonitoring.bloodPressure,
                  'Heart Rate': data.vitalsMonitoring.heartRate,
                  'Temperature': data.vitalsMonitoring.temperature,
                  'Respiratory Rate': data.vitalsMonitoring.respiratoryRate,
                  'Oxygen Saturation': data.vitalsMonitoring.oxygenSaturation,
                }}
              />
            </div>
          </ExpandableSection>
        </div>


      </div>
    </div>
  );
}