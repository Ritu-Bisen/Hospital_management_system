import React from 'react';
import { ArrowLeft, Stethoscope, CheckCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

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

export default function RMOTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const data = location.state?.data;

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

  // Sample RMO tasks
  const rmoTasks = [
    { id: 1, task: 'Initial Patient Assessment', status: 'Completed', time: '08:00 AM', dueDate: new Date().toISOString().split('T')[0] },
    { id: 2, task: 'Review Lab Reports', status: 'Pending', time: 'N/A', dueDate: new Date().toISOString().split('T')[0] },
    { id: 3, task: 'Update Treatment Plan', status: 'Pending', time: 'N/A', dueDate: new Date().toISOString().split('T')[0] },
    { id: 4, task: 'Prescription Orders', status: 'Pending', time: 'N/A', dueDate: new Date().toISOString().split('T')[0] },
    { id: 5, task: 'Patient Round Visit', status: 'In Progress', time: '10:30 AM', dueDate: new Date().toISOString().split('T')[0] },
  ];

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
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">RMO Tasks</h1>
              <p className="text-sm opacity-90 mt-1">{data.personalInfo.name} - {data.personalInfo.uhid}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* RMO Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned RMO</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{data.staffAssigned?.rmo?.name || 'To be assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-semibold text-gray-900">{data.staffAssigned?.rmo?.designation || 'Resident Medical Officer'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold text-gray-900">{data.staffAssigned?.rmo?.contact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assigned Date</p>
                  <p className="font-semibold text-gray-900">{data.staffAssigned?.rmo?.assignedDate || new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RMO Tasks List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Tasks</h3>
            <div className="space-y-3">
              {rmoTasks.map((task) => (
                <div key={task.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 mt-0.5 ${task.status === 'Completed' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-900">{task.task}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <div><span className="font-medium">Time:</span> {task.time}</div>
                          <div><span className="font-medium">Due Date:</span> {task.dueDate}</div>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
