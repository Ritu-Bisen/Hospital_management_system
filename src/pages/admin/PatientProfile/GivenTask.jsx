import React, { useState, useEffect } from 'react';
import { CheckCircle, User, Stethoscope, Scissors, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import supabase from '../../../SupabaseClient';
import { useOutletContext } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColors()}`}>
      {status}
    </span>
  );
};

const MobileTaskCard = ({ task, activeTab, onComplete, completingTask, getTableName }) => {
  const [expanded, setExpanded] = useState(false);

  const getAssignedPerson = () => {
    if (activeTab === 'nurse') return task.assign_nurse;
    if (activeTab === 'rmo') return task.assign_rmo;
    if (activeTab === 'ot') return task.staff || task.assign_nurse;
    return '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm">
      {/* Task Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-green-600 text-sm">{task.task_no}</span>
            <StatusBadge status={task.status} />
          </div>
          <h3 className="font-medium text-gray-900 text-sm">{task.patient_name}</h3>
          <p className="text-xs text-gray-600">IPD: {task.ipd_number}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 p-1"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Main Task Info */}
      <div className="mb-3">
        <p className="text-gray-700 text-sm font-medium mb-1">Task:</p>
        <p className="text-gray-800 text-sm">{task.task}</p>
      </div>

      {/* Compact Details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">Ward</p>
          <p className="text-sm font-medium">{task.ward_type || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Bed</p>
          <p className="text-sm font-medium">{task.bed_no || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Shift</p>
          <p className="text-sm font-medium">{task.shift || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Assigned To</p>
          <p className="text-sm font-medium">{getAssignedPerson() || 'N/A'}</p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t pt-3 mb-4">
          {task.reminder && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Reminder:</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{task.reminder}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="text-sm font-medium">
                {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Planned Time</p>
              <p className="text-sm font-medium">
                {task.planned1 ? new Date(task.planned1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={() => onComplete(task.id, getTableName())}
        disabled={completingTask === task.id}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors ${
          completingTask === task.id ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {completingTask === task.id ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Completing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Mark as Complete
          </>
        )}
      </button>
    </div>
  );
};

export default function GivenTask() {
  const [activeTab, setActiveTab] = useState('nurse');
  const [nurseTasks, setNurseTasks] = useState([]);
  const [rmoTasks, setRmoTasks] = useState([]);
  const [otTasks, setOtTasks] = useState([]);
  const [loading, setLoading] = useState({
    nurse: true,
    rmo: true,
    ot: true
  });
  const [completingTask, setCompletingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Get IPD number from parent component context
  const { ipdNumber } = useOutletContext();

  // Get user role from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mis_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || '');
        
        // Set initial active tab based on role
        if (user.role) {
          const role = user.role.toLowerCase();
          if (role === 'nurse') setActiveTab('nurse');
          else if (role === 'rmo') setActiveTab('rmo');
          else if (role === 'ot' || role === 'ot staff') setActiveTab('ot');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  // Get available tabs based on user role - SINGLE TAB ONLY
  const getAvailableTabs = () => {
    if (!userRole) {
      // If no role, show all tabs (fallback)
      return [
        { key: 'nurse', label: 'Nurse Tasks', icon: User, count: nurseTasks.length },
        { key: 'rmo', label: 'RMO Tasks', icon: Stethoscope, count: rmoTasks.length },
        { key: 'ot', label: 'OT Tasks', icon: Scissors, count: otTasks.length }
      ];
    }

    const role = userRole.toLowerCase();
    
    // Return only ONE tab based on role
    if (role === 'nurse') {
      return [{ key: 'nurse', label: 'Nurse Tasks', icon: User, count: nurseTasks.length }];
    }
    
    if (role === 'rmo') {
      return [{ key: 'rmo', label: 'RMO Tasks', icon: Stethoscope, count: rmoTasks.length }];
    }
    
    if (role === 'ot' || role === 'ot staff') {
      return [{ key: 'ot', label: 'OT Tasks', icon: Scissors, count: otTasks.length }];
    }

    // If no specific role match, show all tabs
    return [
      { key: 'nurse', label: 'Nurse Tasks', icon: User, count: nurseTasks.length },
      { key: 'rmo', label: 'RMO Tasks', icon: Stethoscope, count: rmoTasks.length },
      { key: 'ot', label: 'OT Tasks', icon: Scissors, count: otTasks.length }
    ];
  };

  // Calculate delay status
  const calculateDelayStatus = (task) => {
    if (!task.planned1) return 'No Delay';
    
    const planned = new Date(task.planned1);
    const now = new Date();
    
    if (task.actual1) {
      const actual = new Date(task.actual1);
      const diffHours = (actual - planned) / (1000 * 60 * 60);
      return diffHours > 2 ? 'Delayed' : 'On Time';
    } else {
      const diffHours = (now - planned) / (1000 * 60 * 60);
      if (diffHours > 0) {
        return `Delayed by ${Math.floor(diffHours)}h`;
      } else {
        return 'On Time';
      }
    }
  };

  // Fetch nurse tasks with IPD filter
  const fetchNurseTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, nurse: true }));
      
      let query = supabase
        .from('nurse_assign_task')
        .select('*')
        .not('planned1', 'is', null)
        .is('actual1', null)
        .order('planned1', { ascending: true });

      // Add IPD filter only if we have a valid IPD number
      if (ipdNumber && ipdNumber !== 'N/A') {
        query = query.eq('Ipd_number', ipdNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedTasks = (data || []).map(task => ({
        id: task.id,
        task_no: task.task_no || `NT-${task.id.toString().padStart(3, '0')}`,
        ipd_number: task.Ipd_number,
        patient_name: task.patient_name,
        task: task.task,
        assign_nurse: task.assign_nurse,
        shift: task.shift,
        reminder: task.reminder,
        start_date: task.start_date,
        planned1: task.planned1,
        actual1: task.actual1,
        ward_type: task.ward_type,
        room: task.room,
        bed_no: task.bed_no,
        delayStatus: calculateDelayStatus(task),
        status: task.actual1 ? 'Completed' : 'Pending'
      }));

      setNurseTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching nurse tasks:', error);
      setNurseTasks([]);
    } finally {
      setLoading(prev => ({ ...prev, nurse: false }));
    }
  };

  // Fetch RMO tasks with IPD filter
  const fetchRmoTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, rmo: true }));
      
      let query = supabase
        .from('rmo_assign_task')
        .select('*')
        .not('planned1', 'is', null)
        .is('actual1', null)
        .order('planned1', { ascending: true });

      // Add IPD filter only if we have a valid IPD number
      if (ipdNumber && ipdNumber !== 'N/A') {
        query = query.eq('ipd_number', ipdNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedTasks = (data || []).map(task => ({
        id: task.id,
        task_no: task.task_no || `RMO-${task.id.toString().padStart(3, '0')}`,
        ipd_number: task.ipd_number,
        patient_name: task.patient_name,
        task: task.task,
        assign_rmo: task.assign_rmo,
        shift: task.shift,
        reminder: task.reminder,
        start_date: task.start_date,
        planned1: task.planned1,
        actual1: task.actual1,
        ward_type: task.ward_type,
        room: task.room,
        bed_no: task.bed_no,
        delayStatus: calculateDelayStatus(task),
        status: task.actual1 ? 'Completed' : 'Pending'
      }));

      setRmoTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching RMO tasks:', error);
      setRmoTasks([]);
    } finally {
      setLoading(prev => ({ ...prev, rmo: false }));
    }
  };

  // Fetch OT tasks with IPD filter
  const fetchOtTasks = async () => {
    try {
      setLoading(prev => ({ ...prev, ot: true }));
      
      let query = supabase
        .from('nurse_assign_task')
        .select('*')
        .eq('staff', 'OT Staff')
        .not('planned1', 'is', null)
        .is('actual1', null)
        .order('planned1', { ascending: true });

      // Add IPD filter only if we have a valid IPD number
      if (ipdNumber && ipdNumber !== 'N/A') {
        query = query.eq('Ipd_number', ipdNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedTasks = (data || []).map(task => ({
        id: task.id,
        task_no: task.task_no || `OT-${task.id.toString().padStart(3, '0')}`,
        ipd_number: task.Ipd_number,
        patient_name: task.patient_name,
        task: task.task,
        assign_nurse: task.assign_nurse,
        staff: task.staff,
        shift: task.shift,
        reminder: task.reminder,
        start_date: task.start_date,
        planned1: task.planned1,
        actual1: task.actual1,
        ward_type: task.ward_type,
        room: task.room,
        bed_no: task.bed_no,
        delayStatus: calculateDelayStatus(task),
        status: task.actual1 ? 'Completed' : 'Pending'
      }));

      setOtTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching OT tasks:', error);
      setOtTasks([]);
    } finally {
      setLoading(prev => ({ ...prev, ot: false }));
    }
  };

  // Fetch tasks based on user role
  useEffect(() => {
    if (!userRole) {
      // If no role yet, fetch all tasks
      fetchNurseTasks();
      fetchRmoTasks();
      fetchOtTasks();
      return;
    }

    const role = userRole.toLowerCase();
    console.log('Fetching tasks for role:', role);
    
    // Fetch only tasks relevant to user role
    if (role === 'nurse') {
      fetchNurseTasks();
      // Still fetch others but don't show them
      fetchRmoTasks();
      fetchOtTasks();
    } else if (role === 'rmo') {
      fetchRmoTasks();
      fetchNurseTasks();
      fetchOtTasks();
    } else if (role === 'ot' || role === 'ot staff') {
      fetchOtTasks();
      fetchNurseTasks();
      fetchRmoTasks();
    } else {
      // Unknown role, fetch all
      fetchNurseTasks();
      fetchRmoTasks();
      fetchOtTasks();
    }
  }, [userRole, ipdNumber]);

  // Handle completing a task
  const handleCompleteTask = async (taskId, tableName) => {
    try {
      setCompletingTask(taskId);
      
      const currentTimestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
      
      const updateData = { actual1: currentTimestamp };
      
      if (tableName === 'nurse_assign_task') {
        updateData.status = 'Completed';
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state based on active tab
      if (activeTab === 'nurse') {
        setNurseTasks(prev => prev.filter(task => task.id !== taskId));
      } else if (activeTab === 'rmo') {
        setRmoTasks(prev => prev.filter(task => task.id !== taskId));
      } else if (activeTab === 'ot') {
        setOtTasks(prev => prev.filter(task => task.id !== taskId));
      }

      alert('Task marked as completed successfully!');
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    } finally {
      setCompletingTask(null);
    }
  };

  // Get current tasks based on active tab
  const getCurrentTasks = () => {
    if (activeTab === 'nurse') return nurseTasks;
    if (activeTab === 'rmo') return rmoTasks;
    if (activeTab === 'ot') return otTasks;
    return [];
  };

  // Filter tasks based on search
  const getFilteredTasks = () => {
    const tasks = getCurrentTasks();
    
    return tasks.filter(task => {
      return (
        task.task_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.ipd_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  const getCurrentLoading = () => {
    if (activeTab === 'nurse') return loading.nurse;
    if (activeTab === 'rmo') return loading.rmo;
    if (activeTab === 'ot') return loading.ot;
    return false;
  };

  const getTableName = () => {
    if (activeTab === 'nurse') return 'nurse_assign_task';
    if (activeTab === 'rmo') return 'rmo_assign_task';
    if (activeTab === 'ot') return 'nurse_assign_task';
    return '';
  };

  const availableTabs = getAvailableTabs();
  const filteredTasks = getFilteredTasks();
  const currentLoading = getCurrentLoading();

  // Don't show loading spinner for all tabs, only for the current role's tab
  const showLoading = (loading.nurse && activeTab === 'nurse') || 
                     (loading.rmo && activeTab === 'rmo') || 
                     (loading.ot && activeTab === 'ot');

  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading {activeTab} tasks...</p>
          {ipdNumber && (
            <p className="text-sm text-gray-500 mt-1">For IPD: {ipdNumber}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-green-600 text-white p-4 rounded-b-lg shadow-md">
        <div className="flex flex-col gap-4">
          {/* Title and Icon */}
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">Task Completion</h1>
              <p className="text-xs opacity-90 mt-1 truncate">
                {ipdNumber && ipdNumber !== 'N/A' 
                  ? `${userRole ? userRole.toUpperCase() + ' - ' : ''}IPD: ${ipdNumber}` 
                  : userRole 
                    ? `${userRole.toUpperCase()} Tasks`
                    : 'Complete assigned tasks'}
              </p>
            </div>
          </div>

          {/* Search Bar - Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {showMobileSearch ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-green-300 text-white text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowMobileSearch(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowMobileSearch(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm w-full"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-green-300 truncate">Search tasks...</span>
                    {searchTerm && (
                      <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {filteredTasks.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation - Horizontal Scroll on Mobile */}
          {availableTabs.length > 0 && (
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <div className="flex gap-1 min-w-max">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? 'bg-white text-green-600'
                        : 'text-white hover:bg-white/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-5 ${
                      activeTab === tab.key ? 'bg-green-600 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Height Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden mt-2">
        {/* Desktop Table View */}
        <div className="hidden md:block h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTasks.length > 0 ? (
            <div className="h-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Action</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Patient</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">IPD No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Task</th>
                    {activeTab === 'nurse' && (
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Nurse</th>
                    )}
                    {activeTab === 'rmo' && (
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">RMO</th>
                    )}
                    {activeTab === 'ot' && (
                      <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Staff</th>
                    )}
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Shift</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Ward</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Bed</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Start Date</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCompleteTask(task.id, getTableName())}
                          disabled={completingTask === task.id}
                          className={`flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors ${
                            completingTask === task.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {completingTask === task.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Complete
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">{task.task_no}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{task.patient_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-700">{task.ipd_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{task.task}</div>
                        {task.reminder && (
                          <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                            {task.reminder}
                          </div>
                        )}
                      </td>
                      {activeTab === 'nurse' && (
                        <td className="px-4 py-3 text-gray-700">{task.assign_nurse}</td>
                      )}
                      {activeTab === 'rmo' && (
                        <td className="px-4 py-3 text-gray-700">{task.assign_rmo}</td>
                      )}
                      {activeTab === 'ot' && (
                        <td className="px-4 py-3 text-gray-700">{task.staff || task.assign_nurse}</td>
                      )}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {task.shift}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{task.ward_type}</td>
                      <td className="px-4 py-3 text-gray-700">{task.bed_no}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500">
                          {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-4">
              {activeTab === 'nurse' && <User className="w-12 h-12 text-gray-300 mb-3" />}
              {activeTab === 'rmo' && <Stethoscope className="w-12 h-12 text-gray-300 mb-3" />}
              {activeTab === 'ot' && <Scissors className="w-12 h-12 text-gray-300 mb-3" />}
              <p className="text-gray-600 font-medium text-center">
                No pending {activeTab === 'nurse' ? 'nurse' : activeTab === 'rmo' ? 'RMO' : 'OT'} tasks found
              </p>
              <p className="text-gray-500 text-xs text-center mt-1 max-w-md">
                {ipdNumber && ipdNumber !== 'N/A'
                  ? `No ${activeTab === 'nurse' ? 'nurse' : activeTab === 'rmo' ? 'RMO' : 'OT'} tasks found for IPD: ${ipdNumber}`
                  : searchTerm 
                    ? 'No tasks match your search' 
                    : 'All tasks are completed or no tasks assigned'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Card View - Fixed Scrollable Area */}
        <div className="md:hidden h-full overflow-hidden">
          {filteredTasks.length > 0 ? (
            <div className="h-full overflow-y-auto pb-20">
              <div className="p-2 space-y-2">
                {/* Results count indicator */}
                <div className="px-2 py-1 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Showing <span className="font-semibold">{filteredTasks.length}</span> task{filteredTasks.length !== 1 ? 's' : ''}
                    {searchTerm && (
                      <span> for "<span className="font-semibold">{searchTerm}</span>"</span>
                    )}
                  </p>
                </div>

                {/* Task Cards */}
                {filteredTasks.map((task) => (
                  <MobileTaskCard
                    key={task.id}
                    task={task}
                    activeTab={activeTab}
                    onComplete={handleCompleteTask}
                    completingTask={completingTask}
                    getTableName={getTableName}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-center">
                {activeTab === 'nurse' && <User className="w-16 h-16 text-gray-300 mb-4 mx-auto" />}
                {activeTab === 'rmo' && <Stethoscope className="w-16 h-16 text-gray-300 mb-4 mx-auto" />}
                {activeTab === 'ot' && <Scissors className="w-16 h-16 text-gray-300 mb-4 mx-auto" />}
                <p className="text-gray-600 font-medium text-center text-sm">
                  No pending {activeTab === 'nurse' ? 'nurse' : activeTab === 'rmo' ? 'RMO' : 'OT'} tasks found
                </p>
                <p className="text-gray-500 text-xs text-center mt-2">
                  {ipdNumber && ipdNumber !== 'N/A'
                    ? `No tasks found for IPD: ${ipdNumber}`
                    : searchTerm 
                      ? 'No tasks match your search' 
                      : 'All tasks are completed'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Info Bar */}
      {showMobileSearch && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-600 text-white p-3 border-t border-green-500 z-20">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-medium">{filteredTasks.length}</span> tasks found
            </div>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-lg"
            >
              <X className="w-3 h-3" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}