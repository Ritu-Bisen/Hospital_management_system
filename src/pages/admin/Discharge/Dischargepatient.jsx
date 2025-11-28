import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, UserCheck, Search } from 'lucide-react';

const DischargePatient = () => {
  const [patients, setPatients] = useState([]);
  const [ipdPatients, setIpdPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    admissionNo: '',
    patientName: '',
    department: '',
    consultantName: '',
    staffName: '',
    remarks: ''
  });

  const staffMembers = [
    'Dr. Sharma',
    'Dr. Patel',
    'Dr. Kumar',
    'Dr. Singh',
    'Dr. Verma',
    'Nurse Priya',
    'Nurse Anjali',
    'Staff Rahul'
  ];

  useEffect(() => {
    loadPatients();
    loadIpdPatients();

    const interval = setInterval(() => {
      loadIpdPatients();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadPatients = () => {
    try {
      const storedPatients = localStorage.getItem('dischargePatients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (error) {
      console.log('No existing data found:', error);
    }
  };

  const loadIpdPatients = () => {
    try {
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      const storedDischarges = localStorage.getItem('dischargePatients');
      
      if (storedIpdRecords) {
        const allIpdPatients = JSON.parse(storedIpdRecords);
        const dischargedAdmissionNumbers = storedDischarges 
          ? JSON.parse(storedDischarges).map(p => p.admissionNo)
          : [];
        
        // Filter out already discharged patients
        const availablePatients = allIpdPatients.filter(
          p => !dischargedAdmissionNumbers.includes(p.admissionNumber)
        );
        setIpdPatients(availablePatients);
      }
    } catch (error) {
      console.log('Error loading IPD patients:', error);
    }
  };

  const saveToStorage = (updatedPatients) => {
    try {
      localStorage.setItem('dischargePatients', JSON.stringify(updatedPatients));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const handleAdmissionSelect = (patient) => {
    setFormData({
      ...formData,
      admissionNo: patient.admissionNumber,
      patientName: patient.patientName || '',
      department: patient.department || 'IPD',
      consultantName: patient.consultantDr || ''
    });
    setSearchTerm(patient.admissionNumber);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleSubmit = () => {
    if (!formData.admissionNo || !formData.staffName) {
      setModalError('Please fill all required fields marked with *');
      return;
    }

    const newPatient = {
      id: Date.now(),
      ...formData,
      dischargeDate: new Date().toLocaleDateString('en-GB'),
      dischargeTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      timestamp: new Date().toISOString()
    };

    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    saveToStorage(updatedPatients);
    
    setShowModal(false);
    resetForm();
    loadIpdPatients(); // Refresh available patients
  };

  const resetForm = () => {
    setFormData({
      admissionNo: '',
      patientName: '',
      department: '',
      consultantName: '',
      staffName: '',
      remarks: ''
    });
    setSearchTerm('');
    setModalError('');
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id) => {
    setEditingId(null);
    saveToStorage(patients);
  };

  const handleEditChange = (id, field, value) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, [field]: value } : patient
    ));
  };

  const filteredIpdPatients = ipdPatients.filter(patient =>
    patient.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ipdNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EditableField = ({ label, value, onChange, type = 'text' }) => (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}:</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="px-2 py-1 w-1/2 text-right font-medium text-gray-900 border border-gray-300 rounded"
      />
    </div>
  );

  return (
    <div className="p-3 space-y-4 md:p-6 bg-white min-h-screen">
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Discharge Patient
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage patient discharge records
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex gap-2 items-center justify-center px-4 py-2.5 w-full text-white bg-green-600 rounded-lg shadow-sm transition-colors hover:bg-green-700 sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Discharge
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Admission No</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Patient Name</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Department</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Consultant</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Staff Name</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Discharge Date</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Discharge Time</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-green-50">
                  <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                    {patient.admissionNo}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {editingId === patient.id ? (
                      <input
                        type="text"
                        value={patient.patientName}
                        onChange={(e) => handleEditChange(patient.id, 'patientName', e.target.value)}
                        className="px-2 py-1 w-full border border-gray-300 rounded"
                      />
                    ) : (
                      <span className="text-gray-900">{patient.patientName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {patient.department}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {patient.consultantName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {editingId === patient.id ? (
                      <select
                        value={patient.staffName}
                        onChange={(e) => handleEditChange(patient.id, 'staffName', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded"
                      >
                        {staffMembers.map((staff) => (
                          <option key={staff} value={staff}>{staff}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-900">{patient.staffName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {patient.dischargeDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {patient.dischargeTime}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {editingId === patient.id ? (
                      <button
                        onClick={() => handleSaveEdit(patient.id)}
                        className="flex gap-1 items-center px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(patient.id)}
                        className="flex gap-1 items-center px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  <UserCheck className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900">No discharge records yet</p>
                  <p className="text-sm">Click "Add Discharge" to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div key={patient.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">
                    {patient.admissionNo}
                  </div>
                  {editingId === patient.id ? (
                    <input
                      type="text"
                      value={patient.patientName}
                      onChange={(e) => handleEditChange(patient.id, 'patientName', e.target.value)}
                      className="px-2 py-1 w-full text-sm font-semibold text-gray-900 border border-gray-300 rounded"
                    />
                  ) : (
                    <h3 className="text-sm font-semibold text-gray-900">
                      {patient.patientName}
                    </h3>
                  )}
                </div>
                {editingId === patient.id ? (
                  <button
                    onClick={() => handleSaveEdit(patient.id)}
                    className="flex flex-shrink-0 gap-1 items-center px-2 py-1 text-xs text-white bg-green-600 rounded-lg shadow-sm"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(patient.id)}
                    className="flex flex-shrink-0 gap-1 items-center px-2 py-1 text-xs text-white bg-green-600 rounded-lg shadow-sm"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
              
              {editingId === patient.id ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Staff Name:</span>
                    <select
                      value={patient.staffName}
                      onChange={(e) => handleEditChange(patient.id, 'staffName', e.target.value)}
                      className="px-2 py-1 w-1/2 text-right font-medium text-gray-900 border border-gray-300 rounded"
                    >
                      {staffMembers.map((staff) => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <EditableField
                    label="Remarks"
                    value={patient.remarks || ''}
                    onChange={(e) => handleEditChange(patient.id, 'remarks', e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-900">{patient.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultant:</span>
                    <span className="font-medium text-gray-900">{patient.consultantName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff Name:</span>
                    <span className="font-medium text-gray-900">{patient.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discharge Date:</span>
                    <span className="font-medium text-gray-900">{patient.dischargeDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discharge Time:</span>
                    <span className="font-medium text-gray-900">{patient.dischargeTime}</span>
                  </div>
                  {patient.remarks && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Remarks:</span>
                      <p className="mt-1 text-gray-900">{patient.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <UserCheck className="mx-auto mb-2 w-12 h-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">No discharge records yet</p>
            <p className="text-xs text-gray-600">Click "Add Discharge" to get started</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-green-600 rounded-t-lg md:p-6">
              <h2 className="text-xl font-bold text-white md:text-2xl">Add Discharge Record</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white rounded-full p-1 hover:text-gray-200 hover:bg-green-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Admission No. <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Search by Admission No, Patient Name, or IPD No"
                        className="px-3 py-2 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    {showDropdown && filteredIpdPatients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredIpdPatients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleAdmissionSelect(patient)}
                            className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-sm text-gray-900">
                              {patient.admissionNumber} - {patient.patientName}
                            </div>
                            <div className="text-xs text-gray-600">
                              IPD: {patient.ipdNumber} | Dept: {patient.department}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {showDropdown && filteredIpdPatients.length === 0 && searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                        No patients found
                      </div>
                    )}
                  </div>
                  {ipdPatients.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No available patients. All IPD patients have been discharged.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      readOnly
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      readOnly
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Consultant Name
                    </label>
                    <input
                      type="text"
                      value={formData.consultantName}
                      readOnly
                      className="px-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="staffName"
                      value={formData.staffName}
                      onChange={handleInputChange}
                      className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Staff Member</option>
                      {staffMembers.map((staff) => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter discharge remarks, instructions, or notes..."
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {modalError}
                </div>
              )}
              
              <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DischargePatient;