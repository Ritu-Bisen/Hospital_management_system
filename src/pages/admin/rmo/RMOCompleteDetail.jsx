import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    ClipboardList,
    CheckCircle,
    AlertCircle,
    Calendar,
    Bed,
    Users,
    Home,
    Award,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';
import supabase from '../../../SupabaseClient';

const RMOCompleteDetail = ({ nurseName, onClose }) => {
    const [rmoTasks, setRmoTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({
        totalTasks: 0,
        completed: 0,
        pending: 0,
        completionRate: 0
    });
    const [lastUpdated, setLastUpdated] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchRmoTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: tasksData, error } = await supabase
                .from('rmo_assign_task')
                .select('*')
                .eq('assign_rmo', nurseName)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            if (tasksData) {
                const formattedTasks = tasksData.map(task => ({
                    id: task.id,
                    taskId: task.task_no || `TASK-${task.id.toString().padStart(4, '0')}`,
                    status: task.planned1 && task.actual1 ? 'Completed' : 'Pending',
                    patientName: task.patient_name || 'N/A',
                    patientLocation: task.patient_location || 'N/A',
                    bedNo: task.bed_no || 'N/A',
                    shift: task.shift || 'N/A',
                    taskName: task.task || 'N/A',
                    startDate: task.start_date || 'N/A',
                    planned1: task.planned1,
                    planned1Date: task.planned1 ? new Date(task.planned1).toLocaleDateString('en-GB') : 'N/A',
                    planned1Time: task.planned1 ? new Date(task.planned1).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }) : 'N/A',
                    actual1: task.actual1,
                    actual1Date: task.actual1 ? new Date(task.actual1).toLocaleDateString('en-GB') : 'N/A',
                    actual1Time: task.actual1 ? new Date(task.actual1).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }) : 'N/A',
                    reminder: task.reminder || 'No',
                    wardType: task.ward_type || 'N/A',
                    room: task.room || 'N/A',
                    ipdNumber: task.Ipd_number || 'N/A',
                }));

                setRmoTasks(formattedTasks);

                const completedTasks = formattedTasks.filter(task => task.status === 'Completed').length;
                const pendingTasks = formattedTasks.filter(task => task.status === 'Pending').length;
                const totalTasks = formattedTasks.length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                setSummary({
                    totalTasks,
                    completed: completedTasks,
                    pending: pendingTasks,
                    completionRate
                });

                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error("Error fetching RMO tasks:", error);
            setError("Failed to load RMO tasks. Please try again.");
            setRmoTasks([]);
        } finally {
            setLoading(false);
        }
    }, [nurseName]);

    useEffect(() => {
        if (nurseName) {
            fetchRmoTasks();
        }
    }, [nurseName, fetchRmoTasks]);

    const filteredTasks = rmoTasks.filter(task => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'completed') return task.status === 'Completed';
        if (activeFilter === 'pending') return task.status === 'Pending';
        return true;
    });

    const getStatusColor = (status) => {
        if (status === 'Completed') return 'bg-green-100 text-green-800 border-green-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const getShiftColor = (shift) => {
        switch (shift) {
            case 'Shift-A': return 'bg-blue-100 text-blue-800';
            case 'Shift-B': return 'bg-green-100 text-green-800';
            case 'Shift-C': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFilterButtonClass = (filter) => {
        const baseClass = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
        return activeFilter === filter
            ? `${baseClass} bg-blue-600 text-white`
            : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading RMO tasks for {nurseName}...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-7xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">RMO Task Details for {nurseName}</h2>
                            <p className="text-sm text-gray-600">Complete RMO task history and performance</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-gray-600">{error}</p>
                            <button
                                onClick={fetchRmoTasks}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Total RMO Tasks</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{summary.totalTasks}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Completed</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{summary.completed}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-8 h-8 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Pending</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{summary.pending}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                            <h3 className="text-2xl font-bold text-gray-900">{summary.completionRate}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Chart */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        RMO Performance Overview
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor('Completed').replace('bg-', 'bg-opacity-20 ')}`}>
                                        {summary.completionRate}% Success Rate
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                                        style={{ width: `${summary.completionRate}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-sm text-gray-600">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">RMO Task Filters</h3>
                                    <div className="text-sm text-gray-600">
                                        Showing {filteredTasks.length} of {rmoTasks.length} RMO tasks
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => setActiveFilter('all')}
                                        className={getFilterButtonClass('all')}
                                    >
                                        All RMO Tasks ({rmoTasks.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveFilter('completed')}
                                        className={getFilterButtonClass('completed')}
                                    >
                                        <CheckCircle className="w-4 h-4 inline mr-1" />
                                        Completed ({summary.completed})
                                    </button>
                                    <button
                                        onClick={() => setActiveFilter('pending')}
                                        className={getFilterButtonClass('pending')}
                                    >
                                        <AlertCircle className="w-4 h-4 inline mr-1" />
                                        Pending ({summary.pending})
                                    </button>
                                </div>
                            </div>

                            {/* Simple Tasks Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {activeFilter === 'all' ? 'All RMO Tasks' :
                                            activeFilter === 'completed' ? 'Completed RMO Tasks' : 'Pending RMO Tasks'}
                                        ({filteredTasks.length})
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        Last updated: {lastUpdated}
                                    </div>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-sm">Task ID</th>
                                                <th className="px-4 py-3 text-sm">Status</th>
                                                <th className="px-4 py-3 text-sm">Shift</th>
                                                <th className="px-4 py-3 text-sm">Patient Details</th>
                                                <th className="px-4 py-3 text-sm">Planned Task</th>
                                                <th className="px-4 py-3 text-sm">Actual Task</th>
                                                <th className="px-4 py-3 text-sm">RMO Task Details</th>
                                                <th className="px-4 py-3 text-sm">Start Date</th>
                                                <th className="px-4 py-3 text-sm">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredTasks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                                                        No {activeFilter === 'all' ? '' : activeFilter} RMO tasks found for {nurseName}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredTasks.map((task) => (
                                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-blue-600">{task.taskId}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getShiftColor(task.shift)}`}>
                                                                {task.shift}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <div className="font-medium">{task.patientName}</div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    <div>Bed: {task.bedNo}</div>
                                                                    <div>IPD: {task.ipdNumber}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-700">
                                                            {task.planned1Date} {task.planned1Time}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-green-700">
                                                            {task.actual1Date} {task.actual1Time}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium">{task.taskName}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Reminder: {task.reminder}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                {task.startDate}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="space-y-1 text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <Home className="w-3 h-3 text-gray-400" />
                                                                    {task.patientLocation}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {task.wardType} • {task.room}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing {filteredTasks.length} of {rmoTasks.length} RMO tasks for {nurseName}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RMOCompleteDetail;