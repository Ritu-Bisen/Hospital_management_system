import React, { useState, useEffect, useCallback } from 'react';
import {
    Award,
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    BarChart3,
    Eye,
    RefreshCw
} from 'lucide-react';
import supabase from '../../../SupabaseClient';
import CompleteDetail from './CompleteDetail';

const ScoreDashboard = () => {
    const [nurseStats, setNurseStats] = useState([]);
    const [summary, setSummary] = useState({
        totalTasks: 0,
        totalCompleted: 0,
        pendingTasks: 0,
        uniqueNurses: 0,
        avgScore: 0,
        topPerformer: 'N/A'
    });
    const [loading, setLoading] = useState(true);
    const [selectedNurse, setSelectedNurse] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            
            // Fetch summary data directly from Supabase
            const [
                totalTasksResult,
                pendingTasksResult,
                completedTasksResult,
                uniqueNursesResult,
                nurseStatsResult
            ] = await Promise.all([
                supabase
                    .from('nurse_assign_task')
                    .select('id', { count: 'exact', head: true }),
                
                supabase
                    .from('nurse_assign_task')
                    .select('id', { count: 'exact', head: true })
                    .not('planned1', 'is', null)
                    .is('actual1', null),
                
                supabase
                    .from('nurse_assign_task')
                    .select('id', { count: 'exact', head: true })
                    .not('planned1', 'is', null)
                    .not('actual1', 'is', null),
                
                supabase
                    .from('nurse_assign_task')
                    .select('assign_nurse')
                    .not('assign_nurse', 'is', null)
                    .neq('assign_nurse', ''),
                
                supabase
                    .from('nurse_assign_task')
                    .select('*')
                    .not('assign_nurse', 'is', null)
                    .neq('assign_nurse', '')
            ]);

            // Extract counts from results
            const totalTasks = totalTasksResult.count || 0;
            const pendingTasks = pendingTasksResult.count || 0;
            const completedTasks = completedTasksResult.count || 0;
            
            // Get unique nurses from assign_nurse column
            const uniqueNurses = new Set();
            if (uniqueNursesResult.data) {
                uniqueNursesResult.data.forEach(task => {
                    if (task.assign_nurse && task.assign_nurse.trim() !== '') {
                        uniqueNurses.add(task.assign_nurse.trim());
                    }
                });
            }

            // Calculate nurse statistics for the table
            const nurseStatsMap = new Map();
            
            if (nurseStatsResult.data) {
                nurseStatsResult.data.forEach(task => {
                    if (!task.assign_nurse || task.assign_nurse.trim() === '') return;
                    
                    const nurseName = task.assign_nurse.trim();
                    
                    if (!nurseStatsMap.has(nurseName)) {
                        nurseStatsMap.set(nurseName, {
                            name: nurseName,
                            total: 0,
                            completed: 0,
                            pending: 0,
                            shifts: new Set(),
                            score: 0
                        });
                    }
                    
                    const stats = nurseStatsMap.get(nurseName);
                    stats.total += 1;
                    
                    // Check if task is completed
                    if (task.planned1 && task.actual1) {
                        stats.completed += 1;
                    }
                    // Check if task is pending
                    else if (task.planned1 && !task.actual1) {
                        stats.pending += 1;
                    }
                    
                    // Track shifts
                    if (task.shift) {
                        stats.shifts.add(task.shift);
                    }
                });
                
                // Calculate performance score and format shifts for each nurse
                const formattedNurseStats = Array.from(nurseStatsMap.values()).map(stat => {
                    // Calculate performance score (completed/total * 100)
                    const score = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                    
                    // Format shifts as string
                    const shiftsArray = Array.from(stat.shifts);
                    const shifts = shiftsArray.length > 0 
                        ? shiftsArray.slice(0, 2).join(', ') + (shiftsArray.length > 2 ? '...' : '')
                        : 'N/A';
                    
                    return {
                        ...stat,
                        shifts,
                        score
                    };
                });
                
                // Sort by score (highest first)
                formattedNurseStats.sort((a, b) => b.score - a.score);
                
                setNurseStats(formattedNurseStats);
                
                // Find top performer
                const topPerformer = formattedNurseStats.length > 0 
                    ? formattedNurseStats[0].name 
                    : 'N/A';
                
                // Calculate average score
                const avgScore = formattedNurseStats.length > 0
                    ? Math.round(formattedNurseStats.reduce((sum, stat) => sum + stat.score, 0) / formattedNurseStats.length)
                    : 0;
                
                setSummary({
                    totalTasks,
                    totalCompleted: completedTasks,
                    pendingTasks,
                    uniqueNurses: uniqueNurses.size,
                    avgScore,
                    topPerformer
                });

                setLastUpdated(new Date().toLocaleTimeString());
            }
            
        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setSummary({
                totalTasks: 0,
                totalCompleted: 0,
                pendingTasks: 0,
                uniqueNurses: 0,
                avgScore: 0,
                topPerformer: 'N/A'
            });
            setNurseStats([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const handleViewNurseTasks = (nurseName) => {
        setSelectedNurse(nurseName);
    };

    const handleCloseCompleteDetail = () => {
        setSelectedNurse(null);
    };

    useEffect(() => {
        // Initial fetch
        fetchDashboardData();
        
        // No automatic refresh interval - manual refresh only
    }, [fetchDashboardData]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getProgressBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleManualRefresh = () => {
        if (!isRefreshing) {
            fetchDashboardData();
        }
    };

    if (loading && !isRefreshing) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* CompleteDetail Modal */}
            {selectedNurse && (
                <CompleteDetail 
                    nurseName={selectedNurse}
                    onClose={handleCloseCompleteDetail}
                />
            )}

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Award className="w-8 h-8 text-green-600" />
                            Nurse Performance Scoreboard
                        </h1>
                        <p className="text-gray-500 mt-1">Real-time performance metrics based on task completion</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Last Updated: {lastUpdated}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.totalTasks}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg text-green-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.pendingTasks}</h3>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.totalCompleted}</h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Nurses</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.uniqueNurses}</h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Average Score Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Average Performance Score</p>
                                <h3 className={`text-2xl font-bold mt-2 ${getScoreColor(summary.avgScore).split(' ')[0]}`}>
                                    {summary.avgScore}%
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Average completion rate across all nurses</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg text-blue-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Performance</span>
                                <span>{summary.avgScore}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${getProgressBarColor(summary.avgScore)}`}
                                    style={{ width: `${summary.avgScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Top Performer</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{summary.topPerformer}</h3>
                                <p className="text-xs text-gray-400 mt-1">Highest task completion rate</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-yellow-600">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            {nurseStats.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Completion Rate</span>
                                            <span>{nurseStats[0]?.score || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${getProgressBarColor(nurseStats[0]?.score || 0)}`}
                                                style={{ width: `${nurseStats[0]?.score || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Score Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Staff Performance Rankings</h2>
                        <button 
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 w-16">Rank</th>
                                    <th className="px-6 py-4">Nurse Name</th>
                                    <th className="px-6 py-4">Assigned Shift</th>
                                    <th className="px-6 py-4 text-center">Total Tasks</th>
                                    <th className="px-6 py-4 text-center">Completed</th>
                                    <th className="px-6 py-4 text-center">Pending</th>
                                    <th className="px-6 py-4 w-1/4">Performance Score</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {nurseStats.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            No nurse data available. Tasks need to be assigned to nurses.
                                        </td>
                                    </tr>
                                ) : (
                                    nurseStats.map((stat, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{stat.name}</span>
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                                                            Top Performer
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{stat.shifts}</td>
                                            <td className="px-6 py-4 text-center font-medium">{stat.total}</td>
                                            <td className="px-6 py-4 text-center text-green-600 font-bold">{stat.completed}</td>
                                            <td className="px-6 py-4 text-center text-orange-500 font-medium">{stat.pending}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressBarColor(stat.score)}`}
                                                            style={{ width: `${stat.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getScoreColor(stat.score)}`}>
                                                        {stat.score}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewNurseTasks(stat.name)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreDashboard;