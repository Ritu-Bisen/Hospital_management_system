import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Plus, X } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {status}
    </span>
  );
};

export default function Lab() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const data = location.state?.data;
  const [showLabModal, setShowLabModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [labFormData, setLabFormData] = useState({
    priority: 'Medium',
    category: '',
    pathologyTests: [],
    radiologyType: '',
    radiologyTests: [],
    remarks: ''
  });

  // Pending and history lists for Lab Advice
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Helper to read stored admission records from localStorage (available to render and handlers)
  const fetchStoredAdmissionRecord = (admissionNoOrUhid) => {
    try {
      const raw = localStorage.getItem('ipdAdmissionRecords');
      if (!raw) return null;
      const records = JSON.parse(raw);
      if (!Array.isArray(records)) return null;
      return records.find(r => (
        (r.ipdNumber && r.ipdNumber.toString() === (admissionNoOrUhid || '').toString()) ||
        (r.admissionNumber && r.admissionNumber.toString() === (admissionNoOrUhid || '').toString()) ||
        (r.uhid && r.uhid.toString() === (admissionNoOrUhid || '').toString()) ||
        (r.id && r.id.toString() === (admissionNoOrUhid || '').toString())
      )) || null;
    } catch (e) {
      return null;
    }
  };

  // Initialize history list and pending list from localStorage and incoming data when component mounts
  useEffect(() => {
    if (!data) return;

    const getStoredAdmissionRecord = (admissionNoOrUhid) => {
      try {
        const raw = localStorage.getItem('ipdAdmissionRecords');
        if (!raw) return null;
        const records = JSON.parse(raw);
        if (!Array.isArray(records)) return null;
        return records.find(r => (
          (r.ipdNumber && r.ipdNumber.toString() === (admissionNoOrUhid || '').toString()) ||
          (r.admissionNumber && r.admissionNumber.toString() === (admissionNoOrUhid || '').toString()) ||
          (r.uhid && r.uhid.toString() === (admissionNoOrUhid || '').toString()) ||
          (r.id && r.id.toString() === (admissionNoOrUhid || '').toString())
        )) || null;
      } catch (e) {
        return null;
      }
    };

    const src = data.labAdviceHistory || data.labHistory || data.labAdvice || data.labTests || [];
    let hist = [];
    if (Array.isArray(src) && src.length) {
      hist = src.map((item, idx) => {
        if (item.adviceNo) return item;
        // convert existing test-like entries into history entries
        const stored = getStoredAdmissionRecord(data.personalInfo.ipd || data.personalInfo.uhid);
        return {
          admissionNo: data.personalInfo.ipd || '',
          adviceNo: `AD-${String(src.length - idx).padStart(3, '0')}`,
          patientName: data.personalInfo.name,
          phone: data.personalInfo.phone,
          reason: data.admissionInfo?.reasonForAdmission || '',
          age: data.personalInfo.age,
          bedNo: stored?.bedNo || stored?.bed || data.admissionInfo?.bedNo || data.admissionInfo?.bed || data.departmentInfo?.bedNumber || '',
          location: stored?.location || stored?.bedLocation || data.admissionInfo?.location || data.departmentInfo?.bedLocation || data.departmentInfo?.ward || '',
          wardType: stored?.ward || stored?.wardType || data.admissionInfo?.wardType || data.admissionInfo?.ward || data.departmentInfo?.ward || '',
          room: stored?.room || data.admissionInfo?.room || data.departmentInfo?.room || '',
          priority: item.priority || '',
          category: item.type || '',
          tests: item.tests || (item.name ? [item.name] : []),
          reportUrl: item.reportUrl || null
        };
      });
    }

    // sort descending so the top row is the latest advice (largest number)
    hist.sort((a, b) => {
      const na = parseInt((a.adviceNo || 'AD-000').replace(/^AD-/, ''), 10) || 0;
      const nb = parseInt((b.adviceNo || 'AD-000').replace(/^AD-/, ''), 10) || 0;
      return nb - na;
    });

    setHistoryList(hist);

    // IMPORTANT: Load pending from localStorage FIRST - it has priority
    // This ensures submitted pending records persist across page navigation
    try {
      const stored = localStorage.getItem('labAdviceHistory');
      if (stored) {
        const pending = JSON.parse(stored);
        if (Array.isArray(pending) && pending.length > 0) {
          setPendingList(pending);
          console.log('Loaded pending records from localStorage:', pending.length);
          return; // Exit - don't overwrite localStorage data
        }
      }
    } catch (e) {
      console.error('Failed to load pending from localStorage:', e);
    }
    
    // If no pending data in localStorage, start with empty pending list
    setPendingList([]);
  }, [data]);

  // Refresh pending list from localStorage when page becomes visible (tab focus)
  useEffect(() => {
    const handleFocus = () => {
      try {
        const stored = localStorage.getItem('labAdviceHistory');
        if (stored) {
          const pending = JSON.parse(stored);
          if (Array.isArray(pending)) {
            setPendingList(pending);
          }
        }
      } catch (e) {
        console.error('Failed to refresh pending from localStorage:', e);
      }
    };

    const handlePaymentProcessed = () => {
      console.log('Payment processed event received. Reloading pending list...');
      handleFocus();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('paymentProcessed', handlePaymentProcessed);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('paymentProcessed', handlePaymentProcessed);
    };
  }, []);

  // Stored record for render-time display in modal (prefer localStorage values)
  const storedRecord = data ? fetchStoredAdmissionRecord(data.personalInfo.ipd || data.personalInfo.uhid) : null;

  // Pathology tests list
  const pathologyTests = [
    'LFT', 'RFT', 'Lipid Profile', 'CBC', 'HBA1C', 'Electrolyte', 'PT/INR', 'Blood Group', 
    'ESR', 'CRP', 'Sugar', 'Urine R/M', 'Viral Marker', 'Malaria', 'Dengue', 'Widal', 
    'Troponin-I', 'Troponin-T', 'SGOT', 'SGPT', 'Serum Urea', 'Serum Creatinine', 'CT-BT', 
    'ABG', 'Urine C/S', 'Thyroid Profile', 'UPT', 'HB', 'PPD', 'Sickling', 'Peripheral Smear'
  ];

  // X-Ray tests list
  const xrayTests = [
    'X-Ray Chest PA', 'X-Ray Chest AP', 'X-Ray Chest Lateral View', 'X-Ray KUB', 
    'X-Ray LS Spine AP/Lat', 'X-Ray Pelvis AP', 'X-Ray Skull AP/Lat'
  ];

  // CT Scan tests list
  const ctScanTests = [
    'CT Brain', 'CT Chest', 'HRCT Chest', 'NCCT Head', 'CT Angiography'
  ];

  // USG tests list
  const usgTests = [
    'USG Whole Abdomen', 'USG KUB', 'USG Pelvis', 'TVS', 'USG Breast', 'USG Thyroid'
  ];

  const handleLabInputChange = (e) => {
    const { name, value } = e.target;
    setLabFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' && { 
        pathologyTests: [], 
        radiologyType: '', 
        radiologyTests: [] 
      }),
      ...(name === 'radiologyType' && { radiologyTests: [] })
    }));
  };

  const handleCheckboxChange = (testName, category) => {
    setLabFormData(prev => {
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

  const handleLabSubmit = () => {
    // Generate next Advice No by reading top of historyList (if present)
    const getNextAdviceNo = () => {
      const top = historyList && historyList.length ? historyList[0].adviceNo : null;
      if (!top) return 'AD-001';
      const num = parseInt(top.replace(/^AD-/, ''), 10);
      const next = num + 1;
      return `AD-${String(next).padStart(3, '0')}`;
    };

    const adviceNo = getNextAdviceNo();

    const testsSelected = labFormData.category === 'Pathology' ? labFormData.pathologyTests : labFormData.radiologyTests;

    // Try to enrich with stored admission record from localStorage when present
    const storedForNew = (() => {
      try {
        const raw = localStorage.getItem('ipdAdmissionRecords');
        if (!raw) return null;
        const records = JSON.parse(raw);
        return records.find(r => (r.ipdNumber === data.personalInfo.ipd || r.admissionNumber === data.personalInfo.ipd || r.uhid === data.personalInfo.uhid)) || null;
      } catch (e) {
        return null;
      }
    })();

    const newAdvice = {
      adviceId: `AD-${Date.now()}`,
      uniqueNumber: data.personalInfo.uhid || data.personalInfo.ipd || '',
      admissionNo: data.personalInfo.ipd || '',
      adviceNo,
      patientName: data.personalInfo.name,
      phone: data.personalInfo.phone,
      phoneNumber: data.personalInfo.phone,
      reason: data.admissionInfo?.reasonForAdmission || data.admissionInfo?.presentingComplaint || '',
      reasonForVisit: data.admissionInfo?.reasonForAdmission || data.admissionInfo?.presentingComplaint || '',
      age: data.personalInfo.age,
      gender: data.personalInfo.gender || '',
      bedNo: storedForNew?.bedNo || storedForNew?.bed || data.admissionInfo?.bedNo || data.admissionInfo?.bed || data.departmentInfo?.bedNumber || '',
      location: storedForNew?.location || storedForNew?.bedLocation || data.admissionInfo?.location || data.departmentInfo?.bedLocation || data.departmentInfo?.ward || '',
      wardType: storedForNew?.ward || storedForNew?.wardType || data.admissionInfo?.wardType || data.admissionInfo?.ward || data.departmentInfo?.ward || '',
      room: storedForNew?.room || data.admissionInfo?.room || data.departmentInfo?.room || '',
      priority: labFormData.priority,
      category: labFormData.category,
      tests: testsSelected,
      pathologyTests: labFormData.category === 'Pathology' ? testsSelected : [],
      radiologyType: labFormData.radiologyType,
      radiologyTests: labFormData.category === 'Radiology' ? testsSelected : [],
      remarks: labFormData.remarks,
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      reportUrl: null
    };

    // Add to pending list (prepend so newest is top)
    const updatedPendingList = [newAdvice, ...pendingList];
    setPendingList(updatedPendingList);

    // Store in localStorage for Payment Slip page
    try {
      localStorage.setItem('labAdviceHistory', JSON.stringify(updatedPendingList));
      console.log('Saved to localStorage:', updatedPendingList.length, 'pending records');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Show payment slip with data
    setPaymentData(newAdvice);
    setShowPaymentSlip(true);

    // Reset form and close modal
    setShowLabModal(false);
    setLabFormData({
      priority: 'Medium',
      category: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
  };

  const getRadiologyTests = () => {
    switch(labFormData.radiologyType) {
      case 'X-ray': return xrayTests;
      case 'CT-scan': return ctScanTests;
      case 'USG': return usgTests;
      default: return [];
    }
  };

  const handlePaymentConfirm = () => {
    if (!paymentData) return;
    
    // Just close the payment slip modal and keep record in Pending
    // The record will move to History only when Payment Slip page processes it
    setShowPaymentSlip(false);
    setPaymentData(null);
    setActiveTab('pending');  // Show pending tab
    
    console.log('Payment slip closed. Record remains in Pending until processed in Payment Slip page');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No patient data available</p>
          <button
            onClick={() => navigate(`/admin/patient-profile/${id}`)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Overview
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
            onClick={() => navigate(`/admin/patient-profile/${id}`)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient Overview
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Laboratory Tests</h1>
                <p className="text-sm opacity-90 mt-1">{data.personalInfo.name} - {data.personalInfo.uhid}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLabModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lab Advice
            </button>
          </div>
        </div>

        {/* Content: Pending and History sections */}
        <div className="p-6">
          {/* Pending and History Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 rounded-lg py-3 px-4 text-center font-bold transition-colors ${
                activeTab === 'pending' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Pending ({pendingList.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 rounded-lg py-3 px-4 text-center font-bold transition-colors ${
                activeTab === 'history' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              History ({historyList.length})
            </button>
          </div>

          {/* Pending Section */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {pendingList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">UNIQUE NUMBER</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ADVICE NO</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PATIENT NAME</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PHONE NUMBER</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">REASON FOR VISIT</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">AGE</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">BED NO.</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">LOCATION</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">WARD TYPE</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ROOM</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PRIORITY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">CATEGORY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">TESTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map((p, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{p.uniqueNumber}</td>
                          <td className="px-4 py-3 text-green-600 font-semibold">{p.adviceNo}</td>
                          <td className="px-4 py-3 text-gray-700">{p.patientName}</td>
                          <td className="px-4 py-3 text-gray-700">{p.phone}</td>
                          <td className="px-4 py-3 text-gray-700">{p.reason}</td>
                          <td className="px-4 py-3 text-gray-700">{p.age}</td>
                          <td className="px-4 py-3 text-gray-700">{p.bedNo || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.bedNo) || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{p.location || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.location) || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.bedLocation) || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{p.wardType || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.ward) || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.wardType) || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{p.room || (fetchStoredAdmissionRecord(p.admissionNo || p.uniqueNumber)?.room) || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              p.priority === 'High' ? 'bg-red-100 text-red-700' : 
                              p.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{p.category}</td>
                          <td className="px-4 py-3 text-gray-700 text-xs">{(p.tests || []).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mb-4 text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No pending payments</p>
                  <p className="text-gray-500 text-sm">Records from Lab Advice History will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {historyList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ACTION</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">UNIQUE NUMBER</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ADVICE NO</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PATIENT NAME</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PHONE NUMBER</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">REASON FOR VISIT</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">AGE</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">BED NO.</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">LOCATION</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">WARD TYPE</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ROOM</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PRIORITY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">CATEGORY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">TESTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((h, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {h.reportUrl ? (
                              <a 
                                href={h.reportUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-green-600 hover:underline font-semibold"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">No Report</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{h.admissionNo}</td>
                          <td className="px-4 py-3 text-green-600 font-semibold">{h.adviceNo}</td>
                          <td className="px-4 py-3 text-gray-700">{h.patientName}</td>
                          <td className="px-4 py-3 text-gray-700">{h.phone}</td>
                          <td className="px-4 py-3 text-gray-700">{h.reason}</td>
                          <td className="px-4 py-3 text-gray-700">{h.age}</td>
                          <td className="px-4 py-3 text-gray-700">{h.bedNo || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{h.location || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{h.wardType || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700">{h.room || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              h.priority === 'High' ? 'bg-red-100 text-red-700' : 
                              h.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              {h.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{h.category}</td>
                          <td className="px-4 py-3 text-gray-700 text-xs">{(h.tests || []).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mb-4 text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No history available</p>
                  <p className="text-gray-500 text-sm">Lab advice history will appear here once tests are completed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lab Advice Modal */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lab Advice Form</h2>
              <button
                onClick={() => setShowLabModal(false)}
                className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Patient Information */}
              <div className="p-4 mb-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div>
                    <span className="text-gray-600">Admission No:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.ipd}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.phone}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.age}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.gender}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <div className="font-medium text-gray-900">{data.admissionInfo.reasonForAdmission}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bed No.:</span>
                    <div className="font-medium text-gray-900">{storedRecord?.bedNo || storedRecord?.bed || data.admissionInfo?.bedNo || data.admissionInfo?.bed || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium text-gray-900">{storedRecord?.location || storedRecord?.bedLocation || data.admissionInfo?.location || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ward Type:</span>
                    <div className="font-medium text-gray-900">{storedRecord?.ward || storedRecord?.wardType || data.admissionInfo?.wardType || data.admissionInfo?.ward || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <div className="font-medium text-gray-900">{storedRecord?.room || data.admissionInfo?.room || '-'}</div>
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
                      value={labFormData.priority}
                      onChange={handleLabInputChange}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      value={labFormData.category}
                      onChange={handleLabInputChange}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Pathology">Pathology</option>
                      <option value="Radiology">Radiology</option>
                    </select>
                  </div>
                </div>

                {/* Pathology Tests */}
                {labFormData.category === 'Pathology' && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Pathology Tests * ({labFormData.pathologyTests.length} selected)
                    </label>
                    <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 rounded-lg border border-gray-300">
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {pathologyTests.map((test) => (
                          <label key={test} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={labFormData.pathologyTests.includes(test)}
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
                {labFormData.category === 'Radiology' && (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Radiology Type *</label>
                      <select
                        name="radiologyType"
                        value={labFormData.radiologyType}
                        onChange={handleLabInputChange}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Type</option>
                        <option value="X-ray">X-ray</option>
                        <option value="CT-scan">CT Scan</option>
                        <option value="USG">USG</option>
                      </select>
                    </div>

                    {labFormData.radiologyType && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Select {labFormData.radiologyType} Tests * ({labFormData.radiologyTests.length} selected)
                        </label>
                        <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 rounded-lg border border-gray-300">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {getRadiologyTests().map((test) => (
                              <label key={test} className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={labFormData.radiologyTests.includes(test)}
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
                    value={labFormData.remarks}
                    onChange={handleLabInputChange}
                    rows="3"
                    placeholder="Add any additional notes or instructions..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="px-6 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLabSubmit}
                  className="px-6 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                >
                  Submit Lab Advice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Slip Modal (shown after submit) */}
      {showPaymentSlip && paymentData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payment Slip</h3>
              <button onClick={() => setShowPaymentSlip(false)} className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Close</button>
            </div>

            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between"><span className="font-medium">Unique No.</span><span>{paymentData.uniqueNumber}</span></div>
              <div className="flex justify-between"><span className="font-medium">Advice No</span><span>{paymentData.adviceNo}</span></div>
              <div className="flex justify-between"><span className="font-medium">Patient</span><span>{paymentData.patientName}</span></div>
              <div className="flex justify-between"><span className="font-medium">Phone</span><span>{paymentData.phone}</span></div>
              <div className="flex justify-between"><span className="font-medium">Reason</span><span>{paymentData.reason}</span></div>
              <div className="flex justify-between"><span className="font-medium">Age</span><span>{paymentData.age}</span></div>
              <div className="flex justify-between"><span className="font-medium">Bed No.</span><span>{paymentData.bedNo}</span></div>
              <div className="flex justify-between"><span className="font-medium">Location</span><span>{paymentData.location}</span></div>
              <div className="flex justify-between"><span className="font-medium">Ward Type</span><span>{paymentData.wardType}</span></div>
              <div className="flex justify-between"><span className="font-medium">Room</span><span>{paymentData.room}</span></div>
              <div className="flex justify-between"><span className="font-medium">Priority</span><span>{paymentData.priority}</span></div>
              <div className="flex justify-between"><span className="font-medium">Category</span><span>{paymentData.category}</span></div>
              <div className="flex justify-between"><span className="font-medium">Tests</span><span>{(paymentData.tests || []).join(', ')}</span></div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handlePaymentConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Confirm & Save
              </button>
              <button onClick={() => setShowPaymentSlip(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}