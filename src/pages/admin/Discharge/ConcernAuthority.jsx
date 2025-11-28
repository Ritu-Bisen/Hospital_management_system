import React, { useState, useEffect } from 'react';
import { Building2, X, Clock, CheckCircle, Image } from 'lucide-react';

const ConcernAuthority = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRecords, setPendingRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [workFileStatus, setWorkFileStatus] = useState({}); // New: Yes/No for Authority
  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Load data every second (same as your other pages)
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

      // Pending: Records where Concern Department is completed but Authority is NOT
      const pending = rmoInitiations.filter(
        (r) => r.concernDepartmentCompleted && !r.concernAuthorityCompleted
      );

      // History: Records where Authority has already approved
      const history = rmoInitiations.filter((r) => r.concernAuthorityCompleted);

      setPendingRecords(pending);
      setHistoryRecords(history);
    } catch (error) {
      console.error('Error loading data for Concern Authority:', error);
    }
  };

  const handleCheckboxChange = (admissionNo) => {
    setSelectedRecords((prev) => ({
      ...prev,
      [admissionNo]: !prev[admissionNo],
    }));
  };

  const handleWorkFileChange = (admissionNo, value) => {
    setWorkFileStatus((prev) => ({
      ...prev,
      [admissionNo]: value,
    }));
  };

  const handleSubmit = () => {
    const selectedAdmissions = Object.keys(selectedRecords).filter(
      (key) => selectedRecords[key]
    );

    if (selectedAdmissions.length === 0) {
      setSubmitError('Please select at least one record');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    const missingWorkFile = selectedAdmissions.filter(
      (admNo) => !workFileStatus[admNo]
    );
    if (missingWorkFile.length > 0) {
      setSubmitError('Please select Work File status (Yes/No) for all selected records');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    try {
      const stored = localStorage.getItem('rmoInitiations');
      const data = stored ? JSON.parse(stored) : [];

      const updatedData = data.map((record) => {
        if (selectedAdmissions.includes(record.admissionNo)) {
          return {
            ...record,
            concernAuthorityWorkFile: workFileStatus[record.admissionNo], // Yes or No
            concernAuthorityCompleted: true,
            concernAuthorityCompletionDate: new Date().toLocaleDateString('en-GB'),
            concernAuthorityCompletionTime: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            concernAuthorityTimestamp: new Date().toISOString(),
          };
        }
        return record;
      });

      localStorage.setItem('rmoInitiations', JSON.stringify(updatedData));

      // Reset form
      setSelectedRecords({});
      setWorkFileStatus({});
      setSubmitError('');
      loadData();
    } catch (error) {
      console.error('Error saving Concern Authority data:', error);
      setSubmitError('Failed to save. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    }
  };

  const openImageViewer = (imageData) => {
    setViewingImage(imageData);
    setViewImageModal(true);
  };

  const isAnySelected = Object.values(selectedRecords).some((v) => v);

  return (
    <div className="p-3 space-y-4 md:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Concern Authority
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Final approval for work file after Concern Department review
          </p>
        </div>
      </div>

      {/* Tabs & Submit Button */}
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

        {activeTab === 'pending' && (
          <button
            onClick={handleSubmit}
            disabled={!isAnySelected}
            className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg shadow-sm font-medium transition-all mb-[-2px] ${
              isAnySelected
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Building2 className="w-5 h-5" />
            Submit
          </button>
        )}
      </div>

      {/* === PENDING SECTION === */}
      {activeTab === 'pending' && (
        <div>
          {submitError && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Work File</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Admission No</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Consultant</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Staff Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Discharge Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Summary Report</th>
                  <th className="px-4 py-3 text-xs font-medium text-left uppercase">Concern Dept</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRecords.length > 0 ? (
                  pendingRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-green-50 ${selectedRecords[record.admissionNo] ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedRecords[record.admissionNo] || false}
                          onChange={() => handleCheckboxChange(record.admissionNo)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={workFileStatus[record.admissionNo] || ''}
                          onChange={(e) => handleWorkFileChange(record.admissionNo, e.target.value)}
                          className="px-2 py-1 text-sm border rounded bg-white focus:ring-2 focus:ring-green-500"
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.concernDepartment === 'Yes'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.concernDepartment}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-4 py-12 text-center text-gray-500">
                      <Clock className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No pending approvals</p>
                      <p>Records will appear here after Concern Department review</p>
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
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border shadow-sm ${
                    selectedRecords[record.admissionNo]
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRecords[record.admissionNo] || false}
                        onChange={() => handleCheckboxChange(record.admissionNo)}
                        className="mt-1 w-4 h-4 text-green-600 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-green-600">{record.admissionNo}</div>
                        <div className="font-semibold">{record.patientName}</div>
                      </div>
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
                    <div><span className="text-gray-600">Concern Dept:</span>{' '}
                      <span className={record.concernDepartment === 'Yes' ? 'text-green-700' : 'text-red-700'}>
                        {record.concernDepartment}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <label className="text-xs font-medium">Work File (Authority):</label>
                    <select
                      value={workFileStatus[record.admissionNo] || ''}
                      onChange={(e) => handleWorkFileChange(record.admissionNo, e.target.value)}
                      className="px-2 py-1 text-xs border rounded text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

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
                <p className="font-medium">No pending approvals</p>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="py-12 text-center text-gray-500">
                      <CheckCircle className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                      <p>No completed approvals yet</p>
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
                  <div>Concern Dept: <strong className={record.concernDepartment === 'Yes' ? 'text-green-700' : 'text-red-700'}>{record.concernDepartment}</strong></div>
                  <div>Authority: <strong className={record.concernAuthorityWorkFile === 'Yes' ? 'text-green-700' : 'text-red-700'}>{record.concernAuthorityWorkFile}</strong></div>
                </div>
                {record.summaryReportImage && (
                  <div className="mt-3 text-right">
                    <button onClick={() => openImageViewer(record.summaryReportImage)} className="text-xs text-green-600 underline">
                      View Summary →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {viewImageModal && viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Summary Report Image</h3>
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
              <img src={viewingImage} alt="Summary" className="w-full rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcernAuthority;