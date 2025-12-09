import React, { useState, useEffect } from 'react';
import { FileText, X, Clock, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import supabase from '../../../SupabaseClient';

const InitiationByRMO = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPatients, setPendingPatients] = useState([]);
  const [historyPatients, setHistoryPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalError, setModalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    rmoName: '',
    summaryReportImage: null,
    summaryReportImageName: ''
  });

  const rmoList = [
    'Dr. RMO Sharma',
    'Dr. RMO Patel',
    'Dr. RMO Kumar',
    'Dr. RMO Singh',
    'Dr. RMO Verma'
  ];

  const statusOptions = [
    'Approved',
    'Under Review',
    'Completed',
    'Pending Documentation'
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'pending') {
        await loadPendingPatients();
      } else {
        await loadHistoryPatients();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingPatients = async () => {
    try {
      // Fetch patients where planned1 is not null AND actual1 is null
      const { data, error } = await supabase
        .from('discharge')
        .select('*')
        .not('planned1', 'is', null)
        .is('actual1', null)
        .order('planned1', { ascending: true });

      if (error) throw error;

      // Format the data for display
      const formattedPatients = data.map(patient => ({
        id: patient.id,
        admissionNo: patient.admission_no,
        patientName: patient.patient_name,
        department: patient.department,
        consultantName: patient.consultant_name,
        staffName: patient.staff_name,
        dischargeDate: patient.planned1 ? new Date(patient.planned1).toLocaleDateString('en-GB') : 'N/A',
        dischargeTime: patient.planned1 ? new Date(patient.planned1).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : 'N/A',
        planned1: patient.planned1,
        actual1: patient.actual1,
        remark: patient.remark,
        dischargeNumber: patient.discharge_number,
        // RMO fields (will be null for pending patients)
        rmo_status: patient.rmo_status,
        rmo_name: patient.rmo_name,
        summary_report_image: patient.summary_report_image,
        summary_report_image_name: patient.summary_report_image_name
      }));

      setPendingPatients(formattedPatients);
    } catch (error) {
      console.error('Error loading pending patients:', error);
      setPendingPatients([]);
    }
  };

  const loadHistoryPatients = async () => {
    try {
      // Fetch patients where planned1 AND actual1 are not null
      // AND also has RMO initiation data (rmo_name is not null)
      const { data, error } = await supabase
        .from('discharge')
        .select('*')
        .not('planned1', 'is', null)
        .not('actual1', 'is', null)
        .not('rmo_name', 'is', null) // Only show patients with RMO initiation
        .order('actual1', { ascending: false });

      if (error) throw error;

      // Format the data for display
      const formattedPatients = data.map(patient => ({
        id: patient.id,
        admissionNo: patient.admission_no,
        patientName: patient.patient_name,
        department: patient.department,
        consultantName: patient.consultant_name,
        staffName: patient.staff_name,
        dischargeDate: patient.actual1 ? new Date(patient.actual1).toLocaleDateString('en-GB') : 'N/A',
        dischargeTime: patient.actual1 ? new Date(patient.actual1).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : 'N/A',
        planned1: patient.planned1,
        actual1: patient.actual1,
        delay1: patient.delay1,
        remark: patient.remark,
        dischargeNumber: patient.discharge_number,
        // RMO fields
        rmo_status: patient.rmo_status,
        rmo_name: patient.rmo_name,
        summary_report_image: patient.summary_report_image,
        summary_report_image_name: patient.summary_report_image_name,
        initiation_date: patient.rmo_initiation_date
      }));

      setHistoryPatients(formattedPatients);
    } catch (error) {
      console.error('Error loading history patients:', error);
      setHistoryPatients([]);
    }
  };

  const handleInitiation = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      status: patient.rmo_status || '',
      rmoName: patient.rmo_name || '',
      summaryReportImage: patient.summary_report_image || null,
      summaryReportImageName: patient.summary_report_image_name || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setModalError('Please upload a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setModalError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          summaryReportImage: reader.result,
          summaryReportImageName: file.name
        }));
        setModalError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      summaryReportImage: null,
      summaryReportImageName: ''
    }));
  };

 const handleSubmit = async () => {
  if (!formData.status || !formData.rmoName || !formData.summaryReportImage) {
    setModalError('Please fill all required fields marked with *');
    return;
  }

  try {
    let imageUrl = null;
    
    // If there's an image to upload
    if (formData.summaryReportImage) {
      // Generate a unique filename
      const fileName = `summary_report_${selectedPatient.admissionNo}_${Date.now()}.jpg`;
      const filePath = `summary-reports/${fileName}`;
      
      // Convert base64 to blob
      const base64Response = await fetch(formData.summaryReportImage);
      const blob = await base64Response.blob();
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('summary_report_image') // Make sure this bucket exists
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload summary report image');
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('summary_report_image')
        .getPublicUrl(filePath);
      
      imageUrl = urlData.publicUrl;
    }

    const now = new Date();
    
    // Update the discharge record in Supabase with RMO initiation data
    const { error: updateError } = await supabase
      .from('discharge')
      .update({
        // Set actual discharge time
        actual1: new Date().toLocaleString("en-CA", { 
          timeZone: "Asia/Kolkata", 
          hour12: false 
        }).replace(',', ''),
        
        // RMO initiation fields
        rmo_status: formData.status,
        rmo_name: formData.rmoName,
        summary_report_image: imageUrl, // Store the public URL instead of base64
        planned2: new Date().toLocaleString("en-CA", { 
          timeZone: "Asia/Kolkata", 
          hour12: false 
        }).replace(',', ''),
        
        // Update delay calculation
        delay1: calculateDelay(selectedPatient.planned1, now)
      })
      .eq('id', selectedPatient.id);

    if (updateError) throw updateError;

    setShowModal(false);
    setSelectedPatient(null);
    resetForm();
    
    // Reload data
    await loadData();
    
  } catch (error) {
    console.error('Error saving initiation:', error);
    setModalError(error.message || 'Failed to save. Please try again.');
  }
};

  const calculateDelay = (plannedDate, actualDate) => {
    if (!plannedDate) return 'No planned date';
    
    const planned = new Date(plannedDate);
    const actual = actualDate || new Date();
    const diffMs = actual - planned;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 0) {
      const hoursEarly = Math.abs(diffHours);
      const minsEarly = Math.abs(diffMinutes);
      return `Early by ${hoursEarly}h ${minsEarly}m`;
    }
    if (diffHours === 0 && diffMinutes <= 5) return 'On time';
    return `Delayed by ${diffHours}h ${diffMinutes}m`;
  };

  const resetForm = () => {
    setFormData({
      status: '',
      rmoName: '',
      summaryReportImage: null,
      summaryReportImageName: ''
    });
    setModalError('');
  };

  const [viewImageModal, setViewImageModal] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  const openImageViewer = (imageData) => {
    setViewingImage(imageData);
    setViewImageModal(true);
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Function to format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="p-3 space-y-4 md:p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Initiation by RMO
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage RMO initiation records for discharged patients
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
          <button
            onClick={loadData}
            className="px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
          >
            Refresh
          </button>
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
            {pendingPatients.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {pendingPatients.length}
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
            {historyPatients.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                {historyPatients.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Pending Section */}
      {activeTab === 'pending' && (
        <div>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Action</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Admission No</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Patient Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Department</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Consultant</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Staff Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Planned Discharge</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPatients.length > 0 ? (
                  pendingPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <button
                          onClick={() => handleInitiation(patient)}
                          className="flex gap-1 items-center px-3 py-1.5 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700"
                        >
                          <FileText className="w-4 h-4" />
                          Initiation
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {patient.admissionNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {patient.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.consultantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.staffName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.dischargeDate} {patient.dischargeTime}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <Clock className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No pending initiations</p>
                      <p className="text-sm">All planned discharges have been initiated</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {pendingPatients.length > 0 ? (
              pendingPatients.map((patient) => (
                <div key={patient.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">
                        {patient.admissionNo}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {patient.patientName}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleInitiation(patient)}
                      className="flex flex-shrink-0 gap-1 items-center px-2 py-1 text-xs text-white bg-green-600 rounded-lg shadow-sm"
                    >
                      <FileText className="w-3 h-3" />
                      Initiation
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-900">{patient.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultant:</span>
                      <span className="font-medium text-gray-900">{patient.consultantName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Name:</span>
                      <span className="font-medium text-gray-900">{patient.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned Discharge:</span>
                      <span className="font-medium text-gray-900">{patient.dischargeDate} {patient.dischargeTime}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <Clock className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900">No pending initiations</p>
                <p className="text-xs text-gray-600">All planned discharges have been initiated</p>
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
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">RMO Name</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase">Summary Report</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyPatients.length > 0 ? (
                  historyPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-green-50">
                      <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">
                        {patient.admissionNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {patient.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.consultantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.staffName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.dischargeDate} {patient.dischargeTime}
                      </td>
                    
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {patient.rmo_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {patient.rmo_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {patient.summary_report_image ? (
                          <button
                            onClick={() => openImageViewer(patient.summary_report_image)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                          >
                            <ImageIcon className="w-3 h-3" />
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
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      <CheckCircle className="mx-auto mb-2 w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">No history records</p>
                      <p className="text-sm">Initiated patients will appear here</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {historyPatients.length > 0 ? (
              historyPatients.map((patient) => (
                <div key={patient.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-1">
                        {patient.admissionNo}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {patient.patientName}
                      </h3>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {patient.rmo_status || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-900">{patient.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultant:</span>
                      <span className="font-medium text-gray-900">{patient.consultantName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Name:</span>
                      <span className="font-medium text-gray-900">{patient.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Discharge:</span>
                      <span className="font-medium text-gray-900">{patient.dischargeDate} {patient.dischargeTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delay:</span>
                      <span className={`font-medium ${
                        patient.delay1?.includes('Delayed') 
                          ? 'text-red-700'
                          : patient.delay1?.includes('Early')
                          ? 'text-blue-700'
                          : 'text-green-700'
                      }`}>
                        {patient.delay1 || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RMO Name:</span>
                      <span className="font-medium text-gray-900">{patient.rmo_name || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Summary Report:</span>
                      {patient.summary_report_image ? (
                        <button
                          onClick={() => openImageViewer(patient.summary_report_image)}
                          className="flex items-center gap-1 mt-1 px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100"
                        >
                          <ImageIcon className="w-3 h-3" />
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
                <p className="text-xs text-gray-600">Initiated patients will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initiation Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl animate-scale-in overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 bg-green-600 rounded-t-lg md:p-6 z-10">
              <h2 className="text-xl font-bold text-white md:text-2xl">
                RMO Initiation - {selectedPatient.admissionNo}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPatient(null);
                  resetForm();
                }}
                className="text-white rounded-full p-1 hover:text-gray-200 hover:bg-green-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {/* Pre-filled Information */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Patient Name:</span>
                      <p className="font-medium text-gray-900">{selectedPatient.patientName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <p className="font-medium text-gray-900">{selectedPatient.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Consultant:</span>
                      <p className="font-medium text-gray-900">{selectedPatient.consultantName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Staff Name:</span>
                      <p className="font-medium text-gray-900">{selectedPatient.staffName}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Planned Discharge:</span>
                      <p className="font-medium text-gray-900">{selectedPatient.dischargeDate} {selectedPatient.dischargeTime}</p>
                    </div>
                  </div>
                </div>

                {/* User Input Fields */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    RMO Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rmoName"
                    value={formData.rmoName}
                    onChange={handleInputChange}
                    className="px-3 py-2 w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select RMO</option>
                    {rmoList.map((rmo) => (
                      <option key={rmo} value={rmo}>{rmo}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Summary Report <span className="text-red-500">*</span>
                  </label>
                  
                  {!formData.summaryReportImage ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <label
                        htmlFor="imageUpload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative border-2 border-green-300 rounded-lg p-2 bg-green-50">
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={formData.summaryReportImage}
                        alt="Summary Report"
                        className="w-full h-48 object-contain rounded"
                      />
                      <p className="text-xs text-gray-600 mt-2 text-center truncate">
                        {formData.summaryReportImageName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {modalError && (
                <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {modalError}
                </div>
              )}
              
              <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPatient(null);
                    resetForm();
                  }}
                  className="px-4 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                >
                  {selectedPatient.rmo_name ? 'Update Initiation' : 'Save Initiation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImageModal && viewingImage && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg z-10">
              <h2 className="text-lg font-semibold text-gray-900">Summary Report Image</h2>
              <button
                onClick={() => setViewImageModal(false)}
                className="text-gray-500 rounded-full p-1 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={viewingImage}
                alt="Summary Report"
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
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
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InitiationByRMO;