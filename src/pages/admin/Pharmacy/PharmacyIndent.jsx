import React, { useState } from 'react';
import { Plus, X, Save, Trash2, Pill, Eye, Edit, CheckCircle } from 'lucide-react';

// Dummy Data
const DUMMY_ADMISSION_DATA = [
  {
    admissionNo: 'ADM-2024-001',
    patientName: 'Rajesh Kumar',
    staffName: 'Dr. Sharma',
    consultantName: 'Dr. Patel',
    uhidNumber: 'UHID-001',
    age: '45',
    gender: 'Male',
    wardLocation: 'Ward A - General',
    category: 'General',
    room: 'Room 101',
    diagnosis: 'Fever and Cold'
  },
  {
    admissionNo: 'ADM-2024-002',
    patientName: 'Priya Sharma',
    staffName: 'Dr. Singh',
    consultantName: 'Dr. Mehta',
    uhidNumber: 'UHID-002',
    age: '32',
    gender: 'Female',
    wardLocation: 'Ward B - ICU',
    category: 'Critical',
    room: 'Room 205',
    diagnosis: 'Post Surgery Recovery'
  },
  {
    admissionNo: 'ADM-2024-003',
    patientName: 'Amit Verma',
    staffName: 'Dr. Gupta',
    consultantName: 'Dr. Khan',
    uhidNumber: 'UHID-003',
    age: '28',
    gender: 'Male',
    wardLocation: 'Ward C - Private',
    category: 'Private',
    room: 'Room 310',
    diagnosis: 'Accident Case'
  }
];

const DUMMY_MEDICINE_NAMES = [
  'Paracetamol 500mg',
  'Amoxicillin 250mg',
  'Ibuprofen 400mg',
  'Cough Syrup',
  'Vitamin D3',
  'Omeprazole 20mg',
  'Aspirin 75mg',
  'Metformin 500mg',
  'Cetirizine 10mg',
  'Azithromycin 500mg'
];

const DUMMY_INVESTIGATION_NAMES = [
  'Complete Blood Count (CBC)',
  'Blood Sugar Fasting',
  'Blood Sugar Random',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'X-Ray Chest',
  'ECG (Electrocardiogram)',
  'Ultrasound Abdomen',
  'CT Scan',
  'MRI Scan',
  'Urine Routine & Microscopy',
  'HbA1c (Glycated Hemoglobin)',
  'Vitamin D Test',
  'Vitamin B12 Test',
  'ESR (Erythrocyte Sedimentation Rate)',
  'CRP (C-Reactive Protein)',
  'Blood Culture',
  'Stool Routine & Microscopy'
];

// Pathology tests list
const pathologyTests = [
  'LFT', 'RFT', 'Lipid Profile', 'CBC', 'HBA1C', 'Electrolyte', 'PT/INR', 'Blood Group', 
  'ESR', 'CRP', 'Sugar', 'Urine R/M', 'Viral Marker', 'Malaria', 'Dengue', 'Widal', 
  'Troponin-I', 'Troponin-T', 'SGOT', 'SGPT', 'Serum Urea', 'Serum Creatinine', 'CT-BT', 
  'ABG', 'Urine C/S', 'Thyroid Profile', 'UPT', 'HB', 'PPD', 'Sickling', 'Peripheral Smear', 
  'ASO Titre', 'DS-DNA', 'Serum Amylase', 'TSH', 'D-Dimer', 'Serum Lipase', 'SR Cortisol', 
  'Serum Magnesium', 'Serum Calcium', 'Urine Culture & Sensitivity', 'Blood Culture & Sensitivity', 
  'Pus Culture & Sensitivity', 'Pleural Fluid R/M', 'Pleural Fluid Culture & Sensitivity', 
  'Pleural Fluid ADA', 'Vitamin D3', 'Vitamin B12', 'HIV', 'HBsAg', 'HCV', 'VDRL', 
  'Ascitic Fluid R/M', 'Ascitic Culture & Sensitivity', 'Ascitic Fluid ADA', 'Urine Sugar Ketone', 
  'Serum Platelets', 'Serum Potassium', 'Serum Sodium', 'Sputum R/M', 'Sputum AFB', 'Sputum C/S', 
  'CBNAAT', 'CKMB', 'Cardiac SOB', 'Pro-BNP', 'Serum Uric Acid', 'Platelet Count', 'TB Gold', 
  'PCT', 'COVID IGG Antibodies', 'ANA Profile', 'Stool R/M', 'eGFR', '24 Hour Urine Protein Ratio', 
  'IGF-1', 'PTH', 'Serum FSH', 'Serum LH', 'Serum Prolactin', 'APTT', 'HB %', 'Biopsy Small', 
  'Biopsy Medium', 'Biopsy Large', 'Serum Homocysteine'
];

// X-Ray tests list
const xrayTests = [
  'X-Ray', 'Barium Enema', 'Barium Swallow', 'Cologram', 'Nephrostrogram', 'R.G.P.', 
  'Retrograde Urethrogram', 'Urethogram', 'X Ray Abdomen Upright', 'X Ray Cystogram', 
  'X Ray Hand Both', 'X Ray LS Spine Extension Flexion', 'X Ray Thoracic Spine', 
  'X Ray Tibia Fibula AP/Lat (Left/Right)', 'X-Ray Abdomen Erect/Standing/Upright', 
  'X-Ray Abdomen Flat Plate', 'X-Ray Abdomen KUB', 'X-Ray Ankle Joint AP And Lat (Left/Right)', 
  'X-Ray Chest PA', 'X-Ray Chest AP', 'X-Ray Chest Lateral View', 'X-Ray KUB', 
  'X-Ray LS Spine AP/Lat', 'X-Ray Pelvis AP', 'X-Ray Skull AP/Lat'
];

// CT Scan tests list
const ctScanTests = [
  'CT Scan', '3D CT Ankle', '3D CT Face', '3D CT Head', 'CECT Abdomen', 'CECT Chest', 
  'CECT Head', 'CECT Neck', 'CT Brain', 'CT Chest', 'HRCT Chest', 'NCCT Head', 
  'CT Scan Brain Plain', 'CT Angiography', 'CT-Scan - Brain With Contrast', 
  'CT-Scan - Brain Without Contrast', 'HRCT Chest (COVID)'
];

// USG tests list
const usgTests = [
  'USG', 'USG Whole Abdomen Male', 'USG Whole Abdomen Female', 'USG KUB Male', 'USG KUB Female', 
  'USG Pelvis Female', 'TVS', 'USG Upper Abdomen', 'USG Breast', 'USG Thyroid', 'USG Scrotum', 
  'Fetal Doppler USG', 'Carotid Doppler', 'USG OBS', 'Anomaly Scan', 'Growth Scan', 
  'USG Guided Biopsy', 'USG Abdomen With Pelvis'
];

const PharmacyIndents = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [submittedIndents, setSubmittedIndents] = useState(() => {
    const saved = localStorage.getItem('pharmacyIndents');
    return saved ? JSON.parse(saved) : [];
  });
  const [successData, setSuccessData] = useState(null);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    staffName: '',
    consultantName: '',
    patientName: '',
    uhidNumber: '',
    age: '',
    gender: '',
    wardLocation: '',
    category: '',
    room: '',
    diagnosis: ''
  });

  const [requestTypes, setRequestTypes] = useState({
    medicineSlip: false,
    investigation: false,
    package: false,
    nonPackage: false
  });

  const [medicines, setMedicines] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  
  // New state for investigation advice
  const [investigationAdvice, setInvestigationAdvice] = useState({
    priority: 'Medium',
    adviceCategory: '',
    pathologyTests: [],
    radiologyType: '',
    radiologyTests: [],
    remarks: ''
  });

  // Save to localStorage whenever submittedIndents changes
  React.useEffect(() => {
    localStorage.setItem('pharmacyIndents', JSON.stringify(submittedIndents));
  }, [submittedIndents]);

  const handleAdmissionSelect = (admissionNo) => {
    const selectedPatient = DUMMY_ADMISSION_DATA.find(
      patient => patient.admissionNo === admissionNo
    );

    if (selectedPatient) {
      setFormData({
        admissionNumber: selectedPatient.admissionNo,
        staffName: selectedPatient.staffName,
        consultantName: selectedPatient.consultantName,
        patientName: selectedPatient.patientName,
        uhidNumber: selectedPatient.uhidNumber,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
        wardLocation: selectedPatient.wardLocation,
        category: selectedPatient.category,
        room: selectedPatient.room,
        diagnosis: selectedPatient.diagnosis
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type) => {
    if (type === 'medicineSlip') {
      setRequestTypes(prev => ({
        ...prev,
        medicineSlip: !prev.medicineSlip,
        investigation: false
      }));
      if (!requestTypes.medicineSlip) {
        setInvestigations([]);
        setInvestigationAdvice({
          priority: 'Medium',
          adviceCategory: '',
          pathologyTests: [],
          radiologyType: '',
          radiologyTests: [],
          remarks: ''
        });
      }
    } else if (type === 'investigation') {
      setRequestTypes(prev => ({
        ...prev,
        investigation: !prev.investigation,
        medicineSlip: false
      }));
      if (!requestTypes.investigation) {
        setMedicines([]);
      }
    } else {
      setRequestTypes(prev => ({
        ...prev,
        [type]: !prev[type]
      }));
    }
  };

  const addMedicine = () => {
    const newMedicine = {
      id: Date.now(),
      name: '',
      quantity: ''
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const addInvestigation = () => {
    const newInvestigation = {
      id: Date.now(),
      name: '',
      notes: ''
    };
    setInvestigations([...investigations, newInvestigation]);
  };

  const removeInvestigation = (id) => {
    setInvestigations(investigations.filter(inv => inv.id !== id));
  };

  const updateInvestigation = (id, field, value) => {
    setInvestigations(investigations.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  // New handlers for investigation advice
  const handleInvestigationAdviceChange = (e) => {
    const { name, value } = e.target;
    setInvestigationAdvice(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'adviceCategory' && { 
        pathologyTests: [], 
        radiologyType: '', 
        radiologyTests: [] 
      }),
      ...(name === 'radiologyType' && { radiologyTests: [] })
    }));
  };

  const handleAdviceCheckboxChange = (testName, category) => {
    setInvestigationAdvice(prev => {
      const currentTests = category === 'pathology' ? prev.pathologyTests : prev.radiologyTests;
      const newTests = currentTests.includes(testName)
        ? currentTests.filter(t => t !== testName)
        : [...currentTests, testName];
      
      return {
        ...prev,
        [category === 'pathology' ? 'pathologyTests' : 'radiologyTests']: newTests
      };
    });
  };

  const getRadiologyTests = () => {
    switch(investigationAdvice.radiologyType) {
      case 'X-ray': return xrayTests;
      case 'CT-scan': return ctScanTests;
      case 'USG': return usgTests;
      default: return [];
    }
  };

  const generateIndentNumber = () => {
    const num = submittedIndents.length + 1;
    return `IND-${Date.now().toString().slice(-9)}`;
  };

  const handleSubmit = () => {
    if (!formData.admissionNumber) {
      alert('Please select Admission Number');
      return;
    }

    if (!formData.diagnosis) {
      alert('Please enter Diagnosis');
      return;
    }

    const hasRequestType = Object.values(requestTypes).some(value => value);
    if (!hasRequestType) {
      alert('Please select at least one Request Type');
      return;
    }

    if (requestTypes.medicineSlip && medicines.length === 0) {
      alert('Please add at least one medicine');
      return;
    }

    const incompleteMedicines = medicines.some(med => !med.name || !med.quantity);
    if (requestTypes.medicineSlip && incompleteMedicines) {
      alert('Please fill all medicine details');
      return;
    }

    // Validation for investigation advice
    if (requestTypes.investigation) {
      if (!investigationAdvice.adviceCategory) {
        alert('Please select Pathology or Radiology for investigation');
        return;
      }

      if (investigationAdvice.adviceCategory === 'Pathology' && investigationAdvice.pathologyTests.length === 0) {
        alert('Please select at least one pathology test');
        return;
      }

      if (investigationAdvice.adviceCategory === 'Radiology') {
        if (!investigationAdvice.radiologyType) {
          alert('Please select radiology type');
          return;
        }
        if (investigationAdvice.radiologyTests.length === 0) {
          alert('Please select at least one radiology test');
          return;
        }
      }
    }

    let indentNumber;
    
    if (editMode && selectedIndent) {
      const updatedIndents = submittedIndents.map(indent =>
        indent.indentNumber === selectedIndent.indentNumber
          ? {
              ...indent,
              ...formData,
              requestTypes: { ...requestTypes },
              medicines: [...medicines],
              investigations: [...investigations],
              investigationAdvice: { ...investigationAdvice },
              updatedAt: new Date().toISOString()
            }
          : indent
      );
      setSubmittedIndents(updatedIndents);
      indentNumber = selectedIndent.indentNumber;
    } else {
      indentNumber = generateIndentNumber();
      const newIndent = {
        indentNumber: indentNumber,
        ...formData,
        requestTypes: { ...requestTypes },
        medicines: [...medicines],
        investigations: [...investigations],
        investigationAdvice: { ...investigationAdvice },
        submittedAt: new Date().toISOString()
      };
      setSubmittedIndents([newIndent, ...submittedIndents]);
    }

    const totalMedicines = requestTypes.medicineSlip ? medicines.reduce((sum, med) => sum + parseInt(med.quantity || 0), 0) : 0;

    setSuccessData({
      indentNumber: indentNumber,
      patientName: formData.patientName,
      admissionNo: formData.admissionNumber,
      totalMedicines: totalMedicines
    });

    setShowModal(false);
    setEditMode(false);
    setSuccessModal(true);
  };

  const resetForm = () => {
    setFormData({
      admissionNumber: '',
      staffName: '',
      consultantName: '',
      patientName: '',
      uhidNumber: '',
      age: '',
      gender: '',
      wardLocation: '',
      category: '',
      room: '',
      diagnosis: ''
    });
    setRequestTypes({
      medicineSlip: false,
      investigation: false,
      package: false,
      nonPackage: false
    });
    setMedicines([]);
    setInvestigations([]);
    setInvestigationAdvice({
      priority: 'Medium',
      adviceCategory: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
    setSelectedIndent(null);
  };

  const handleView = (indent) => {
    setSelectedIndent(indent);
    setViewModal(true);
  };

  const handleEdit = (indent) => {
    setSelectedIndent(indent);
    setFormData({
      admissionNumber: indent.admissionNumber,
      staffName: indent.staffName,
      consultantName: indent.consultantName,
      patientName: indent.patientName,
      uhidNumber: indent.uhidNumber,
      age: indent.age,
      gender: indent.gender,
      wardLocation: indent.wardLocation,
      category: indent.category,
      room: indent.room,
      diagnosis: indent.diagnosis
    });
    setRequestTypes({ ...indent.requestTypes });
    setMedicines([...indent.medicines]);
    setInvestigations([...(indent.investigations || [])]);
    setInvestigationAdvice(indent.investigationAdvice || {
      priority: 'Medium',
      adviceCategory: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const getSummaryData = () => {
    if (requestTypes.medicineSlip && medicines.length > 0) {
      const medicineMap = {};
      medicines.forEach(med => {
        if (med.name && med.quantity) {
          if (medicineMap[med.name]) {
            medicineMap[med.name] += parseInt(med.quantity);
          } else {
            medicineMap[med.name] = parseInt(med.quantity);
          }
        }
      });
      return Object.entries(medicineMap).map(([name, quantity], index) => ({
        srNo: index + 1,
        name,
        quantity
      }));
    }
    return [];
  };

  const summaryData = getSummaryData();
  const totalQuantity = summaryData.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Indents</h1>
            <p className="text-gray-600 mt-1">Manage pharmacy requests and medications</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Indent
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Indent No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Admission No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Patient Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">UHID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Staff Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Request Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submittedIndents.length > 0 ? (
                  submittedIndents.map((indent) => (
                    <tr key={indent.indentNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-green-700">{indent.indentNumber}</td>
                      <td className="px-6 py-4 text-sm">{indent.admissionNumber}</td>
                      <td className="px-6 py-4 text-sm">{indent.patientName}</td>
                      <td className="px-6 py-4 text-sm">{indent.uhidNumber}</td>
                      <td className="px-6 py-4 text-sm">{indent.staffName}</td>
                      <td className="px-6 py-4 text-sm">{indent.diagnosis}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {indent.requestTypes.medicineSlip && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Medicine</span>
                          )}
                          {indent.requestTypes.investigation && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Investigation</span>
                          )}
                          {indent.requestTypes.package && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Package</span>
                          )}
                          {indent.requestTypes.nonPackage && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Non-Package</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(indent)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(indent)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Edit Indent"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No indents created yet</p>
                      <p className="text-gray-400 text-sm mt-1">Click "New Indent" to create one</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editMode ? 'Edit Indent' : 'Create New Indent'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setEditMode(false);
                }}
                className="text-white hover:bg-green-700 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Number <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={(e) => handleAdmissionSelect(e.target.value)}
                      disabled={editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Admission</option>
                      {DUMMY_ADMISSION_DATA.map((patient) => (
                        <option key={patient.admissionNo} value={patient.admissionNo}>
                          {patient.admissionNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UHID Number</label>
                    <input
                      type="text"
                      value={formData.uhidNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={formData.age}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <input
                      type="text"
                      value={formData.gender}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input
                      type="text"
                      value={formData.room}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                    <input
                      type="text"
                      value={formData.staffName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Location</label>
                    <input
                      type="text"
                      value={formData.wardLocation}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter diagnosis"
                    />
                  </div>
                </div>
              </div>

              {/* Request Type */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Request Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'medicineSlip', label: 'Medicine Slip' },
                    { id: 'investigation', label: 'Investigation' },
                    { id: 'package', label: 'Package' },
                    { id: 'nonPackage', label: 'Non Package' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestTypes[type.id]}
                        onChange={() => handleCheckboxChange(type.id)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medicines Section */}
              {requestTypes.medicineSlip && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Medicines</h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    {medicines.map((medicine, index) => (
                      <div key={medicine.id} className="flex gap-3 items-end">
                        <div className="w-8 h-10 flex items-center justify-center bg-green-600 text-white rounded font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                          <select
                            value={medicine.name}
                            onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Medicine</option>
                            {DUMMY_MEDICINE_NAMES.map((med) => (
                              <option key={med} value={med}>{med}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) => updateMedicine(medicine.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0"
                          />
                        </div>
                        <button
                          onClick={() => removeMedicine(medicine.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg h-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addMedicine}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>
                </div>
              )}

              {/* Investigation Advice Section */}
              {requestTypes.investigation && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Investigation Advice</h3>
                  
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                        <select
                          name="priority"
                          value={investigationAdvice.priority}
                          onChange={handleInvestigationAdviceChange}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pathology & Radiology *</label>
                        <select
                          name="adviceCategory"
                          value={investigationAdvice.adviceCategory}
                          onChange={handleInvestigationAdviceChange}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Category</option>
                          <option value="Pathology">Pathology</option>
                          <option value="Radiology">Radiology</option>
                        </select>
                      </div>
                    </div>

                    {/* Pathology Tests */}
                    {investigationAdvice.adviceCategory === 'Pathology' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Pathology Tests * ({investigationAdvice.pathologyTests.length} selected)
                        </label>
                        <div className="p-4 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-300">
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {pathologyTests.map((test) => (
                              <label key={test} className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={investigationAdvice.pathologyTests.includes(test)}
                                  onChange={() => handleAdviceCheckboxChange(test, 'pathology')}
                                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">{test}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Radiology Section */}
                    {investigationAdvice.adviceCategory === 'Radiology' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Radiology Type *</label>
                          <select
                            name="radiologyType"
                            value={investigationAdvice.radiologyType}
                            onChange={handleInvestigationAdviceChange}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Type</option>
                            <option value="X-ray">X-ray</option>
                            <option value="CT-scan">CT Scan</option>
                            <option value="USG">USG</option>
                          </select>
                        </div>

                        {investigationAdvice.radiologyType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select {investigationAdvice.radiologyType} Tests * ({investigationAdvice.radiologyTests.length} selected)
                            </label>
                            <div className="p-4 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-300">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {getRadiologyTests().map((test) => (
                                  <label key={test} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={investigationAdvice.radiologyTests.includes(test)}
                                      onChange={() => handleAdviceCheckboxChange(test, 'radiology')}
                                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700">{test}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        name="remarks"
                        value={investigationAdvice.remarks}
                        onChange={handleInvestigationAdviceChange}
                        rows="3"
                        placeholder="Add any additional notes or instructions..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Medicine Summary Section */}
              {requestTypes.medicineSlip && summaryData.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medicine Summary</h3>
                  <div className="bg-green-50 rounded-lg overflow-hidden border border-green-200">
                    <table className="min-w-full">
                      <thead className="bg-green-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Sr No</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Medicine Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-200 bg-white">
                        {summaryData.map((item) => (
                          <tr key={item.srNo}>
                            <td className="px-4 py-3 text-sm">{item.srNo}</td>
                            <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                            <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-green-100">
                        <tr>
                          <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-800">Total Items: {summaryData.length}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-800">Total Qty: {totalQuantity}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditMode(false);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  <Save className="w-4 h-4" />
                  {editMode ? 'Update Indent' : 'Submit Indent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Success Header */}
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Success!</h2>
            </div>

            {/* Success Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">Your indent has been submitted successfully!</p>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Indent Number:</span>
                  <span className="text-sm font-bold text-green-600">{successData.indentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient Name:</span>
                  <span className="text-sm font-medium text-gray-800">{successData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admission No:</span>
                  <span className="text-sm font-medium text-gray-800">{successData.admissionNo}</span>
                </div>
                {successData.totalMedicines > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Medicines:</span>
                    <span className="text-sm font-medium text-gray-800">{successData.totalMedicines}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSuccessModal(false);
                    if (selectedIndent) {
                      handleView(submittedIndents.find(i => i.indentNumber === successData.indentNumber));
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSuccessModal(false);
                    resetForm();
                    setShowModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Create New Indent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Indent Details - {selectedIndent.indentNumber}</h2>
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedIndent(null);
                }}
                className="text-white hover:bg-green-700 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Admission Number</p>
                    <p className="font-medium">{selectedIndent.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient Name</p>
                    <p className="font-medium">{selectedIndent.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">UHID Number</p>
                    <p className="font-medium">{selectedIndent.uhidNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{selectedIndent.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{selectedIndent.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{selectedIndent.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">{selectedIndent.room}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ward Location</p>
                    <p className="font-medium">{selectedIndent.wardLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Staff Name</p>
                    <p className="font-medium">{selectedIndent.staffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Consultant Name</p>
                    <p className="font-medium">{selectedIndent.consultantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="font-medium">{selectedIndent.diagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Request Types */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Request Types</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIndent.requestTypes.medicineSlip && (
                    <span className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">Medicine Slip</span>
                  )}
                  {selectedIndent.requestTypes.investigation && (
                    <span className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">Investigation</span>
                  )}
                  {selectedIndent.requestTypes.package && (
                    <span className="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg font-medium">Package</span>
                  )}
                  {selectedIndent.requestTypes.nonPackage && (
                    <span className="px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg font-medium">Non-Package</span>
                  )}
                </div>
              </div>

              {/* Medicines */}
              {selectedIndent.requestTypes.medicineSlip && selectedIndent.medicines.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medicines</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-green-600 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Medicine Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedIndent.medicines.map((medicine, index) => (
                          <tr key={medicine.id}>
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium">{medicine.name}</td>
                            <td className="px-4 py-3 text-sm">{medicine.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Investigation Advice Details */}
              {selectedIndent.requestTypes.investigation && selectedIndent.investigationAdvice && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Investigation Advice</h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedIndent.investigationAdvice.priority === 'High' ? 'bg-red-100 text-red-700' :
                          selectedIndent.investigationAdvice.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {selectedIndent.investigationAdvice.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <div className="font-medium text-gray-900 mt-1">{selectedIndent.investigationAdvice.adviceCategory}</div>
                      </div>

                      {/* Pathology Tests */}
                      {selectedIndent.investigationAdvice.adviceCategory === 'Pathology' && selectedIndent.investigationAdvice.pathologyTests?.length > 0 && (
                        <div>
                          <span className="text-gray-600">Pathology Tests ({selectedIndent.investigationAdvice.pathologyTests.length}):</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedIndent.investigationAdvice.pathologyTests.map((test, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Radiology Tests */}
                      {selectedIndent.investigationAdvice.adviceCategory === 'Radiology' && (
                        <>
                          <div>
                            <span className="text-gray-600">Radiology Type:</span>
                            <div className="font-medium text-gray-900 mt-1">{selectedIndent.investigationAdvice.radiologyType}</div>
                          </div>
                          {selectedIndent.investigationAdvice.radiologyTests?.length > 0 && (
                            <div>
                              <span className="text-gray-600">Tests ({selectedIndent.investigationAdvice.radiologyTests.length}):</span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedIndent.investigationAdvice.radiologyTests.map((test, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                    {test}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Remarks */}
                      {selectedIndent.investigationAdvice.remarks && (
                        <div>
                          <span className="text-gray-600">Remarks:</span>
                          <div className="font-medium text-gray-900 mt-1 p-2 bg-white rounded border border-gray-200">
                            {selectedIndent.investigationAdvice.remarks}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Submitted At</p>
                    <p className="font-medium">{new Date(selectedIndent.submittedAt).toLocaleString()}</p>
                  </div>
                  {selectedIndent.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{new Date(selectedIndent.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={() => {
                    setViewModal(false);
                    setSelectedIndent(null);
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyIndents;