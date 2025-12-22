import React, { useState, useEffect } from 'react';
import { FileText, Eye, Search, Download, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import supabase from '../../../SupabaseClient';

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColors()}`}>
      {status}
    </span>
  );
};

export default function Lab() {
  const { data } = useOutletContext();
  const [activeTab, setActiveTab] = useState('complete');
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportImage, setSelectedReportImage] = useState(null);

  // Fetch lab data from Supabase
  const fetchLabData = async () => {
    if (!data) return;
    
    try {
      setLoading(true);
      const ipdNumber = data.personalInfo.ipd;
      
      if (!ipdNumber || ipdNumber === 'N/A') {
        console.warn('No IPD number available for fetching lab data');
        return;
      }

      const { data: supabaseLabData, error } = await supabase
        .from('lab')
        .select('*')
        .or(`ipd_number.eq.${ipdNumber},admission_no.eq.${ipdNumber}`)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching lab data:', error);
        return;
      }

      const transformedData = (supabaseLabData || []).map(lab => {
        let pathologyTests = [];
        let radiologyTests = [];
        
        try {
          if (lab.pathology_tests) {
            pathologyTests = Array.isArray(lab.pathology_tests) 
              ? lab.pathology_tests 
              : JSON.parse(lab.pathology_tests);
          }
          if (lab.radiology_tests) {
            radiologyTests = Array.isArray(lab.radiology_tests)
              ? lab.radiology_tests
              : JSON.parse(lab.radiology_tests);
          }
        } catch (e) {
          console.warn('Error parsing tests JSON:', e);
        }

        const isCompleted = lab.actual2 !== null;
        const isPending = lab.planned2 !== null && lab.actual2 === null;

        return {
          adviceId: `LAB-${lab.id}`,
          admissionNo: lab.admission_no || ipdNumber,
          adviceNo: lab.lab_no || `LAB-${lab.id}`,
          patientName: lab.patient_name || data.personalInfo.name,
          phone: lab.phone_no || '',
          reason: lab.reason_for_visit || '',
          age: lab.age || data.personalInfo.age,
          bedNo: lab.bed_no || data.departmentInfo?.bedNumber || '',
          location: lab.location || data.departmentInfo?.ward || '',
          priority: lab.priority || 'Medium',
          category: lab.category || '',
          tests: [...pathologyTests, ...radiologyTests],
          remarks: lab.remarks || '',
          status: lab.status || (isCompleted ? 'Completed' : 'Pending'),
          requestDate: lab.timestamp ? new Date(lab.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          reportUrl: lab.report_url || null,
          supabaseData: lab,
          isPending: isPending,
          isCompleted: isCompleted
        };
      });

      const pending = transformedData.filter(item => item.isPending);
      const history = transformedData.filter(item => item.isCompleted);

      setPendingList(pending);
      setHistoryList(history);

    } catch (err) {
      console.error('Error in fetchLabData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      fetchLabData();
    }
  }, [data]);

  const getFilteredTasks = () => {
    const tasks = activeTab === 'complete' ? historyList : pendingList;
    
    return tasks.filter(task => {
      const matchesSearch = 
        task.adviceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const handleViewReport = (reportUrl) => {
    if (!reportUrl) {
      alert('No report available');
      return;
    }
    setSelectedReportImage(reportUrl);
    setShowReportModal(true);
  };

  if (!data) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading lab data...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
      {/* Header Section - FIXED DASHBOARD VIEW */}
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-md flex-shrink-0">
        {/* Desktop View - Everything inline in one row */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side: Title and icon */}
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Laboratory Tests</h1>
              <p className="text-xs opacity-90 mt-1">
                {data.personalInfo.name} - UHID: {data.personalInfo.uhid}
              </p>
            </div>
          </div>
          
          {/* Right side: Tabs, Search, Filter - ALL INLINE */}
          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('complete')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'complete'
                    ? 'bg-white text-green-600'
                    : 'text-white hover:bg-white/30'
                }`}
              >
                Complete ({historyList.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-white text-green-600'
                    : 'text-white hover:bg-white/30'
                }`}
              >
                Pending ({pendingList.length})
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 pl-9 pr-3 py-2 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-green-300 text-white text-sm"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white text-sm"
            >
              <option value="all" className="text-gray-900">All Categories</option>
              <option value="Pathology" className="text-gray-900">Pathology</option>
              <option value="Radiology" className="text-gray-900">Radiology</option>
            </select>
          </div>
        </div>

        {/* Mobile View - Stacked layout */}
        <div className="md:hidden">
          <div className="flex flex-col gap-3">
            {/* Title Row */}
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">Laboratory Tests</h1>
                <p className="text-xs opacity-90 mt-1">
                  {data.personalInfo.name} - UHID: {data.personalInfo.uhid}
                </p>
              </div>
            </div>

            {/* Tabs, Search and Filter - Compact layout */}
            <div className="flex flex-col gap-2">
              {/* Small Tabs */}
              <div className="flex items-center bg-white/20 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('complete')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'complete'
                      ? 'bg-white text-green-600'
                      : 'text-white hover:bg-white/30'
                  }`}
                >
                  Complete ({historyList.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-white text-green-600'
                      : 'text-white hover:bg-white/30'
                  }`}
                >
                  Pending ({pendingList.length})
                </button>
              </div>
              
              {/* Search, Filter in same row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-300 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-green-300 text-white text-xs"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-1.5 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white text-xs w-24"
                >
                  <option value="all" className="text-gray-900">All</option>
                  <option value="Pathology" className="text-gray-900">Pathology</option>
                  <option value="Radiology" className="text-gray-900">Radiology</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex-1 min-h-0 mt-2">
        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTasks.length > 0 ? (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {filteredTasks.map((task, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-green-600 text-sm">{task.adviceNo}</h3>
                        <p className="text-sm font-medium text-gray-900 mt-1">{task.patientName}</p>
                        <p className="text-xs text-gray-500">Age: {task.age} | IPD: {task.admissionNo}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    
                    <div className="space-y-3">
                      {/* Priority and Category */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {task.category}
                        </span>
                      </div>
                      
                      {/* Reason */}
                      {task.reason && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Reason: </span>
                          <span className="text-gray-600">{task.reason}</span>
                        </div>
                      )}
                      
                      {/* Tests */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Tests: </span>
                        <span className="text-gray-600">
                          {(task.tests || []).slice(0, 3).join(', ')}
                          {(task.tests || []).length > 3 && ` +${(task.tests || []).length - 3} more`}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Bed:</span> {task.bedNo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {task.location || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Date and Phone */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {task.requestDate}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {task.phone || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Report Actions */}
                      {task.reportUrl && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewReport(task.reportUrl)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Eye className="w-3 h-3" />
                              View Report
                            </button>
                            <a
                              href={task.reportUrl}
                              download
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium text-sm">
                  {activeTab === 'complete' ? 'No completed lab tests found' : 'No pending lab tests found'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {searchTerm ? 'No tests match your search' : 
                    activeTab === 'complete' ? 'No completed tests available' : 'No pending tests available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block flex-1 min-h-0 mt-2">
        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTasks.length > 0 ? (
            <div className="h-full overflow-auto" style={{ maxHeight: '100%' }}>
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">LAB NO</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PATIENT</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PHONE</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">REASON</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">BED NO</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">LOCATION</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">PRIORITY</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">CATEGORY</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">TESTS</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">DATE</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">STATUS</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">VIEW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">{task.adviceNo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{task.patientName}</div>
                        <div className="text-xs text-gray-500">Age: {task.age}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700">{task.phone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 truncate max-w-xs">{task.reason}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{task.bedNo || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 truncate max-w-xs">{task.location || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{task.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {(task.tests || []).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500">{task.requestDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3">
                        {task.reportUrl ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewReport(task.reportUrl)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={task.reportUrl}
                              download
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No Report</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium text-sm">
                  {activeTab === 'complete' ? 'No completed lab tests found' : 'No pending lab tests found'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {searchTerm ? 'No tests match your search' : 
                    activeTab === 'complete' ? 'No completed tests available' : 'No pending tests available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Image Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lab Report</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportImage(null);
                }}
                className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {selectedReportImage ? (
                <div className="space-y-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={selectedReportImage}
                      alt="Lab Report"
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5SZXBvcnQgSW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Image URL: </span>
                      <a 
                        href={selectedReportImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {selectedReportImage}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={selectedReportImage}
                        download="lab-report.jpg"
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4 text-gray-400">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No report image available</p>
                  <p className="text-gray-500 text-sm">The lab report image could not be loaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}