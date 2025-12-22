import React, { useState, useEffect } from 'react';
import { X, Eye, FileText, Upload, Check, Bell } from 'lucide-react';
import supabase from '../../../SupabaseClient';

const Payment = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [historyPayments, setHistoryPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [modalError, setModalError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  
  const [formData, setFormData] = useState({
    payment: '',
    billImage: null
  });

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const showNotificationPopup = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  // Load data from Supabase
  useEffect(() => {
    loadData();

    // Set up real-time subscription
    const channel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab'
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

  const loadData = async () => {
    try {
      setInitialLoading(true);
      
      // Load pending payments (planned1 IS NOT NULL AND actually IS NULL AND payment_status IS NULL)
      const { data: pendingData, error: pendingError } = await supabase
        .from('lab')
        .select(`*`)
        .not('planned1', 'is', null)
        .is('actual1', null)
        .is('payment_status', null)
        .order('timestamp', { ascending: false });

      if (pendingError) throw pendingError;

      const formattedPending = pendingData.map(record => {
        // Generate advice number from record.id (UUID)
        const idString = record.id?.toString() || '';
        const adviceNo = record.advice_no || `ADV-${idString.substring(0, 8)}`;
        
        return {
          id: record.id,
          uniqueNumber: record.admission_no || 'N/A', // Changed from unique_number to admission_no
          patientName: record.patient_name || 'N/A',
          phoneNumber: record.phone_no || 'N/A',
          age: record.age || 'N/A', // sgs seems to be age field
          gender: record.gender || 'N/A',
          bedNo: record.bed_no || 'N/A', // Fixed typo: bad_no to bed_no
          location: record.location || 'N/A',
          wardType: record.ward_type || 'N/A', // Fixed typo: word_type to ward_type
          room: record.room || 'N/A',
          reasonForVisit: record.reason_for_visit || 'N/A',
          adviceNo: record.admission_no || 'N/A', // Use admission_no as advice number
          category: record.category,
          priority: record.priority,
          pathologyTests: record.pathology_tests || [],
          radiologyTests: record.radiology_tests || [],
          radiologyType: record.radiology_type,
          planned1: record.planned1,
          actual1: record.actual1, // Note: column name is "actually" not "actual1"
          paymentId: record.id,
          admissionNo: record.admission_no // Added this to show full admission_no
        };
      });

      setPendingPayments(formattedPending);

      // Load history payments (payment_status IS NOT NULL)
      const { data: historyData, error: historyError } = await supabase
        .from('lab')
        .select(`*`)
        .not('planned1', 'is', null)
         .not('actual1', 'is', null)
        .order('timestamp', { ascending: false });

      if (historyError) throw historyError;

      const formattedHistory = historyData.map(record => {
        // Generate advice number from record.id (UUID)
        const idString = record.id?.toString() || '';
        const adviceNo = record.advice_no || `ADV-${idString.substring(0, 8)}`;
        
        return {
          id: record.id,
          uniqueNumber: record.admission_no || 'N/A', // Changed from unique_number to admission_no
          patientName: record.patient_name || 'N/A',
          phoneNumber: record.phone_no || 'N/A',
          age: record.age || 'N/A', // sgs seems to be age field
          gender: record.gender || 'N/A',
          bedNo: record.bed_no || 'N/A', // Fixed typo: bad_no to bed_no
          location: record.location || 'N/A',
          wardType: record.ward_type || 'N/A', // Fixed typo: word_type to ward_type
          room: record.room || 'N/A',
          reasonForVisit: record.reason_for_visit || 'N/A',
          adviceNo: record.admission_no || 'N/A', // Use admission_no as advice number
          category: record.category,
          priority: record.priority,
          pathologyTests: record.pathology_tests || [],
          radiologyTests: record.radiology_tests || [],
          radiologyType: record.radiology_type,
          paymentStatus: record.payment_status,
          billImage: record.bill_image_url, // Note: column name is "kill_image_url" not "bill_image_url"
          processedDate: record.actual1,
          paymentId: record.id,
          admissionNo: record.admission_no // Added this to show full admission_no
        };
      });

      setHistoryPayments(formattedHistory);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotificationPopup('Failed to load payment data. Please try again.', 'error');
    } finally {
      setInitialLoading(false);
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

  const handleImageChange = (e) => {
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
          billImage: reader.result
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async () => {
  if (!formData.payment) {
    setModalError('Please select payment status');
    return;
  }

  // Only require bill image if payment is "Yes"
  if (formData.payment === 'Yes' && !formData.billImage) {
    setModalError('Please upload bill image');
    return;
  }

  try {
    setLoading(true);
    
    let publicUrl = null;
    
    // Only process image upload if payment is "Yes" and billImage exists
    if (formData.payment === 'Yes' && formData.billImage) {
      // Convert base64 to blob
      const base64Data = formData.billImage.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      
      // Upload image to Supabase Storage
      const fileName = `bill_${selectedRecord.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bill_image')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl: url } } = supabase.storage
        .from('bill_image')
        .getPublicUrl(fileName);
      
      publicUrl = url;
    }

    // Prepare update data
    const updateData = {
      payment_status: formData.payment,
      planned2: new Date().toLocaleString("en-CA", { 
        timeZone: "Asia/Kolkata", 
        hour12: false 
      }).replace(',', ''),
      actual1: new Date().toLocaleString("en-CA", { 
        timeZone: "Asia/Kolkata", 
        hour12: false 
      }).replace(',', ''),
    };

    // Only include bill_image_url if payment is "Yes" and we have a URL
    if (formData.payment === 'Yes' && publicUrl) {
      updateData.bill_image_url = publicUrl;
    } else if (formData.payment !== 'Yes') {
      // If payment is not "Yes", set bill_image_url to null or empty string
      updateData.bill_image_url = null;
    }

    // Update lab record with payment info
    const { error: updateError } = await supabase
      .from('lab')
      .update(updateData)
      .eq('id', selectedRecord.id);

    if (updateError) throw updateError;

    // Reload data
    await loadData();
    
    // Show success notification
    showNotificationPopup('Payment processed successfully!', 'success');
    
    setShowModal(false);
    resetForm();
  } catch (error) {
    console.error('Failed to process payment:', error);
    showNotificationPopup('Failed to process payment. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      payment: '',
      billImage: null
    });
    setImagePreview(null);
    setModalError('');
    setSelectedRecord(null);
  };

  const handleViewClick = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const handleViewImage = (imageUrl) => {
    if (!imageUrl) {
      // Show notification instead of alert
      showNotificationPopup('No bill image available', 'error');
      return;
    }
    
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>Bill Image</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
          <img src="${imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
        </body>
      </html>
    `);
  };

  // Calculate statistics
  const totalPathology = [...pendingPayments, ...historyPayments].filter(r => r.category === 'Pathology').length;
  const totalRadiology = [...pendingPayments, ...historyPayments].filter(r => r.category === 'Radiology').length;
  const completePathology = historyPayments.filter(r => r.category === 'Pathology').length;
  const completeRadiology = historyPayments.filter(r => r.category === 'Radiology').length;
  const pendingPathology = pendingPayments.filter(r => r.category === 'Pathology').length;
  const pendingRadiology = pendingPayments.filter(r => r.category === 'Radiology').length;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`relative w-full max-w-md transform transition-all duration-300 ${
            showNotification ? 'animate-scale-in opacity-100' : 'opacity-0 scale-95'
          }`}>
            <div className={`rounded-lg shadow-2xl overflow-hidden ${
              notificationType === 'success' 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'
            }`}>
              <div className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  notificationType === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notificationType === 'success' ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : (
                    <X className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${
                  notificationType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notificationType === 'success' ? 'Success!' : 'Error!'}
                </h3>
                <p className={`text-sm ${
                  notificationType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {notificationMessage}
                </p>
                <div className={`mt-4 h-1 w-full ${
                  notificationType === 'success' ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  <div className={`h-full ${
                    notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
                  } animate-progress`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Payment Management</h1>
          <p className="mt-1 text-sm text-gray-600">Process payments and manage billing records</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Total Pathology</span>
            <span className="text-2xl font-bold text-green-600 mt-1">{totalPathology}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Total Radiology</span>
            <span className="text-2xl font-bold text-purple-600 mt-1">{totalRadiology}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Complete Pathology</span>
            <span className="text-2xl font-bold text-green-600 mt-1">{completePathology}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Complete Radiology</span>
            <span className="text-2xl font-bold text-teal-600 mt-1">{completeRadiology}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Pending Pathology</span>
            <span className="text-2xl font-bold text-orange-600 mt-1">{pendingPathology}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase">Pending Radiology</span>
            <span className="text-2xl font-bold text-red-600 mt-1">{pendingRadiology}</span>
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
          Pending ({pendingPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          History ({historyPayments.length})
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
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Admission No</th>
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
                {pendingPayments.length > 0 ? (
                  pendingPayments.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleActionClick(record)}
                          className="px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                        >
                          Process
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {record.admissionNo || record.uniqueNumber}
                      </td>
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
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {record.category === 'Pathology'
                          ? record.pathologyTests?.slice(0, 2).join(', ') + (record.pathologyTests?.length > 2 ? '...' : '')
                          : record.radiologyTests?.slice(0, 2).join(', ') + (record.radiologyTests?.length > 2 ? '...' : '')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                      <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No pending payments</p>
                      <p className="text-sm text-gray-500 mt-1">Records with planned tests will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">Admission No: {record.admissionNo || record.uniqueNumber}</div>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{record.category}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <FileText className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No pending payments</p>
                <p className="text-xs text-gray-500 mt-1">Records with planned tests will appear here</p>
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
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Admission No</th>
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
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Payment Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Bill Image</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyPayments.length > 0 ? (
                  historyPayments.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {record.admissionNo || record.uniqueNumber}
                      </td>
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
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.category}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.paymentStatus === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.paymentStatus === 'Yes' ? 'Paid' : 'Unpaid'}
                        </span>
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
                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
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
            {historyPayments.length > 0 ? (
              historyPayments.map((record) => (
                <div key={record.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">Admission No: {record.admissionNo || record.uniqueNumber}</div>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.paymentStatus === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.paymentStatus === 'Yes' ? 'Paid' : 'Unpaid'}
                      </span>
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

      {/* Payment Processing Modal */}
      {showModal && selectedRecord && (
        <div className="overflow-y-auto fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b border-gray-200 md:p-6">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Payment Processing</h2>
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
                    <span className="text-gray-600">Admission No:</span>
                    <div className="font-medium text-green-600">{selectedRecord.admissionNo || selectedRecord.uniqueNumber}</div>
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
                    <span className="text-gray-600">Category:</span>
                    <div className="font-medium text-gray-900">{selectedRecord.category}</div>
                  </div>
                  {selectedRecord.category === 'Radiology' && selectedRecord.radiologyType && (
                    <div>
                      <span className="text-gray-600">Radiology Type:</span>
                      <div className="font-medium text-gray-900">{selectedRecord.radiologyType}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Payment Status *</label>
                  <select
                    name="payment"
                    value={formData.payment}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Payment Status</option>
                    <option value="Yes">Yes - Paid</option>
                    <option value="No">No - Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Upload Bill Image *</label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="bill-image-upload"
                    />
                    <label
                      htmlFor="bill-image-upload"
                      className="flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="text-center">
                          <img
                            src={imagePreview}
                            alt="Bill preview"
                            className="max-h-40 mb-2 rounded"
                          />
                          <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            Image uploaded successfully
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to change image</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload bill image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
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
                  disabled={loading}
                  className="px-6 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 disabled:opacity-50 sm:w-auto"
                >
                  {loading ? 'Processing...' : 'Save Payment'}
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
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Payment Details</h2>
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
                    <span className="text-gray-600">Admission No:</span>
                    <div className="font-medium text-green-600">{viewingRecord.admissionNo || viewingRecord.uniqueNumber}</div>
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

              {/* Lab & Payment Details */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Lab & Payment Details</h3>
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
                    <span className="text-gray-600">Category:</span>
                    <div className="font-medium text-gray-900 mt-1">{viewingRecord.category}</div>
                  </div>

                  {viewingRecord.category === 'Pathology' && viewingRecord.pathologyTests?.length > 0 && (
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

                  {viewingRecord.category === 'Radiology' && (
                    <>
                      <div>
                        <span className="text-gray-600">Radiology Type:</span>
                        <div className="font-medium text-gray-900 mt-1">{viewingRecord.radiologyType}</div>
                      </div>
                      {viewingRecord.radiologyTests?.length > 0 && (
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

                  <div className="pt-3 border-t border-green-300">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        viewingRecord.paymentStatus === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {viewingRecord.paymentStatus === 'Yes' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Processed Date:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {viewingRecord.processedDate ? new Date(viewingRecord.processedDate).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill Image */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Bill Image</h3>
                <div className="space-y-3">
                  {viewingRecord.billImage ? (
                    <>
                      <img
                        src={viewingRecord.billImage}
                        alt="Bill"
                        className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => handleViewImage(viewingRecord.billImage)}
                        className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Open in Full Screen
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-600">No bill image available</p>
                    </div>
                  )}
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

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Payment;