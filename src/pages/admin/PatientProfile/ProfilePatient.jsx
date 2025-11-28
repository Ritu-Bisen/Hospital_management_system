import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Edit, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getColors = () => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('PRIVATE') || statusUpper === 'VIP') {
      return 'bg-purple-100 text-purple-700';
    } else if (statusUpper.includes('INSURANCE') || statusUpper.includes('CORPORATE')) {
      return 'bg-blue-100 text-blue-700';
    } else if (statusUpper.includes('AYUSHMAN') || statusUpper.includes('GJAY')) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColors()}`}>
      {status}
    </span>
  );
};

// Patient Card Component
const PatientCard = ({ patient, onViewDetails, onEdit, onDelete, calculateTimeInWard }) => {
  const patientName = patient.patientName || patient.name || 'N/A';
  const consultantDr = patient.consultantDr || patient.doctor || 'N/A';
  const age = patient.age || 'N/A';
  const bedLocation = patient.bedLocation || patient.locationStatus || patient.ward || 'N/A';
  const bedNo = patient.bedNo || patient.bedNumber || 'N/A';
  const ipdNo = patient.ipdNumber || patient.ipdNo || patient.admissionNumber || 'N/A';
  const patCategory = patient.patCategory || patient.patientCategory || 'General';
  const timeInWard = calculateTimeInWard(patient.timestamp || patient.doa);
  const mobileNumber = patient.mobileNumber || patient.mobile || patient.phoneNumber || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 p-5 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{patientName}</h3>
          <p className="text-sm text-gray-600">{consultantDr}</p>
        </div>
        <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
          {age}
        </div>
      </div>
      
      <div className="space-y-2 mb-4 border-t pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ward/Bed:</span>
          <span className="font-semibold text-gray-900">{bedLocation} / {bedNo}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IPD No:</span>
          <span className="font-semibold text-gray-900">{ipdNo}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mobile:</span>
          <span className="font-semibold text-gray-900">{mobileNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time in Ward:</span>
          <span className="font-semibold text-green-600">{timeInWard}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t mb-4">
        <StatusBadge status={patCategory} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(patient)}
          className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        <button
          onClick={() => onEdit(patient.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(patient.id)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function PatientProfile() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [wardFilter, setWardFilter] = useState('All Patients');
  const [patientsData, setPatientsData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load patients from localStorage
  useEffect(() => {
    loadPatients();
    
    // Set up interval to refresh data
    const interval = setInterval(() => {
      loadPatients();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadPatients = () => {
    try {
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      if (storedIpdRecords) {
        const records = JSON.parse(storedIpdRecords);
        setPatientsData(records);
      } else {
        setPatientsData([]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatientsData([]);
    }
  };

  const calculateTimeInWard = (admissionDate) => {
    if (!admissionDate) return 'N/A';
    try {
      const admitted = new Date(admissionDate);
      const now = new Date();
      const diffMs = now - admitted;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `${diffHours} Hour${diffHours > 1 ? 's' : ''}`;
      } else {
        return 'Less than 1 hour';
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const wardFilters = [
    'All Patients',
    'General Male Ward',
    'General Female Ward',
    'ICU',
    'Private Ward',
    'PICU',
    'NICU',
    'Emergency',
    'HDU',
    'General Ward(5th floor)'
  ];

  const filteredPatients = patientsData.filter(patient => {
    const patientName = patient.patientName || patient.name || '';
    const ipdNo = patient.ipdNumber || patient.ipdNo || '';
    const consultantDr = patient.consultantDr || patient.doctor || '';
    const bedLocation = patient.bedLocation || patient.locationStatus || patient.ward || '';
    const patCategory = patient.patCategory || patient.patientCategory || '';

    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ipdNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultantDr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWard = wardFilter === 'All Patients' || bedLocation === wardFilter;
    const matchesCategory = filterCategory === 'All' || patCategory === filterCategory;
    
    return matchesSearch && matchesWard && matchesCategory;
  });

  const handleViewDetails = (patient) => {
    // Navigate directly to patient details page and pass patient data
    navigate(`/admin/patient-profile/${patient.id}`, { state: { patient } });
  };

  const handleEdit = (patientId) => {
    alert(`Edit functionality for patient ${patientId}`);
  };

  const handleDelete = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
        if (storedIpdRecords) {
          let records = JSON.parse(storedIpdRecords);
          records = records.filter(p => p.id !== patientId);
          localStorage.setItem('ipdAdmissionRecords', JSON.stringify(records));
          loadPatients();
          alert('Patient record deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient record.');
      }
    }
  };

  // Check if any filter is active
  const hasActiveFilters = wardFilter !== 'All Patients' || filterCategory !== 'All';

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Quick Actions */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Patient Profiles</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total Patients: {patientsData.length} | Showing: {filteredPatients.length}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 lg:min-w-[350px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, IPD No, or doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-green-600 rounded-full">
                      ●
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ward Filter Buttons */}
        {showFilters && (
          <div className="flex-shrink-0 px-4 lg:px-6 pb-4 bg-gray-50">
            <div className="max-w-full mx-auto">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter by Ward</h3>
                  <button
                    onClick={() => {
                      setWardFilter('All Patients');
                      setFilterCategory('All');
                    }}
                    className="text-xs text-green-600 hover:text-green-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-start">
                  {wardFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setWardFilter(filter)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        wardFilter === filter
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    calculateTimeInWard={calculateTimeInWard}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                  <div className="flex flex-col gap-2 items-center">
                    <Filter className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500 text-lg mb-2">No patients found</p>
                    <p className="text-gray-400 text-sm">Patients admitted through IPD will appear here</p>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setWardFilter('All Patients');
                          setFilterCategory('All');
                          setSearchTerm('');
                        }}
                        className="mt-4 text-sm text-green-600 hover:text-green-700"
                      >
                        Clear filters to see all patients
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}