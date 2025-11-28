import React, { useState, useEffect } from 'react';
import { Eye, FileText, X, Download, CheckCircle } from 'lucide-react';

const StoreMedicinePage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [viewModal, setViewModal] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [pendingIndents, setPendingIndents] = useState([]);
  const [historyIndents, setHistoryIndents] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const savedHistory = localStorage.getItem('pharmacyApprovalHistory');
      const approvalHistory = savedHistory ? JSON.parse(savedHistory) : [];

      const savedStoreHistory = localStorage.getItem('storeHistory');
      const storeHistory = savedStoreHistory ? JSON.parse(savedStoreHistory) : [];

      // Filter only approved medicine indents from pharmacy approval
      const medicineIndents = approvalHistory.filter(indent => 
        indent.status === 'Approved' && 
        indent.requestTypes.medicineSlip &&
        indent.medicines?.length > 0
      );

      // Get IDs of indents already confirmed in store
      const confirmedIds = storeHistory.map(h => h.indentNumber);

      // Pending: approved medicine indents not yet confirmed
      const pending = medicineIndents.filter(indent => 
        !confirmedIds.includes(indent.indentNumber)
      );

      setPendingIndents(pending);
      setHistoryIndents(storeHistory);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleView = (indent) => {
    setSelectedIndent(indent);
    setViewModal(true);
  };

  const handleViewSlip = (indent) => {
    setSelectedIndent(indent);
    setSlipModal(true);
  };

  const downloadSlip = (indent) => {
    const link = document.createElement('a');
    link.download = `Medicine_Slip_${indent.indentNumber}.png`;
    link.href = indent.slipImage;
    link.click();
  };

  const handleConfirm = (indent) => {
    const confirmed = window.confirm(
      `Confirm medicine dispensing for Indent ${indent.indentNumber}?`
    );

    if (confirmed) {
      const confirmedIndent = {
        ...indent,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'Store'
      };

      // Add to store history
      const updatedHistory = [confirmedIndent, ...historyIndents];
      setHistoryIndents(updatedHistory);
      localStorage.setItem('storeHistory', JSON.stringify(updatedHistory));

      // Remove from pending
      const updatedPending = pendingIndents.filter(
        p => p.indentNumber !== indent.indentNumber
      );
      setPendingIndents(updatedPending);

      alert(`Indent ${indent.indentNumber} confirmed successfully!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Store - Medicine Management</h1>
          <p className="text-gray-600 mt-1">Manage and dispense approved medicine requests</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending ({pendingIndents.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                History ({historyIndents.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Pending Table */}
        {activeTab === 'pending' && (
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Medicines Count</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingIndents.length > 0 ? (
                    pendingIndents.map((indent) => (
                      <tr key={indent.indentNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-green-700">{indent.indentNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.admissionNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.patientName}</td>
                        <td className="px-6 py-4 text-sm">{indent.uhidNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.staffName}</td>
                        <td className="px-6 py-4 text-sm">{indent.diagnosis}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {indent.medicines?.length || 0} Items
                          </span>
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
                            {indent.slipImage && (
                              <button
                                onClick={() => handleViewSlip(indent)}
                                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                title="View Slip"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleConfirm(indent)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                              title="Confirm Dispensing"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Confirm</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No pending medicine requests</p>
                        <p className="text-gray-400 text-sm mt-1">Approved medicine indents will appear here</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History Table */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className=" bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Indent No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Admission No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Patient Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">UHID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Staff Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Diagnosis</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Medicines Count</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Confirmed At</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historyIndents.length > 0 ? (
                    historyIndents.map((indent) => (
                      <tr key={indent.indentNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-green-700">{indent.indentNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.admissionNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.patientName}</td>
                        <td className="px-6 py-4 text-sm">{indent.uhidNumber}</td>
                        <td className="px-6 py-4 text-sm">{indent.staffName}</td>
                        <td className="px-6 py-4 text-sm">{indent.diagnosis}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {indent.medicines?.length || 0} Items
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(indent.confirmedAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                            {indent.slipImage && (
                              <button
                                onClick={() => handleViewSlip(indent)}
                                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                title="View Slip"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No confirmed medicines yet</p>
                        <p className="text-gray-400 text-sm mt-1">Confirmed medicine dispensing will appear here</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Medicine Details - {selectedIndent.indentNumber}</h2>
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

              {/* Medicines List */}
              {selectedIndent.medicines && selectedIndent.medicines.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medicines to Dispense</h3>
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
                          <tr key={medicine.id || index}>
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium">{medicine.name}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {medicine.quantity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Status</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Pharmacy Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Approved
                    </span>
                    {selectedIndent.approvedAt && (
                      <span className="text-sm text-gray-500">
                        on {new Date(selectedIndent.approvedAt).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>
                  {selectedIndent.confirmedAt && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Store Confirmed:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Dispensed
                      </span>
                      <span className="text-sm text-gray-500">
                        on {new Date(selectedIndent.confirmedAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                {!selectedIndent.confirmedAt && (
                  <button
                    onClick={() => {
                      setViewModal(false);
                      handleConfirm(selectedIndent);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Dispensing
                  </button>
                )}
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

      {/* Slip View Modal */}
      {slipModal && selectedIndent && selectedIndent.slipImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Medicine Slip - {selectedIndent.indentNumber}</h2>
              <button
                onClick={() => {
                  setSlipModal(false);
                  setSelectedIndent(null);
                }}
                className="text-white hover:bg-purple-700 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <img 
                  src={selectedIndent.slipImage} 
                  alt="Medicine Slip" 
                  className="w-full rounded border border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => downloadSlip(selectedIndent)}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Slip
                </button>
                <button
                  onClick={() => {
                    setSlipModal(false);
                    setSelectedIndent(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
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

export default StoreMedicinePage;