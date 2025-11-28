import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, FileText } from 'lucide-react';

const LabAdvice = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingAdvices, setPendingAdvices] = useState([]);
  const [historyAdvices, setHistoryAdvices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [modalError, setModalError] = useState('');
  
  const [formData, setFormData] = useState({
    priority: 'Medium',
    category: '',
    pathologyTests: [],
    radiologyType: '',
    radiologyTests: [],
    remarks: ''
  });

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

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedPending = localStorage.getItem('labAdvicePending');
      const storedHistory = localStorage.getItem('labAdviceHistory');
      const storedPatients = localStorage.getItem('admissionPatients');
      
      if (storedPending) setPendingAdvices(JSON.parse(storedPending));
      if (storedHistory) setHistoryAdvices(JSON.parse(storedHistory));
      
      // Load sample patients if no data exists
      if (storedPatients) {
        const patients = JSON.parse(storedPatients);
        if (patients.length > 0 && !storedPending) {
          // Create sample pending advices from admission data
          const sampleAdvices = patients.slice(0, 3).map((patient, index) => ({
            id: Date.now() + index,
            uniqueNumber: patient.admissionNo || `ADM-${Date.now()}-${index}`,
            patientName: patient.patientName,
            phoneNumber: patient.phoneNumber,
            attenderName: patient.attenderName || 'N/A',
            attenderMobile: patient.attenderMobile || 'N/A',
            reasonForVisit: patient.reasonForVisit,
            age: patient.age,
            gender: patient.gender,
            bedNo: `B-${101 + index}`,
            location: 'General Ward',
            wardType: 'General',
            room: `R-${201 + index}`,
            timestamp: new Date().toISOString()
          }));
          setPendingAdvices(sampleAdvices);
          localStorage.setItem('labAdvicePending', JSON.stringify(sampleAdvices));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const saveToStorage = (pending, history) => {
    try {
      localStorage.setItem('labAdvicePending', JSON.stringify(pending));
      localStorage.setItem('labAdviceHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const generateAdviceNo = () => {
    const nextNumber = historyAdvices.length + 1;
    return `AD-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleActionClick = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when category changes
      ...(name === 'category' && { 
        pathologyTests: [], 
        radiologyType: '', 
        radiologyTests: [] 
      }),
      // Reset radiology tests when type changes
      ...(name === 'radiologyType' && { radiologyTests: [] })
    }));
  };

  const handleCheckboxChange = (testName, category) => {
    setFormData(prev => {
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

  const handleSubmit = () => {
    if (!formData.category) {
      setModalError('Please select Pathology or Radiology');
      return;
    }

    if (formData.category === 'Pathology' && formData.pathologyTests.length === 0) {
      setModalError('Please select at least one pathology test');
      return;
    }

    if (formData.category === 'Radiology' && (!formData.radiologyType || formData.radiologyTests.length === 0)) {
      setModalError('Please select radiology type and at least one test');
      return;
    }

    // Add to history WITHOUT removing from pending
    const adviceRecord = {
      ...selectedPatient,
      ...formData,
      adviceNo: generateAdviceNo(),
      adviceId: Date.now(),
      completedDate: new Date().toISOString()
    };

    const updatedHistory = [adviceRecord, ...historyAdvices];

    setHistoryAdvices(updatedHistory);
    saveToStorage(pendingAdvices, updatedHistory);

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      priority: 'Medium',
      category: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
    setModalError('');
    setSelectedPatient(null);
  };

  const handleViewClick = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const getRadiologyTests = () => {
    switch(formData.radiologyType) {
      case 'X-ray': return xrayTests;
      case 'CT-scan': return ctScanTests;
      case 'USG': return usgTests;
      default: return [];
    }
  };

  return (
    <div className="p-3 space-y-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Lab Advice</h1>
          <p className="mt-1 text-sm text-gray-600">Manage pathology and radiology requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pending ({pendingAdvices.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          History ({historyAdvices.length})
        </button>
      </div>

      {/* Pending Section */}
      {activeTab === 'pending' && (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Unique Number</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone Number</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Attender Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Attender Mobile</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reason For Visit</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Bed No.</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ward Type</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Room</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAdvices.length > 0 ? (
                  pendingAdvices.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleActionClick(patient)}
                          className="px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                        >
                          Process
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{patient.uniqueNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.patientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.attenderName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.attenderMobile}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{patient.reasonForVisit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.age}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.bedNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.wardType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{patient.room}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                      <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No pending advices</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {pendingAdvices.length > 0 ? (
              pendingAdvices.map((patient) => (
                <div key={patient.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">{patient.uniqueNumber}</div>
                      <h3 className="text-sm font-semibold text-gray-900">{patient.patientName}</h3>
                    </div>
                    <button
                      onClick={() => handleActionClick(patient)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg shadow-sm"
                    >
                      Process
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{patient.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age/Gender:</span>
                      <span className="font-medium text-gray-900">{patient.age} / {patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed/Room:</span>
                      <span className="font-medium text-gray-900">{patient.bedNo} / {patient.room}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <span className="text-gray-600">Reason:</span>
                      <p className="mt-1 text-sm text-gray-900">{patient.reasonForVisit}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No pending advices</p>
              </div>
            )}
          </div>
        </>
      )}

      
      {/* History Section */}
{activeTab === 'history' && (
  <>
    {/* Desktop Table */}
    <div className="hidden overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm md:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Unique Number</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Advice No</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Patient Name</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Phone Number</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Reason For Visit</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Age</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Bed No.</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Location</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Ward Type</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Room</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Priority</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Pathology Tests</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Radiology Tests</th>
            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {historyAdvices.length > 0 ? (
            historyAdvices.map((record) => (
              <tr key={record.adviceId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.uniqueNumber}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.adviceNo}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.patientName}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.phoneNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{record.reasonForVisit}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.age}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.bedNo}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.location}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.wardType}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.room}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      record.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : record.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {record.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.category}</td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {record.category === 'Pathology'
                    ? record.pathologyTests?.slice(0, 2).join(', ') +
                      (record.pathologyTests?.length > 2 ? '...' : '')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {record.category === 'Radiology'
                    ? record.radiologyTests?.slice(0, 2).join(', ') +
                      (record.radiologyTests?.length > 2 ? '...' : '')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleViewClick(record)}
                    className="flex gap-1 items-center px-3 py-1.5 text-green-600 bg-green-50 rounded-lg shadow-sm hover:bg-green-100"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="15" className="px-4 py-8 text-center text-gray-500">
                <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">No history records</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className="space-y-3 md:hidden">
      {historyAdvices.length > 0 ? (
        historyAdvices.map((record) => (
          <div key={record.adviceId} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs font-medium text-green-600 mb-1">{record.uniqueNumber}</div>
                <div className="text-xs font-medium text-green-600 mb-1">{record.adviceNo}</div>
                <h3 className="text-sm font-semibold text-gray-900">{record.patientName}</h3>
                <div className="text-xs text-gray-500 mt-1">{record.phoneNumber}</div>
              </div>
              <button
                onClick={() => handleViewClick(record)}
                className="flex-shrink-0 px-3 py-1.5 text-xs text-green-600 bg-green-50 rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div><span className="text-gray-600">Reason:</span> {record.reasonForVisit}</div>
              <div><span className="text-gray-600">Age:</span> {record.age}</div>
              <div><span className="text-gray-600">Bed/Room:</span> {record.bedNo} / {record.room}</div>
              <div><span className="text-gray-600">Priority:</span> {record.priority}</div>
              <div><span className="text-gray-600">Category:</span> {record.category}</div>
              {record.category === 'Pathology' && record.pathologyTests?.length > 0 && (
                <div><span className="text-gray-600">Pathology:</span> {record.pathologyTests.slice(0, 2).join(', ')}{record.pathologyTests.length > 2 ? '...' : ''}</div>
              )}
              {record.category === 'Radiology' && record.radiologyTests?.length > 0 && (
                <div><span className="text-gray-600">Radiology:</span> {record.radiologyTests.slice(0, 2).join(', ')}{record.radiologyTests.length > 2 ? '...' : ''}</div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
          <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">No history records</p>
        </div>
      )}
    </div>
  </>
)}



      {/* Modal */}
      {showModal && selectedPatient && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Lab Advice Form</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              {/* Patient Info (Read-only) */}
              <div className="p-4 mb-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-gray-600">Unique No:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.uniqueNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.patientName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.phoneNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.age}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.gender}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <div className="font-medium text-gray-900">{selectedPatient.reasonForVisit}</div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Priority *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Pathology & Radiology *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                    </select>
                  </div>
                </div>

                {/* Pathology Tests */}
                {formData.category === 'Pathology' && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Pathology Tests * ({formData.pathologyTests.length} selected)
                    </label>
                    <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 rounded-lg border border-gray-300">
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {pathologyTests.map((test) => (
                          <label key={test} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.pathologyTests.includes(test)}
                              onChange={() => handleCheckboxChange(test, 'pathology')}
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
                {formData.category === 'Radiology' && (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Radiology Type *</label>
                      <select
                        name="radiologyType"
                        value={formData.radiologyType}
                        onChange={handleInputChange}
                        className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Type</option>
                        <option value="X-ray">X-ray</option>
                        <option value="CT-scan">CT Scan</option>
                        <option value="USG">USG</option>
                      </select>
                    </div>

                    {formData.radiologyType && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Select {formData.radiologyType} Tests * ({formData.radiologyTests.length} selected)
                        </label>
                        <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 rounded-lg border border-gray-300">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {getRadiologyTests().map((test) => (
                              <label key={test} className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.radiologyTests.includes(test)}
                                  onChange={() => handleCheckboxChange(test, 'radiology')}
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add any additional notes or instructions..."
                    className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {modalError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal for History */}
      {showViewModal && viewingRecord && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Lab Advice Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {/* Patient Information */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-gray-600">Unique No:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.uniqueNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Advice No:</span>
                    <div className="font-medium text-green-600">{viewingRecord.adviceNo}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.patientName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.phoneNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.age}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.gender}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bed No:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.bedNo}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.room}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ward Type:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.wardType}</div>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-gray-600">Reason for Visit:</span>
                    <div className="font-medium text-gray-900">{viewingRecord.reasonForVisit}</div>
                  </div>
                </div>
              </div>

              {/* Lab Advice Details */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Lab Advice Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewingRecord.priority === 'High' ? 'bg-red-100 text-red-700' :
                      viewingRecord.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {viewingRecord.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <div className="font-medium text-gray-900 mt-1">{viewingRecord.category}</div>
                  </div>

                  {/* Pathology Tests */}
                  {viewingRecord.category === 'Pathology' && viewingRecord.pathologyTests.length > 0 && (
                    <div>
                      <span className="text-gray-600">Pathology Tests ({viewingRecord.pathologyTests.length}):</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {viewingRecord.pathologyTests.map((test, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Radiology Tests */}
                  {viewingRecord.category === 'Radiology' && (
                    <>
                      <div>
                        <span className="text-gray-600">Radiology Type:</span>
                        <div className="font-medium text-gray-900 mt-1">{viewingRecord.radiologyType}</div>
                      </div>
                      {viewingRecord.radiologyTests.length > 0 && (
                        <div>
                          <span className="text-gray-600">Tests ({viewingRecord.radiologyTests.length}):</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {viewingRecord.radiologyTests.map((test, index) => (
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
                  {viewingRecord.remarks && (
                    <div>
                      <span className="text-gray-600">Remarks:</span>
                      <div className="font-medium text-gray-900 mt-1 p-2 bg-white rounded border border-gray-200">
                        {viewingRecord.remarks}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-600">Completed Date:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {new Date(viewingRecord.completedDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
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

export default LabAdvice;