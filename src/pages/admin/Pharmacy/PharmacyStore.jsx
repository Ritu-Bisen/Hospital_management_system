import React, { useState, useEffect } from 'react';
import { Eye, FileText, X, Download, CheckCircle, Clock } from 'lucide-react';
import supabase from '../../../SupabaseClient';// Adjust the path to your supabase client

const StoreMedicinePage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [viewModal, setViewModal] = useState(false);
  const [slipModal, setSlipModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [pendingIndents, setPendingIndents] = useState([]);
  const [historyIndents, setHistoryIndents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data from pharmacy table where planned2 is not null
      const { data: pharmacyData, error } = await supabase
        .from('pharmacy')
        .select('*')
        .not('planned2', 'is', null)
     .neq('status', 'rejected')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (pharmacyData) {
        // Parse JSON strings in the data
        const parsedData = pharmacyData.map(item => ({
          ...item,
          request_types: item.request_types ? JSON.parse(item.request_types) : null,
          medicines: item.medicines ? JSON.parse(item.medicines) : [],
          investigations: item.investigations ? JSON.parse(item.investigations) : []
        }));

        // Separate into pending and history based on actual2
        const pending = parsedData.filter(indent => 
          indent.planned2 && !indent.actual2
        );
        
        const history = parsedData.filter(indent => 
          indent.planned2 && indent.actual2
        );

        setPendingIndents(pending);
        setHistoryIndents(history);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('pharmacy-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pharmacy'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    if (!indent.slip_image) return;
    
    const link = document.createElement('a');
    link.download = `Medicine_Slip_${indent.indent_no || indent.id}.png`;
    link.href = indent.slip_image;
    link.click();
  };

  const handleConfirm = async (indent) => {
    // const confirmed = window.confirm(
    //   `Confirm medicine dispensing for Indent ${indent.indent_no || indent.id}?`
    // );

    // if (!confirmed) return;

    try {
      // Update the pharmacy record with actual2 timestamp
      const { error } = await supabase
        .from('pharmacy')
        .update({
          actual2: new Date().toLocaleString("en-CA", { 
          timeZone: "Asia/Kolkata", 
          hour12: false 
        }).replace(',', ''),
          // status: 'dispensed'
        })
        .eq('id', indent.id);

      if (error) throw error;

      // Show success message
      // alert(`Indent ${indent.indent_no || indent.id} confirmed successfully!`);
      loadData()
      // The real-time subscription will automatically refresh the data
    } catch (error) {
      console.error('Error confirming indent:', error);
      alert('Error confirming indent. Please try again.');
    }
  };

  // Calculate delay for pending items
  const calculateDelay = (plannedDate) => {
    if (!plannedDate) return '';
    const planned = new Date(plannedDate);
    const now = new Date();
    const diffHours = Math.floor((now - planned) / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      return <span className="text-red-600 font-medium">{diffHours}h delay</span>;
    } else if (diffHours === 0) {
      const diffMinutes = Math.floor((now - planned) / (1000 * 60));
      if (diffMinutes > 0) {
        return <span className="text-orange-600 font-medium">{diffMinutes}m delay</span>;
      }
    }
    return <span className="text-green-600 font-medium">On time</span>;
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <>
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
                          <tr key={indent.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-green-700">
                              {indent.indent_no || `IND-${indent.id}`}
                            </td>
                            <td className="px-6 py-4 text-sm">{indent.admission_number}</td>
                            <td className="px-6 py-4 text-sm">{indent.patient_name}</td>
                            <td className="px-6 py-4 text-sm">{indent.uhid_number}</td>
                            <td className="px-6 py-4 text-sm">{indent.staff_name}</td>
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
                                {indent.slip_image && (
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
                          <td colSpan="9" className="px-6 py-12 text-center">
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
                    <thead className="bg-green-600 text-white">
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
                          <tr key={indent.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-green-700">
                              {indent.indent_no || `IND-${indent.id}`}
                            </td>
                            <td className="px-6 py-4 text-sm">{indent.admission_number}</td>
                            <td className="px-6 py-4 text-sm">{indent.patient_name}</td>
                            <td className="px-6 py-4 text-sm">{indent.uhid_number}</td>
                            <td className="px-6 py-4 text-sm">{indent.staff_name}</td>
                              <td className="px-6 py-4 text-sm">{indent.diagnosis}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                {indent.medicines?.length || 0} Items
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {indent.actual2 ? new Date(indent.actual2).toLocaleString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short'
                              }) : '-'}
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
                                {indent.slip_image && (
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
          </>
        )}
      </div>

      {/* View Details Modal */}
      {viewModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Medicine Details - {selectedIndent.indent_no || `IND-${selectedIndent.id}`}
              </h2>
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
                    <p className="text-sm text-gray-500">Indent Number</p>
                    <p className="font-medium">{selectedIndent.indent_no || `IND-${selectedIndent.id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Number</p>
                    <p className="font-medium">{selectedIndent.admission_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient Name</p>
                    <p className="font-medium">{selectedIndent.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">UHID Number</p>
                    <p className="font-medium">{selectedIndent.uhid_number}</p>
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
                    <p className="font-medium">{selectedIndent.ward_location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Staff Name</p>
                    <p className="font-medium">{selectedIndent.staff_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Consultant Name</p>
                    <p className="font-medium">{selectedIndent.consultant_name}</p>
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
                          <th className="px-4 py-3 text-left text-sm font-semibold">Dosage</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Frequency</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedIndent.medicines.map((medicine, index) => (
                          <tr key={medicine.id || index}>
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium">{medicine.name}</td>
                            <td className="px-4 py-3 text-sm">{medicine.dosage || '-'}</td>
                            <td className="px-4 py-3 text-sm">{medicine.frequency || '-'}</td>
                            <td className="px-4 py-3 text-sm">{medicine.duration || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {medicine.quantity || 1}
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
                      {selectedIndent.status || 'Approved'}
                    </span>
                    {selectedIndent.planned2 && (
                      <span className="text-sm text-gray-500">
                        Planned on {new Date(selectedIndent.planned2).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>
                  {selectedIndent.actual2 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Store Confirmed:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Dispensed
                      </span>
                      <span className="text-sm text-gray-500">
                        on {new Date(selectedIndent.actual2).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}
                  {selectedIndent.delay2 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Delay:</span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        {selectedIndent.delay2}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                {!selectedIndent.actual2 && (
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
      {slipModal && selectedIndent && selectedIndent.slip_image && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Medicine Slip - {selectedIndent.indent_no || `IND-${selectedIndent.id}`}
              </h2>
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
                  src={selectedIndent.slip_image} 
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