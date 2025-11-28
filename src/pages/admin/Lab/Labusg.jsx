import React, { useState, useEffect } from 'react';
import { X, Eye, FileText, Upload, Check } from 'lucide-react';

const USG = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRecords, setPendingRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [modalError, setModalError] = useState('');
  const [reportPreview, setReportPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    reportImage: null,
    remarks: ''
  });

  useEffect(() => {
    loadData();
    
    const handleFocus = () => {
      console.log('USG page focused - reloading data');
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    const intervalId = setInterval(() => {
      loadData();
    }, 2000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  const loadData = () => {
    try {
      const storedHistory = localStorage.getItem('usgHistory');
      const paymentHistory = localStorage.getItem('paymentHistory');
      
      const existingHistory = storedHistory ? JSON.parse(storedHistory) : [];
      setHistoryRecords(existingHistory);

      if (paymentHistory) {
        const paymentRecords = JSON.parse(paymentHistory);
        
        const processedIds = existingHistory.map(record => record.usgId || record.paymentId || record.adviceId);
        
        console.log('=== USG Page Debug ===');
        console.log('Payment History Records:', paymentRecords.length);
        console.log('Processed USG IDs:', processedIds);
        
        const newPending = paymentRecords
          .filter(record => {
            const radiologyTypeLower = record.radiologyType?.toLowerCase().replace(/[-\s]/g, '');
            const isUSG = record.category === 'Radiology' && radiologyTypeLower === 'usg';
            const notProcessed = !processedIds.includes(record.paymentId || record.adviceId);
            
            console.log('Record:', record.uniqueNumber, 
                       'Category:', record.category, 
                       'Type:', record.radiologyType,
                       'Is USG:', isUSG, 
                       'Not Processed:', notProcessed);
            
            return isUSG && notProcessed;
          })
          .map(record => ({
            ...record,
            usgId: record.paymentId || record.adviceId || Date.now() + Math.random()
          }));
        
        console.log('New Pending USG Records:', newPending.length);
        
        setPendingRecords(newPending);
        localStorage.setItem('usgPending', JSON.stringify(newPending));
      } else {
        setPendingRecords([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const saveToStorage = (pending, history) => {
    try {
      localStorage.setItem('usgPending', JSON.stringify(pending));
      localStorage.setItem('usgHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const handleActionClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setModalError('File size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          reportImage: reader.result
        }));
        setReportPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.reportImage) {
      setModalError('Please upload report image');
      return;
    }

    if (!formData.remarks.trim()) {
      setModalError('Please enter remarks');
      return;
    }

    const usgRecord = {
      ...selectedRecord,
      reportImage: formData.reportImage,
      remarks: formData.remarks,
      processedDate: new Date().toISOString()
    };

    const updatedHistory = [usgRecord, ...historyRecords];
    const updatedPending = pendingRecords.filter(p => p.usgId !== selectedRecord.usgId);

    setHistoryRecords(updatedHistory);
    setPendingRecords(updatedPending);
    saveToStorage(updatedPending, updatedHistory);

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      reportImage: null,
      remarks: ''
    });
    setReportPreview(null);
    setModalError('');
    setSelectedRecord(null);
  };

  const handleViewClick = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const handleViewImage = (imageData) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>USG Report</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
          <img src="${imageData}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
        </body>
      </html>
    `);
  };

  const totalRecords = [...pendingRecords, ...historyRecords].length;
  const completedRecords = historyRecords.length;
  const pendingCount = pendingRecords.length;
  const highPriorityCount = [...pendingRecords, ...historyRecords].filter(r => r.priority === 'High').length;

  return (
    <div className="p-3 space-y-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">USG Management</h1>
          <p className="mt-1 text-sm text-gray-600">Process USG reports and manage records</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Total USG Records</span>
            <span className="text-2xl font-bold text-green-600 mt-1">{totalRecords}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Completed</span>
            <span className="text-2xl font-bold text-green-600 mt-1">{completedRecords}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Pending</span>
            <span className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">High Priority</span>
            <span className="text-2xl font-bold text-red-600 mt-1">{highPriorityCount}</span>
          </div>
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
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          History ({completedRecords})
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
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Advice No</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone Number</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Reason For Visit</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Age</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Bed No.</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ward Type</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tests</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRecords.length > 0 ? (
                  pendingRecords.map((record) => (
                    <tr key={record.usgId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleActionClick(record)}
                          className="px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                        >
                          Process
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.uniqueNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.adviceNo || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.patientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{record.reasonForVisit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.age}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.bedNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.wardType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.room}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.priority === 'High' ? 'bg-red-100 text-red-700' :
                          record.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.radiologyType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {record.radiologyTests?.slice(0, 2).join(', ') + (record.radiologyTests?.length > 2 ? '...' : '')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="px-4 py-8 text-center text-gray-500">
                      <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No pending USG records</p>
                      <p className="text-sm text-gray-500 mt-1">USG records from payment history will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {pendingRecords.length > 0 ? (
              pendingRecords.map((record) => (
                <div key={record.usgId} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">{record.uniqueNumber}</div>
                      <div className="text-xs font-medium text-green-600 mb-1">{record.adviceNo || 'N/A'}</div>
                      <h3 className="text-sm font-semibold text-gray-900">{record.patientName}</h3>
                    </div>
                    <button
                      onClick={() => handleActionClick(record)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs text-white bg-green-600 rounded-lg shadow-sm"
                    >
                      Process
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{record.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium text-gray-900">{record.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed/Room:</span>
                      <span className="font-medium text-gray-900">{record.bedNo} / {record.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.priority === 'High' ? 'bg-red-100 text-red-700' :
                        record.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No pending USG records</p>
                <p className="text-xs text-gray-500 mt-1">USG records from payment history will appear here</p>
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
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tests</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Report</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyRecords.length > 0 ? (
                  historyRecords.map((record) => (
                    <tr key={record.usgId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.uniqueNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">{record.adviceNo || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.patientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.phoneNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{record.reasonForVisit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.age}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.bedNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.wardType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.room}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.priority === 'High' ? 'bg-red-100 text-red-700' :
                          record.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.radiologyType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {record.radiologyTests?.join(', ')}
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
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{record.remarks}</td>
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
            {historyRecords.length > 0 ? (
              historyRecords.map((record) => (
                <div key={record.usgId} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">{record.uniqueNumber}</div>
                      <div className="text-xs font-medium text-green-600 mb-1">{record.adviceNo || 'N/A'}</div>
                      <h3 className="text-sm font-semibold text-gray-900">{record.patientName}</h3>
                    </div>
                    <button
                      onClick={() => handleViewClick(record)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs text-green-600 bg-green-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{record.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium text-gray-900">{record.age}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Remarks:</span>
                      <div className="font-medium text-gray-900 mt-1 line-clamp-2">{record.remarks}</div>
                    </div>
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

      {/* Process Modal */}
      {showModal && selectedRecord && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Process USG Report</h2>
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
              {/* Pre-filled Patient Info */}
              <div className="p-4 mb-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-gray-600">Unique No:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.uniqueNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Advice No:</span>
                    <div className="font-medium text-green-600">{selectedRecord.adviceNo || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.patientName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.phoneNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.age}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bed No:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.bedNo}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ward Type:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.wardType}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.room}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.radiologyType}</div>
                  </div>
                </div>
              </div>

              {/* Report Form */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Upload Report *</label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReportChange}
                      className="hidden"
                      id="report-upload"
                    />
                    <label
                      htmlFor="report-upload"
                      className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      {reportPreview ? (
                        <div className="text-center">
                          <img
                            src={reportPreview}
                            alt="Report preview"
                            className="max-h-40 mb-2 rounded"
                          />
                          <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            Report uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to change image</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload USG report</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Remarks *</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Enter remarks about the USG report..."
                    className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingRecord && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">USG Report Details</h2>
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
                    <div className="font-medium text-green-600">{viewingRecord.adviceNo || 'N/A'}</div>
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

              {/* USG Details */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">USG Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
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
                    <span className="text-gray-600">Radiology Type:</span>
                    <div className="font-medium text-gray-900 mt-1">{viewingRecord.radiologyType}</div>
                  </div>

                  {viewingRecord.radiologyTests?.length > 0 && (
                    <div>
                      <span className="text-gray-600">Tests ({viewingRecord.radiologyTests.length}):</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {viewingRecord.radiologyTests.map((test, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-indigo-300">
                    <span className="text-gray-600">Remarks:</span>
                    <div className="font-medium text-gray-900 mt-1 whitespace-pre-wrap">{viewingRecord.remarks}</div>
                  </div>

                  <div>
                    <span className="text-gray-600">Processed Date:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {new Date(viewingRecord.processedDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Image */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">USG Report</h3>
                <div className="space-y-3">
                  <img
                    src={viewingRecord.reportImage}
                    alt="USG Report"
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => handleViewImage(viewingRecord.reportImage)}
                    className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Open in Full Screen
                  </button>
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

export default USG;