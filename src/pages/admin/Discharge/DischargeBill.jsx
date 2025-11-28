import React, { useState, useEffect } from 'react';
import { FileText, X, Clock, CheckCircle, Image, Upload } from 'lucide-react';

const DischargeBill = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRecords, setPendingRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [billStatus, setBillStatus] = useState('');
  const [billImage, setBillImage] = useState(null);
  const [billImagePreview, setBillImagePreview] = useState('');
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Load data every second
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
      if (!storedRMOInitiations) return;

      const rmoInitiations = JSON.parse(storedRMOInitiations);

      // Pending: Records where Concern Authority is completed but Bill is NOT
      const pending = rmoInitiations.filter(
        (r) => r.concernAuthorityCompleted && !r.dischargeBillCompleted
      );

      // History: Records where Bill has been completed
      const history = rmoInitiations.filter((r) => r.dischargeBillCompleted);

      setPendingRecords(pending);
      setHistoryRecords(history);
    } catch (error) {
      console.error('Error loading data for Discharge Bill:', error);
    }
  };

  const handleOpenBillModal = (record) => {
    setSelectedRecord(record);
    setBillStatus('');
    setBillImage(null);
    setBillImagePreview('');
    setSubmitError('');
    setShowBillModal(true);
  };

  const handleCloseBillModal = () => {
    setShowBillModal(false);
    setSelectedRecord(null);
    setBillStatus('');
    setBillImage(null);
    setBillImagePreview('');
    setSubmitError('');
  };

  const handleBillImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image size should be less than 5MB');
        setTimeout(() => setSubmitError(''), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result);
        setBillImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBill = () => {
    if (!billStatus) {
      setSubmitError('Please select Bill Status');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    if (!billImage) {
      setSubmitError('Please upload Bill Image');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    try {
      const stored = localStorage.getItem('rmoInitiations');
      const data = stored ? JSON.parse(stored) : [];

      const updatedData = data.map((record) => {
        if (record.admissionNo === selectedRecord.admissionNo) {
          return {
            ...record,
            billStatus: billStatus,
            billImage: billImage,
            dischargeBillCompleted: true,
            dischargeBillCompletionDate: new Date().toLocaleDateString('en-GB'),
            dischargeBillCompletionTime: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            dischargeBillTimestamp: new Date().toISOString(),
          };
        }
        return record;
      });

      localStorage.setItem('rmoInitiations', JSON.stringify(updatedData));
      handleCloseBillModal();
      loadData();
    } catch (error) {
      console.error('Error saving Discharge Bill data:', error);
      setSubmitError('Failed to save. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    }
  };

  const openImageViewer = (imageData) => {
    setViewingImage(imageData);
    setViewImageModal(true);
  };

  return (
    <div className="p-3 space-y-4 md:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Discharge Bill
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Process discharge bills after authority approval
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
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

      {/* === PENDING SECTION === */}
      {activeTab === 'pending' && (
        <div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Admission No</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Consultant</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Staff Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Discharge Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Summary Report</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Work File</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Concern Dept</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Authority</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRecords.length > 0 ? (
                  pendingRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleOpenBillModal(record)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Add Bill
                        </button>
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
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {record.rmoName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.summaryReportImage ? (
                          <button
                            onClick={() => openImageViewer(record.summaryReportImage)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                          >
                            <Image className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-gray-500">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.workFile === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.workFile || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.concernDepartment === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.concernDepartment}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.concernAuthorityWorkFile === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.concernAuthorityWorkFile || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-4 py-12 text-center text-gray-500">
                      <Clock className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No pending bills</p>
                      <p>Records will appear here after authority approval</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Pending */}
          <div className="space-y-3 md:hidden">
            {pendingRecords.length > 0 ? (
              pendingRecords.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium text-green-600">{record.admissionNo}</div>
                      <div className="font-semibold">{record.patientName}</div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs my-3">
                    <div><span className="text-gray-600">Dept:</span> <strong>{record.department}</strong></div>
                    <div><span className="text-gray-600">Consultant:</span> {record.consultantName || 'N/A'}</div>
                    <div><span className="text-gray-600">Staff:</span> {record.staffName}</div>
                    <div><span className="text-gray-600">Discharge:</span> {record.dischargeDate}</div>
                    <div><span className="text-gray-600">RMO:</span> {record.rmoName}</div>
                    <div><span className="text-gray-600">Authority:</span>{' '}
                      <span className={record.concernAuthorityWorkFile === 'Yes' ? 'text-green-700' : 'text-red-700'}>
                        {record.concernAuthorityWorkFile}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBillModal(record)}
                    className="w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Add Bill Information
                  </button>

                  {record.summaryReportImage && (
                    <div className="mt-3 text-right">
                      <button
                        onClick={() => openImageViewer(record.summaryReportImage)}
                        className="text-xs text-green-600 underline"
                      >
                        View Summary Report →
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border">
                <Clock className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                <p className="font-medium">No pending bills</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === HISTORY SECTION === */}
      {activeTab === 'history' && (
        <div>
          {/* Desktop History Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Admission No</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Consultant</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Staff Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Discharge Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Summary Report</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Work File</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Concern Dept</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Authority</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Bill Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Bill Image</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyRecords.length > 0 ? (
                  historyRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{record.admissionNo}</td>
                      <td className="px-4 py-3 text-sm">{record.patientName}</td>
                      <td className="px-4 py-3 text-sm">{record.department}</td>
                      <td className="px-4 py-3 text-sm">{record.consultantName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{record.staffName}</td>
                      <td className="px-4 py-3 text-sm">{record.dischargeDate}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{record.rmoName}</td>
                      <td className="px-4 py-3 text-sm">
                        {record.summaryReportImage ? (
                          <button
                            onClick={() => openImageViewer(record.summaryReportImage)}
                            className="flex items-center gap-1 text-xs text-green-600"
                          >
                            <Image className="w-4 h-4" /> View
                          </button>
                        ) : 'No image'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.workFile === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.workFile || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.concernDepartment === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.concernDepartment}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.concernAuthorityWorkFile === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.concernAuthorityWorkFile || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.billStatus === 'Yes'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.billStatus || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.billImage ? (
                          <button
                            onClick={() => openImageViewer(record.billImage)}
                            className="flex items-center gap-1 text-xs text-green-600"
                          >
                            <Image className="w-4 h-4" /> View
                          </button>
                        ) : 'No image'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="py-12 text-center text-gray-500">
                      <CheckCircle className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                      <p>No completed bills yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile History Cards */}
          <div className="space-y-3 md:hidden">
            {historyRecords.map((record) => (
              <div key={record.id} className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-600">{record.admissionNo}</div>
                    <div className="font-semibold">{record.patientName}</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    {record.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>Dept: <strong>{record.department}</strong></div>
                  <div>Consultant: {record.consultantName || 'N/A'}</div>
                  <div>Staff: {record.staffName}</div>
                  <div>Discharge: {record.dischargeDate}</div>
                  <div>Authority: <strong className={record.concernAuthorityWorkFile === 'Yes' ? 'text-green-700' : 'text-red-700'}>{record.concernAuthorityWorkFile}</strong></div>
                  <div>Bill Status: <strong className={record.billStatus === 'Yes' ? 'text-green-700' : 'text-red-700'}>{record.billStatus}</strong></div>
                </div>
                {record.billImage && (
                  <div className="mt-3 text-right">
                    <button onClick={() => openImageViewer(record.billImage)} className="text-xs text-green-600 underline">
                      View Bill Image →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill Entry Modal */}
      {showBillModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-900">Add Discharge Bill</h3>
              <button
                onClick={handleCloseBillModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                  {submitError}
                </div>
              )}

              {/* Pre-filled Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission No
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.admissionNo}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.patientName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.department}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultant
                  </label>
                  <input
                    type="text"
                    value={selectedRecord.consultantName || 'N/A'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Bill Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={billStatus}
                  onChange={(e) => setBillStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Bill Status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Bill Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {billImagePreview ? (
                      <div className="relative">
                        <img
                          src={billImagePreview}
                          alt="Bill Preview"
                          className="mx-auto h-48 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setBillImage(null);
                            setBillImagePreview('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBillImageUpload}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseBillModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBill}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Submit Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImageModal && viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Image Viewer</h3>
              <button
                onClick={() => {
                  setViewImageModal(false);
                  setViewingImage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              <img src={viewingImage} alt="Document" className="w-full rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeBill;