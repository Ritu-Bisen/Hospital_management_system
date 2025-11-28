import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Plus, X, Save, Trash2, Eye, Edit, CheckCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const DUMMY_NURSING_TASKS = [
  'Vital Signs Monitoring',
  'Wound Care & Dressing',
  'Patient Hygiene & Bathing',
  'Catheter Care',
  'Bed Bath & Linen Change',
  'Urinary Output Monitoring',
  'Feeding & Nutrition Support',
  'Oral Care',
  'Medication Administration',
  'IV Line Management',
  'Pain Assessment',
  'Temperature Monitoring',
  'Blood Pressure Monitoring',
  'Pulse & Respiration Check',
  'Patient Mobilization',
  'Range of Motion Exercises',
  'Pressure Ulcer Prevention',
  'Stoma Care',
  'Chest Physiotherapy',
  'Patient Education'
];

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

export default function Nursing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const data = location.state?.data;

  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [showNursingModal, setShowNursingModal] = useState(false);
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [nursingFormData, setNursingFormData] = useState({
    taskName: '',
    priority: 'Medium',
    frequency: 'Once',
    duration: '',
    specialInstructions: '',
    status: 'Pending'
  });

  // Initialize from data and localStorage on component mount
  useEffect(() => {
    if (!data) return;

    // Load history from incoming data
    const src = data.nurseTasks || [];
    let hist = [];
    if (Array.isArray(src) && src.length) {
      hist = src.map((item, idx) => {
        if (item.taskNo) return item;
        return {
          taskNo: `NT-${String(src.length - idx).padStart(3, '0')}`,
          admissionNo: data.personalInfo.ipd || '',
          uniqueNumber: data.personalInfo.uhid || data.personalInfo.ipd || '',
          patientName: data.personalInfo.name,
          taskName: item.task || '',
          priority: item.priority || 'Medium',
          frequency: item.frequency || 'Once',
          duration: item.duration || '',
          specialInstructions: item.specialInstructions || item.remarks || '',
          status: item.status || 'Pending',
          date: item.date || new Date().toISOString().split('T')[0],
          completedBy: item.completedBy || ''
        };
      });
    }

    hist.sort((a, b) => {
      const na = parseInt((a.taskNo || 'NT-000').replace(/^NT-/, ''), 10) || 0;
      const nb = parseInt((b.taskNo || 'NT-000').replace(/^NT-/, ''), 10) || 0;
      return nb - na;
    });

    setHistoryList(hist);

    // IMPORTANT: Load pending from localStorage FIRST
    try {
      const stored = localStorage.getItem('nursingTasksPending');
      if (stored) {
        const pending = JSON.parse(stored);
        if (Array.isArray(pending) && pending.length > 0) {
          setPendingList(pending);
          console.log('Loaded pending nursing tasks from localStorage:', pending.length);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load pending from localStorage:', e);
    }
    
    setPendingList([]);
  }, [data]);

  // Refresh pending from localStorage when page focus
  useEffect(() => {
    const handleFocus = () => {
      try {
        const stored = localStorage.getItem('nursingTasksPending');
        if (stored) {
          const pending = JSON.parse(stored);
          if (Array.isArray(pending)) {
            setPendingList(pending);
          }
        }
      } catch (e) {
        console.error('Failed to refresh pending:', e);
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

  const handleNursingInputChange = (e) => {
    const { name, value } = e.target;
    setNursingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNursingSubmit = () => {
    if (!nursingFormData.taskName.trim()) {
      alert('Please select a task');
      return;
    }

    const getNextTaskNo = () => {
      const top = historyList && historyList.length ? historyList[0].taskNo : null;
      if (!top) return 'NT-001';
      const num = parseInt(top.replace(/^NT-/, ''), 10);
      const next = num + 1;
      return `NT-${String(next).padStart(3, '0')}`;
    };

    const taskNo = getNextTaskNo();

    const newTask = {
      taskId: `NT-${Date.now()}`,
      taskNo,
      admissionNo: data.personalInfo.ipd || '',
      uniqueNumber: data.personalInfo.uhid || data.personalInfo.ipd || '',
      patientName: data.personalInfo.name,
      taskName: nursingFormData.taskName,
      priority: nursingFormData.priority,
      frequency: nursingFormData.frequency,
      duration: nursingFormData.duration,
      specialInstructions: nursingFormData.specialInstructions,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      completedBy: ''
    };

    let updatedPendingList;
    if (editMode && selectedTask) {
      updatedPendingList = pendingList.map(task =>
        task.taskId === selectedTask.taskId ? newTask : task
      );
      setPendingList(updatedPendingList);
    } else {
      updatedPendingList = [newTask, ...pendingList];
      setPendingList(updatedPendingList);
    }

    // Store in localStorage
    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(updatedPendingList));
      console.log('Saved to localStorage:', updatedPendingList.length, 'pending nursing tasks');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Show payment slip
    setPaymentData(newTask);
    setShowPaymentSlip(true);

    // Reset form and close modal
    setShowNursingModal(false);
    setNursingFormData({
      taskName: '',
      priority: 'Medium',
      frequency: 'Once',
      duration: '',
      specialInstructions: '',
      status: 'Pending'
    });
    setEditMode(false);
    setSelectedTask(null);
  };

  const handlePaymentConfirm = () => {
    if (!paymentData) return;
    
    setShowPaymentSlip(false);
    setPaymentData(null);
    setActiveTab('pending');
    
    console.log('Task confirmation closed. Record remains in Pending until processed');
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setNursingFormData({
      taskName: task.taskName,
      priority: task.priority,
      frequency: task.frequency,
      duration: task.duration,
      specialInstructions: task.specialInstructions,
      status: task.status
    });
    setEditMode(true);
    setShowNursingModal(true);
  };

  const handleRemoveTask = (taskId) => {
    const updatedList = pendingList.filter(task => task.taskId !== taskId);
    setPendingList(updatedList);
    try {
      localStorage.setItem('nursingTasksPending', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to remove task:', e);
    }
  };

  const resetForm = () => {
    setNursingFormData({
      taskName: '',
      priority: 'Medium',
      frequency: 'Once',
      duration: '',
      specialInstructions: '',
      status: 'Pending'
    });
    setSelectedTask(null);
    setEditMode(false);
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
              <Heart className="w-8 h-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Nursing Tasks</h1>
                <p className="text-sm opacity-90 mt-1">{data.personalInfo.name} - {data.personalInfo.uhid}</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowNursingModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Task
            </button>
          </div>
        </div>

        {/* Content */}
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
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">TASK NO</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">TASK NAME</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PRIORITY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">FREQUENCY</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">DURATION</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">STATUS</th>
                        <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map((task, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-green-600 font-semibold">{task.taskNo}</td>
                          <td className="px-4 py-3 text-gray-700">{task.taskName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{task.frequency}</td>
                          <td className="px-4 py-3 text-gray-700">{task.duration || 'N/A'}</td>
                          <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(task)}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                title="Edit Task"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveTask(task.taskId)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                title="Remove Task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No pending tasks</p>
                  <p className="text-gray-500 text-sm">Nursing tasks will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {historyList.length > 0 ? (
                <div className="space-y-3 p-4">
                  {historyList.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{item.taskName}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                            <span>Task No: {item.taskNo}</span>
                            <span>Date: {item.date}</span>
                            <span>Priority: {item.priority}</span>
                          </div>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="mt-3 p-3 bg-white rounded border border-gray-300">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Completed by:</span> {item.completedBy || 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">No history available</p>
                  <p className="text-gray-500 text-sm">Records will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nursing Task Modal */}
      {showNursingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit Nursing Task' : 'Assign Nursing Task'}</h2>
              <button
                onClick={() => {
                  setShowNursingModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">UHID:</span>
                    <div className="font-medium text-gray-900">{data.personalInfo.uhid}</div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Task Name *</label>
                  <select
                    name="taskName"
                    value={nursingFormData.taskName}
                    onChange={handleNursingInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Task</option>
                    {DUMMY_NURSING_TASKS.map((task) => (
                      <option key={task} value={task}>{task}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Priority</label>
                    <select
                      name="priority"
                      value={nursingFormData.priority}
                      onChange={handleNursingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Frequency</label>
                    <select
                      name="frequency"
                      value={nursingFormData.frequency}
                      onChange={handleNursingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Once">Once</option>
                      <option value="Twice">Twice</option>
                      <option value="Thrice">Thrice</option>
                      <option value="Every 2 Hours">Every 2 Hours</option>
                      <option value="Every 4 Hours">Every 4 Hours</option>
                      <option value="Every 6 Hours">Every 6 Hours</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={nursingFormData.duration}
                    onChange={handleNursingInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 15 minutes, 1 hour"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Special Instructions</label>
                  <textarea
                    name="specialInstructions"
                    value={nursingFormData.specialInstructions}
                    onChange={handleNursingInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-end mt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowNursingModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 w-full font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNursingSubmit}
                  className="px-6 py-2 w-full font-medium text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700 sm:w-auto"
                >
                  {editMode ? 'Update Task' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showPaymentSlip && paymentData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Task Confirmation</h3>
              <button onClick={() => setShowPaymentSlip(false)} className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Close</button>
            </div>

            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between"><span className="font-medium">Task No</span><span className="text-green-600">{paymentData.taskNo}</span></div>
              <div className="flex justify-between"><span className="font-medium">Task Name</span><span>{paymentData.taskName}</span></div>
              <div className="flex justify-between"><span className="font-medium">Priority</span><span>{paymentData.priority}</span></div>
              <div className="flex justify-between"><span className="font-medium">Frequency</span><span>{paymentData.frequency}</span></div>
              <div className="flex justify-between"><span className="font-medium">Duration</span><span>{paymentData.duration || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="font-medium">Patient</span><span>{paymentData.patientName}</span></div>
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
