import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, UserPlus, Search, Filter } from 'lucide-react';

// This is the main component for the Admission page
const Admission = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalError, setModalError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    attenderName: '',
    attenderMobile: '',
    reasonForVisit: '',
    dateOfBirth: '',
    age: '',
    gender: 'Male'
  });

  // Load existing patients from localStorage on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Load patients from localStorage
  const loadPatients = () => {
    try {
      const storedPatients = localStorage.getItem('admissionPatients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      }
    } catch (error) {
      console.log('No existing data found or failed to load:', error);
    }
  };

  // Helper function to save the patient list to localStorage
  const saveToStorage = (updatedPatients) => {
    try {
      localStorage.setItem('admissionPatients', JSON.stringify(updatedPatients));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Generates a unique admission number in sequential format
  const generateAdmissionNo = () => {
    if (patients.length === 0) {
      return 'ADM-001';
    }
    
    // Extract the highest admission number
    const admissionNumbers = patients
      .map(p => p.admissionNo)
      .filter(num => num && num.startsWith('ADM-'))
      .map(num => parseInt(num.replace('ADM-', ''), 10))
      .filter(num => !isNaN(num));
    
    const maxNumber = admissionNumbers.length > 0 ? Math.max(...admissionNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    return `ADM-${String(nextNumber).padStart(3, '0')}`;
  };

  // Filter patients based on search query and date filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' || 
      patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phoneNumber.includes(searchQuery) ||
      patient.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.attenderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = filterDate === '' || patient.dateOfBirth === filterDate;
    
    return matchesSearch && matchesDate;
  });

  // Updates form data state on input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If DOB is changed, automatically calculate age
    if (name === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: calculatedAge
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handles submitting the new patient form
  const handleSubmit = () => {
    // Validation check
    if (!formData.patientName || !formData.phoneNumber || !formData.attenderName || 
        !formData.attenderMobile || !formData.reasonForVisit || !formData.dateOfBirth) {
      setModalError('Please fill all required fields marked with *');
      return;
    }

    const newPatient = {
      id: Date.now(),
      admissionNo: generateAdmissionNo(),
      ...formData,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Add new patient to the beginning of the list
    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    saveToStorage(updatedPatients);
    
    setShowModal(false);
    resetForm();
  };

  // Resets the form and clears errors
  const resetForm = () => {
    setFormData({
      patientName: '',
      phoneNumber: '',
      attenderName: '',
      attenderMobile: '',
      reasonForVisit: '',
      dateOfBirth: '',
      age: '',
      gender: 'Male'
    });
    setModalError('');
  };

  // Sets the editingId to enable inline editing for a patient
  const handleEdit = (id) => {
    setEditingId(id);
  };

  // Saves the changes after inline editing
  const handleSaveEdit = (id) => {
    setEditingId(null);
    saveToStorage(patients);
  };

  // Updates the patient data in state as the user types in the inline edit fields
  const handleEditChange = (id, field, value) => {
    if (field === 'dateOfBirth') {
      const calculatedAge = calculateAge(value);
      setPatients(prev => prev.map(patient => 
        patient.id === id ? { ...patient, [field]: value, age: calculatedAge } : patient
      ));
    } else {
      setPatients(prev => prev.map(patient => 
        patient.id === id ? { ...patient, [field]: value } : patient
      ));
    }
  };

  // Helper component for an editable field (used in mobile view)
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
    <div className="p-1 space-y-2 md:p-0 bg-gray-50 min-h-[75vh]">
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Patient Admission
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex gap-2 items-center justify-center px-4 py-2.5 w-full text-white bg-green-600 rounded-lg shadow-sm transition-colors hover:bg-green-700 sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Patient Admission
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, admission no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <div className="relative sm:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View with Fixed Header */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Admission No</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Patient Name</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Phone Number</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Attender Name</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Attender Mobile</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Reason For Visit</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Date of Birth</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Age</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Gender</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-y">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                 <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <input
                          type="text"
                          value={patient.phoneNumber}
                          onChange={(e) => handleEditChange(patient.id, 'phoneNumber', e.target.value)}
                          className="px-2 py-1 w-full border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">{patient.phoneNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <input
                          type="text"
                          value={patient.attenderName}
                          onChange={(e) => handleEditChange(patient.id, 'attenderName', e.target.value)}
                          className="px-2 py-1 w-full border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">{patient.attenderName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <input
                          type="text"
                          value={patient.attenderMobile}
                          onChange={(e) => handleEditChange(patient.id, 'attenderMobile', e.target.value)}
                          className="px-2 py-1 w-full border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">{patient.attenderMobile}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <input
                          type="text"
                          value={patient.reasonForVisit}
                          onChange={(e) => handleEditChange(patient.id, 'reasonForVisit', e.target.value)}
                          className="px-2 py-1 w-full border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">{patient.reasonForVisit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <input
                          type="date"
                          value={patient.dateOfBirth || ''}
                          onChange={(e) => handleEditChange(patient.id, 'dateOfBirth', e.target.value)}
                          className="px-2 py-1 w-full border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-900">{formatDateForDisplay(patient.dateOfBirth)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="text-gray-900">{patient.age}</span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {editingId === patient.id ? (
                        <select
                          value={patient.gender}
                          onChange={(e) => handleEditChange(patient.id, 'gender', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="text-gray-900">{patient.gender}</span>
                      )}
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
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    <UserPlus className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900">
                      {searchQuery || filterDate ? 'No patients found matching your filters' : 'No patients yet'}
                    </p>
                    <p className="text-sm">
                      {searchQuery || filterDate ? 'Try adjusting your search or filter' : 'Click "Patient Admission" to get started'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
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
                  <EditableField
                    label="Phone"
                    value={patient.phoneNumber}
                    onChange={(e) => handleEditChange(patient.id, 'phoneNumber', e.target.value)}
                  />
                  <EditableField
                    label="Attender"
                    value={patient.attenderName}
                    onChange={(e) => handleEditChange(patient.id, 'attenderName', e.target.value)}
                  />
                   <EditableField
                    label="Attender Mobile"
                    value={patient.attenderMobile}
                    onChange={(e) => handleEditChange(patient.id, 'attenderMobile', e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DOB:</span>
                    <input
                      type="date"
                      value={patient.dateOfBirth || ''}
                      onChange={(e) => handleEditChange(patient.id, 'dateOfBirth', e.target.value)}
                      className="px-2 py-1 w-1/2 text-right font-medium text-gray-900 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Age:</span>
                    <span className="px-2 py-1 w-1/2 text-right font-medium text-gray-900">
                      {patient.age}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gender:</span>
                    <select
                      value={patient.gender}
                      onChange={(e) => handleEditChange(patient.id, 'gender', e.target.value)}
                      className="px-2 py-1 w-1/2 text-right font-medium text-gray-900 border border-gray-300 rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <span className="text-gray-600">Reason:</span>
                    <textarea
                      value={patient.reasonForVisit}
                      onChange={(e) => handleEditChange(patient.id, 'reasonForVisit', e.target.value)}
                      rows="2"
                      className="px-2 py-1 mt-1 w-full text-gray-900 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{patient.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attender:</span>
                    <span className="font-medium text-gray-900">{patient.attenderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attender Mobile:</span>
                    <span className="font-medium text-gray-900">{patient.attenderMobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DOB:</span>
                    <span className="font-medium text-gray-900">{formatDateForDisplay(patient.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age/Gender:</span>
                    <span className="font-medium text-gray-900">{patient.age} / {patient.gender}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <span className="text-gray-600">Reason:</span>
                    <p className="mt-1 text-sm text-gray-900">{patient.reasonForVisit}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <UserPlus className="mx-auto mb-2 w-12 h-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-900">
              {searchQuery || filterDate ? 'No patients found' : 'No patients yet'}
            </p>
            <p className="text-xs text-gray-600">
              {searchQuery || filterDate ? 'Try adjusting your search or filter' : 'Click "Patient Admission" to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add New Patient Modal */}
      {showModal && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Add New Patient</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 rounded-full p-1 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Attender Name *
                  </label>
                  <input
                    type="text"
                    name="attenderName"
                    value={formData.attenderName}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Attender Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="attenderMobile"
                    value={formData.attenderMobile}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    readOnly
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-calculated from DOB"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Reason For Visit *
                  </label>
                  <textarea
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleInputChange}
                    rows="3"
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
                  Save Patient
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

export default Admission;