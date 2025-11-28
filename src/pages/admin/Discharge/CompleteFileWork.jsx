import React, { useState, useEffect } from 'react';
import { FileCheck, X, Clock, CheckCircle, Image } from 'lucide-react';

const CompleteFileWork = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRecords, setPendingRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [workFileStatus, setWorkFileStatus] = useState({});
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      const storedRMOInitiations = localStorage.getItem('rmoInitiations');
      
      if (storedRMOInitiations) {
        const rmoInitiations = JSON.parse(storedRMOInitiations);
        
        const pending = rmoInitiations.filter(r => !r.fileWorkCompleted);
        const history = rmoInitiations.filter(r => r.fileWorkCompleted);
        
        setPendingRecords(pending);
        setHistoryRecords(history);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handleCheckboxChange = (admissionNo) => {
    setSelectedRecords(prev => ({
      ...prev,
      [admissionNo]: !prev[admissionNo]
    }));
  };

  const handleWorkFileChange = (admissionNo, value) => {
    setWorkFileStatus(prev => ({
      ...prev,
      [admissionNo]: value
    }));
  };

  const handleSubmit = () => {
    const selectedAdmissions = Object.keys(selectedRecords).filter(key => selectedRecords[key]);
    
    if (selectedAdmissions.length === 0) {
      setSubmitError('Please select at least one record');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    // Check if all selected records have work file status
    const missingWorkFile = selectedAdmissions.filter(admNo => !workFileStatus[admNo]);
    if (missingWorkFile.length > 0) {
      setSubmitError('Please select Work File status for all selected records');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    try {
      const storedRMOInitiations = localStorage.getItem('rmoInitiations');
      const rmoInitiations = storedRMOInitiations ? JSON.parse(storedRMOInitiations) : [];
      
      // Update the records in rmoInitiations with file work data
      const updatedRMOInitiations = rmoInitiations.map(record => {
        if (selectedAdmissions.includes(record.admissionNo)) {
          return {
            ...record,
            workFile: workFileStatus[record.admissionNo],
            fileWorkCompleted: true,
            fileWorkCompletionDate: new Date().toLocaleDateString('en-GB'),
            fileWorkCompletionTime: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            fileWorkTimestamp: new Date().toISOString()
          };
        }
        return record;
      });

      localStorage.setItem('rmoInitiations', JSON.stringify(updatedRMOInitiations));
      
      setSelectedRecords({});
      setWorkFileStatus({});
      setSubmitError('');
      loadData();
    } catch (error) {
      console.error('Error saving file work:', error);
      setSubmitError('Failed to save. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    }
  };

  const openImageViewer = (imageData) => {
    setViewingImage(imageData);
    setViewImageModal(true);
  };

  const isAnyRecordSelected = Object.values(selectedRecords).some(val => val);

  return (
    <div className="p-3 space-y-4 md:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Complete File Work
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage file work completion for RMO initiated patients
          </p>
        </div>
      </div>

      {/* Tabs and Submit Button Row */}
      <div className="flex justify-between items-center border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'pending'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {pendingRecords.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {pendingRecords.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'history'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              History
              {historyRecords.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                  {historyRecords.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Submit Button - In line with tabs */}
        {activeTab === 'pending' && (
          <button
            onClick={handleSubmit}
            disabled={!isAnyRecordSelected}
            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg shadow-sm font-medium transition-all mb-[-2px] ${
              isAnyRecordSelected
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            Submit
          </button>
        )}
      </div>

      {/* Pending Section */}
      {activeTab === 'pending' && (
        <div>
          {submitError && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Work File</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Admission No</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Consultant</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Staff Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Discharge Date</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Summary Report</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRecords.length > 0 ? (
                  pendingRecords.map((record) => (
                    <tr key={record.id} className={`hover:bg-green-50 ${selectedRecords[record.admissionNo] ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRecords[record.admissionNo] || false}
                          onChange={() => handleCheckboxChange(record.admissionNo)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <select
                          value={workFileStatus[record.admissionNo] || ''}
                          onChange={(e) => handleWorkFileChange(record.admissionNo, e.target.value)}
                          className="px-2 py-1 text-sm bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {record.admissionNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {record.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.consultantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.staffName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.dischargeDate}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.rmoName}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {record.summaryReportImage ? (
                          <button
                            onClick={() => openImageViewer(record.summaryReportImage)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                          >
                            <Image className="w-3 h-3" />
                            View Image
                          </button>
                        ) : (
                          <span className="text-gray-500">No image</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                      <Clock className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No pending records</p>
                      <p className="text-sm">All RMO initiated patients have been processed</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {pendingRecords.length > 0 ? (
              pendingRecords.map((record) => (
                <div key={record.id} className={`p-4 bg-white rounded-lg border shadow-sm ${selectedRecords[record.admissionNo] ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRecords[record.admissionNo] || false}
                        onChange={() => handleCheckboxChange(record.admissionNo)}
                        className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <div className="text-xs font-medium text-green-600 mb-1">
                          {record.admissionNo}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {record.patientName}
                        </h3>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-900">{record.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultant:</span>
                      <span className="font-medium text-gray-900">{record.consultantName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Name:</span>
                      <span className="font-medium text-gray-900">{record.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discharge Date:</span>
                      <span className="font-medium text-gray-900">{record.dischargeDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMO Name:</span>
                      <span className="font-medium text-gray-900">{record.rmoName}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">Work File:</label>
                      <select
                        value={workFileStatus[record.admissionNo] || ''}
                        onChange={(e) => handleWorkFileChange(record.admissionNo, e.target.value)}
                        className="px-2 py-1 text-xs bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Summary Report:</span>
                      {record.summaryReportImage ? (
                        <button
                          onClick={() => openImageViewer(record.summaryReportImage)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                        >
                          <Image className="w-3 h-3" />
                          View Image
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">No image</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <Clock className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No pending records</p>
                <p className="text-xs text-gray-600">All RMO initiated patients have been processed</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      {activeTab === 'history' && (
        <div>
          {/* Desktop Table */}
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
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Summary Report</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Work File</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyRecords.length > 0 ? (
                  historyRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {record.admissionNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {record.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.consultantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.staffName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.dischargeDate}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.rmoName}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {record.summaryReportImage ? (
                          <button
                            onClick={() => openImageViewer(record.summaryReportImage)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                          >
                            <Image className="w-3 h-3" />
                            View Image
                          </button>
                        ) : (
                          <span className="text-gray-500">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.workFile === 'Yes' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.workFile}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      <CheckCircle className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No history records</p>
                      <p className="text-sm">Completed file work will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {historyRecords.length > 0 ? (
              historyRecords.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">
                        {record.admissionNo}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {record.patientName}
                      </h3>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-900">{record.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultant:</span>
                      <span className="font-medium text-gray-900">{record.consultantName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Name:</span>
                      <span className="font-medium text-gray-900">{record.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discharge Date:</span>
                      <span className="font-medium text-gray-900">{record.dischargeDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMO Name:</span>
                      <span className="font-medium text-gray-900">{record.rmoName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Work File:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.workFile === 'Yes' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.workFile}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Summary Report:</span>
                      {record.summaryReportImage ? (
                        <button
                          onClick={() => openImageViewer(record.summaryReportImage)}
                          className="flex items-center gap-1 mt-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                        >
                          <Image className="w-3 h-3" />
                          View Image
                        </button>
                      ) : (
                        <p className="mt-1 text-gray-500">No image</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <CheckCircle className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No history records</p>
                <p className="text-xs text-gray-600">Completed file work will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImageModal && viewingImage && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Summary Report</h3>
              <button
                onClick={() => {
                  setViewImageModal(false);
                  setViewingImage(null);
                }}
                className="text-gray-500 rounded-full p-1 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={viewingImage}
                alt="Summary Report"
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteFileWork;