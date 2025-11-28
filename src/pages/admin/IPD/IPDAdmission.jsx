
import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit,
  Search,
  RefreshCw,
  BedDouble,
  Phone,
  Stethoscope,
  UserSquare,
  Building,
  Filter,
  Calendar,
} from 'lucide-react';

const PatientAdmissionSystem = () => {
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [ipdPatients, setIpdPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [admissionSearchTerm, setAdmissionSearchTerm] = useState('');
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [bedFilterType, setBedFilterType] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [formData, setFormData] = useState({
    registrationNumber: '',
    patientName: '',
    fatherHusband: '',
    age: '',
    gender: '',
    dob: '',
    phoneNumber: '',
    mobileNumber: '',
    emailId: '',
    houseStreet: '',
    areaColony: '',
    landmark: '',
    state: '',
    city: '',
    pincode: '',
    country: 'India',
    department: '',
    referByDr: '',
    consultantDr: '',
    patCategory: '',
    patientCase: '',
    medicalSurgical: '',
    healthCardNo: '',
    admissionPurpose: '',
    locationStatus: '',
    wardNo: '',
    roomNo: '',
    bedNo: '',
    bedLocation: '',
    wardType: '',
    room: '',
    bedTariff: '',
    kinName: '',
    kinRelation: '',
    kinMobile: '',
    advanceAmount: '',
    drVisitTariff: '',
    packageName: '',
    pkgAmount: '',
    expTariff: '',
    otherServices: '',
    vipDetails: '',
    religion: '',
    maritalStatus: '',
    attempt: '',
    remarks: '',
  });

  const [dropdownData] = useState({
    departments: [
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'General Medicine',
    ],
    doctors: [
      'Dr. Sharma',
      'Dr. Patel',
      'Dr. Kumar',
      'Dr. Singh',
      'Dr. Verma',
    ],
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'],
    locationStatus: ['General Ward', 'ICU', 'Emergency', 'Private Room'],
    wards: ['Ward A', 'Ward B', 'Ward C', 'Ward D'],
    rooms: ['Room 101', 'Room 102', 'Room 103', 'Room 104'],
    patCategories: ['General', 'Insurance', 'Corporate', 'VIP'],
    patientCases: ['Emergency', 'Routine', 'Follow-up', 'Surgery'],
    otherServices: ['Ambulance', 'Lab Tests', 'X-Ray', 'MRI', 'CT Scan'],
    drVisitTariffs: ['Standard', 'Premium', 'VIP'],
    cities: {
      Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
      Delhi: ['New Delhi', 'Dwarka', 'Rohini'],
      Karnataka: ['Bangalore', 'Mysore', 'Mangalore'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
      Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
    },
  });

  const [showBedModal, setShowBedModal] = useState(false);
  const [beds] = useState(() => {
    const sampleBeds = [];
    const wardTypes = [
      { location: 'General Male Ward', prefix: 'GMW' },
      { location: 'General Female Ward', prefix: 'GFW' },
      { location: 'ICU', prefix: 'ICU' },
      { location: 'Private Ward', prefix: 'PW' },
      { location: 'PICU', prefix: 'PICU' },
      { location: 'NICU', prefix: 'NICU' },
      { location: 'Emergency', prefix: 'EMG' },
      { location: 'HDU', prefix: 'HDU' },
      { location: 'General Ward(5th floor)', prefix: 'GW5' }
    ];
    
    wardTypes.forEach(({ location, prefix }) => {
      ['Ward A', 'Ward B'].forEach((ward) => {
        ['Room 101', 'Room 102'].forEach((room) => {
          for (let i = 1; i <= 4; i++) {
            sampleBeds.push({
              bedNo: `${prefix}-${ward.split(' ')[1]}-${room.split(' ')[1]}-${i}`,
              location,
              ward,
              room,
              status: Math.random() > 0.5 ? 'Available' : 'Occupied',
            });
          }
        });
      });
    });
    return sampleBeds;
  });

  // Load IPD patients from localStorage
  useEffect(() => {
    loadIpdPatients();
    loadAllPatients();

    const handleStorageChange = () => {
      loadIpdPatients();
      loadAllPatients();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      loadIpdPatients();
      loadAllPatients();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadIpdPatients = () => {
    try {
      const storedPatients = localStorage.getItem('admissionPatients');
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      
      if (storedPatients) {
        const allPatients = JSON.parse(storedPatients);
        const admittedAdmissionNumbers = storedIpdRecords 
          ? JSON.parse(storedIpdRecords).map(p => p.admissionNumber)
          : [];
        
        // Filter out patients who have already been admitted
        const ipdOnly = allPatients.filter(
          (p) => p.department === 'IPD' && 
                 p.status === 'assigned' && 
                 !admittedAdmissionNumbers.includes(p.admissionNo)
        );
        setIpdPatients(ipdOnly);
      }
    } catch (error) {
      console.log('Error loading IPD patients:', error);
    }
  };

  const loadAllPatients = () => {
    try {
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      if (storedIpdRecords) {
        const records = JSON.parse(storedIpdRecords);
        setPatients(records);
      }
    } catch (error) {
      console.log('Error loading IPD records:', error);
    }
  };

  const generateIpdNumber = () => {
    try {
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      let maxNumber = 0;

      if (storedIpdRecords) {
        const records = JSON.parse(storedIpdRecords);
        records.forEach((record) => {
          if (record.ipdNumber) {
            const numPart = parseInt(record.ipdNumber.split('-')[1]);
            if (numPart > maxNumber) {
              maxNumber = numPart;
            }
          }
        });
      }

      const newNumber = maxNumber + 1;
      return `IPD-${String(newNumber).padStart(3, '0')}`;
    } catch (error) {
      console.log('Error generating IPD number:', error);
      return 'IPD-001';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrationChange = (admissionNo) => {
    setFormData((prev) => ({ ...prev, registrationNumber: admissionNo }));
    setAdmissionSearchTerm(admissionNo);
    setShowAdmissionDropdown(false);

    if (admissionNo) {
      const selectedPatient = ipdPatients.find(
        (p) => p.admissionNo === admissionNo
      );
      if (selectedPatient) {
        setFormData((prev) => ({
          ...prev,
          patientName: selectedPatient.patientName || '',
          phoneNumber: selectedPatient.phoneNumber || '',
          mobileNumber: selectedPatient.phoneNumber || '',
          fatherHusband: selectedPatient.attenderName || '',
          age: selectedPatient.age || '',
          gender: selectedPatient.gender || '',
          dob: selectedPatient.dateOfBirth || '',
          admissionPurpose: selectedPatient.reasonForVisit || '',
        }));
      }
    }
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prev) => ({ ...prev, state, city: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.registrationNumber || !formData.department || !formData.bedNo) {
      alert('Please fill in all required fields');
      return;
    }

    const ipdNumber = editingPatient
      ? editingPatient.ipdNumber
      : generateIpdNumber();

    const newPatient = {
      id: editingPatient ? editingPatient.id : Date.now(),
      timestamp: new Date().toLocaleString(),
      admissionNumber: formData.registrationNumber,
      ipdNumber: ipdNumber,
      ...formData,
    };

    try {
      const storedIpdRecords = localStorage.getItem('ipdAdmissionRecords');
      let records = storedIpdRecords ? JSON.parse(storedIpdRecords) : [];

      if (editingPatient) {
        records = records.map((p) =>
          p.id === editingPatient.id ? newPatient : p
        );
        alert('Patient updated successfully!');
      } else {
        records.push(newPatient);
        alert('Patient admitted successfully! IPD Number: ' + ipdNumber);
      }

      localStorage.setItem('ipdAdmissionRecords', JSON.stringify(records));
      
      // Reload data to update dropdown and table
      loadAllPatients();
      loadIpdPatients();

      handleReset();
      setShowModal(false);
      setEditingPatient(null);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient. Please try again.');
    }
  };

  const handleReset = () => {
    setAdmissionSearchTerm('');
    setShowAdmissionDropdown(false);
    setFormData({
      registrationNumber: '',
      patientName: '',
      fatherHusband: '',
      age: '',
      gender: '',
      dob: '',
      phoneNumber: '',
      mobileNumber: '',
      emailId: '',
      houseStreet: '',
      areaColony: '',
      landmark: '',
      state: '',
      city: '',
      pincode: '',
      country: 'India',
      department: '',
      referByDr: '',
      consultantDr: '',
      patCategory: '',
      patientCase: '',
      medicalSurgical: '',
      healthCardNo: '',
      admissionPurpose: '',
      locationStatus: '',
      wardNo: '',
      roomNo: '',
      bedNo: '',
      bedLocation: '',
      wardType: '',
      room: '',
      bedTariff: '',
      kinName: '',
      kinRelation: '',
      kinMobile: '',
      advanceAmount: '',
      drVisitTariff: '',
      packageName: '',
      pkgAmount: '',
      expTariff: '',
      otherServices: '',
      vipDetails: '',
      religion: '',
      maritalStatus: '',
      attempt: '',
      remarks: '',
    });
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowModal(true);
  };

  const selectBed = (bed) => {
    setFormData((prev) => ({
      ...prev,
      bedNo: bed.bedNo,
      bedLocation: bed.location,
      wardType: bed.ward,
      room: bed.room,
      locationStatus: bed.location,
      wardNo: bed.ward,
      roomNo: bed.room,
    }));
    setShowBedModal(false);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.registrationNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.ipdNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber?.includes(searchTerm)
  );

  const NoDataComponent = () => (
    <div className="px-4 py-8 text-center text-gray-500">
      No IPD patient records found. Click "Add New Patient" to create one.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Patient Admission</h1>
            <button
              onClick={() => {
                setEditingPatient(null);
                handleReset();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              Patient Admission
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, admission no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="relative w-full md:w-64">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Table View with Fixed Header */}
          <div className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Admission No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Attender Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Attender Mobile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Reason for Visit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Date of Birth
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Age
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="12">
                        <NoDataComponent />
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {patient.admissionNumber || patient.ipdNumber}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {patient.patientName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                          {patient.phoneNumber || patient.mobileNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                          {patient.fatherHusband || patient.kinName || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                          {patient.kinMobile || patient.mobileNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                          {patient.admissionPurpose || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                          {patient.dob || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                          {patient.age || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 hidden lg:table-cell">
                          {patient.gender || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4 bg-green-50">
            {filteredPatients.length === 0 ? (
              <NoDataComponent />
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-green-700">
                          {patient.patientName}
                        </h3>
                        <p className="text-sm font-semibold text-purple-600">
                          {patient.ipdNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-green-100 text-green-700 p-2.5 rounded-full">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Location
                        </span>
                        <p className="text-base font-semibold text-green-700">
                          {patient.bedNo}
                        </p>
                        <p className="text-sm text-gray-700">
                          {patient.wardType} / {patient.room} (
                          {patient.locationStatus})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className="p-4 border-t border-gray-200 bg-green-50/80">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <div className="flex items-start gap-2">
                        <UserSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Admission No.
                          </span>
                          <p className="text-sm font-semibold text-green-600">
                            {patient.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Mobile
                          </span>
                          <p className="text-sm font-semibold text-gray-800">
                            {patient.mobileNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Consultant
                          </span>
                          <p className="text-sm font-semibold text-gray-800">
                            {patient.consultantDr || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Department
                          </span>
                          <p className="text-sm font-semibold text-gray-800">
                            {patient.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Admission Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-full md:max-h-[90vh] overflow-y-auto my-4 md:my-8">
              {/* Modal Header */}
              <div className="bg-green-700 text-white p-4 md:p-6 sticky top-0 z-10 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      {editingPatient ? 'Edit IPD Patient' : 'IPD Patient Admission'}
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {editingPatient
                        ? 'Update IPD patient information'
                        : 'Register IPD patients from department selection'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingPatient(null);
                      handleReset();
                    }}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-4 md:p-8">
                {/* Registration & Basic Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Registration & Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admission No. (From IPD){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="registrationNumber"
                          value={admissionSearchTerm}
                          onChange={(e) => {
                            setAdmissionSearchTerm(e.target.value);
                            setShowAdmissionDropdown(true);
                          }}
                          onFocus={() => setShowAdmissionDropdown(true)}
                          placeholder="Search admission number or patient name..."
                          required
                          disabled={editingPatient !== null}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                      {showAdmissionDropdown && !editingPatient && ipdPatients.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {ipdPatients
                            .filter((patient) => {
                              const searchLower = admissionSearchTerm.toLowerCase();
                              return (
                                patient.admissionNo.toLowerCase().includes(searchLower) ||
                                patient.patientName.toLowerCase().includes(searchLower)
                              );
                            })
                            .map((patient) => (
                              <div
                                key={patient.id}
                                onClick={() => handleRegistrationChange(patient.admissionNo)}
                                className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-semibold text-green-600">
                                  {patient.admissionNo}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {patient.patientName}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {ipdPatients.length === 0 
                          ? 'No available IPD patients. All patients have been admitted.'
                          : 'Type to search and select from available IPD patients'}
                      </p>
                    </div>

                    {editingPatient && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IPD Number
                        </label>
                        <input
                          type="text"
                          value={editingPatient.ipdNumber}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-bold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Father / Husband
                      </label>
                      <input
                        type="text"
                        name="fatherHusband"
                        value={formData.fatherHusband}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="0"
                        max="150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DOB
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone No.
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile No.
                      </label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email ID
                      </label>
                      <input
                        type="email"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        House No. Street
                      </label>
                      <input
                        type="text"
                        name="houseStreet"
                        value={formData.houseStreet}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area / Colony
                      </label>
                      <input
                        type="text"
                        name="areaColony"
                        value={formData.areaColony}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleStateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {dropdownData.states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!formData.state}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select State First</option>
                        {formData.state &&
                          dropdownData.cities[formData.state]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        {dropdownData.departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refer By Dr.
                      </label>
                      <select
                        name="referByDr"
                        value={formData.referByDr}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Doctor</option>
                        {dropdownData.doctors.map((doc) => (
                          <option key={doc} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultant Dr.
                      </label>
                      <select
                        name="consultantDr"
                        value={formData.consultantDr}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Doctor</option>
                        {dropdownData.doctors.map((doc) => (
                          <option key={doc} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pat. Category
                      </label>
                      <select
                        name="patCategory"
                        value={formData.patCategory}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {dropdownData.patCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Case
                      </label>
                      <select
                        name="patientCase"
                        value={formData.patientCase}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Case</option>
                        {dropdownData.patientCases.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical / Surgical
                      </label>
                      <select
                        name="medicalSurgical"
                        value={formData.medicalSurgical}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        <option value="Medical">Medical</option>
                        <option value="Surgical">Surgical</option>
                        <option value="Non-Surgical">Non-Surgical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Health Card No.
                      </label>
                      <input
                        type="text"
                        name="healthCardNo"
                        value={formData.healthCardNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adm. Purpose
                      </label>
                      <input
                        type="text"
                        name="admissionPurpose"
                        value={formData.admissionPurpose}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Bed Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Location & Bed Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Status
                      </label>
                      <select
                        name="locationStatus"
                        value={formData.locationStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Location</option>
                        {dropdownData.locationStatus.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ward No.
                      </label>
                      <select
                        name="wardNo"
                        value={formData.wardNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Ward</option>
                        {dropdownData.wards.map((ward) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room No.
                      </label>
                      <select
                        name="roomNo"
                        value={formData.roomNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Room</option>
                        {dropdownData.rooms.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bed No. <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="bedNo"
                          value={formData.bedNo}
                          readOnly
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBedModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          ...
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bed Location
                      </label>
                      <input
                        type="text"
                        name="bedLocation"
                        value={formData.bedLocation}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ward Type
                      </label>
                      <input
                        type="text"
                        name="wardType"
                        value={formData.wardType}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <input
                        type="text"
                        name="room"
                        value={formData.room}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bed Tariff
                      </label>
                      <select
                        name="bedTariff"
                        value={formData.bedTariff}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Tariff</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kin Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Kin Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kin's Name
                      </label>
                      <input
                        type="text"
                        name="kinName"
                        value={formData.kinName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kin's Relation
                      </label>
                      <input
                        type="text"
                        name="kinRelation"
                        value={formData.kinRelation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kin's Mobile No.
                      </label>
                      <input
                        type="tel"
                        name="kinMobile"
                        value={formData.kinMobile}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Amount
                      </label>
                      <input
                        type="number"
                        name="advanceAmount"
                        value={formData.advanceAmount}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dr. Visit Tariff
                      </label>
                      <select
                        name="drVisitTariff"
                        value={formData.drVisitTariff}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Tariff</option>
                        {dropdownData.drVisitTariffs.map((tariff) => (
                          <option key={tariff} value={tariff}>
                            {tariff}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        name="packageName"
                        value={formData.packageName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pkg Amount
                      </label>
                      <input
                        type="number"
                        name="pkgAmount"
                        value={formData.pkgAmount}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exp. Tariff
                      </label>
                      <input
                        type="text"
                        name="expTariff"
                        value={formData.expTariff}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Services
                      </label>
                      <select
                        name="otherServices"
                        value={formData.otherServices}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Service</option>
                        {dropdownData.otherServices.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        VIP Details
                      </label>
                      <input
                        type="text"
                        name="vipDetails"
                        value={formData.vipDetails}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Religion
                      </label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                      </label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attempt
                      </label>
                      <input
                        type="number"
                        name="attempt"
                        value={formData.attempt}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter any additional remarks..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow-md w-full md:w-auto"
                  >
                    {editingPatient ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="reset"
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow-sm hover:shadow-md w-full md:w-auto"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bed Selection Modal */}
        {showBedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-full md:max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gray-50 p-4 md:px-6 md:py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Select Available Bed
                </h2>
                <button
                  onClick={() => setShowBedModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto flex-1">
                {/* Bed Filter Buttons */}
                <div className="mb-4 flex flex-wrap gap-2 justify-start">
                  {['All', 'General Male Ward', 'General Female Ward', 'ICU', 'Private Ward', 'PICU', 'NICU', 'Emergency', 'HDU', 'General Ward(5th floor)'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setBedFilterType(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        bedFilterType === filter
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {beds
                    .filter((bed) => bedFilterType === 'All' || bed.location === bedFilterType)
                    .map((bed, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        bed.status === 'Available' && selectBed(bed)
                      }
                      className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        bed.status === 'Available'
                          ? 'border-green-500 bg-green-50 hover:shadow-lg hover:-translate-y-1'
                          : 'border-red-500 bg-red-50 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {bed.bedNo}
                      </div>
                      <div
                        className={`text-xs font-medium mb-2 ${
                          bed.status === 'Available'
                            ? 'text-green-700'
                            : 'text-red-7t00'
                        }`}
                      >
                        {bed.status}
                      </div>
                      <div className="text-xs text-gray-600">
                        {bed.location}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bed.ward} - {bed.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAdmissionSystem;