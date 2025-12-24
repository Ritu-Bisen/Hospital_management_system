import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Home, Building, Activity, Calendar, UserCog, Stethoscope, UserPlus, ClipboardCheck } from 'lucide-react';
import supabase from '../../../SupabaseClient';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientAdmissionCount: 0,
    ipdAdmissionCount: 0,
    wardDistribution: [],
    departmentDistribution: [],
    genderDistribution: [],
    admissionTrends: [],
    activePatients: 0,
    dischargedPatients: 0,
    doctorCount: 0,
    nurseCount: 0,
    rmoCount: 0,
    otStaffCount: 0
  });

  // Function to get color based on index
  const getChartColor = (index) => {
    const colors = [
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EF4444', // Red
      '#F59E0B', // Yellow
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ];
    return colors[index % colors.length];
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Helper function to process distribution data
  const processDistributionData = (data, field) => {
    const distribution = {};
    
    data?.forEach(item => {
      const value = item[field];
      if (value) {
        distribution[value] = (distribution[value] || 0) + 1;
      }
    });

    return Object.entries(distribution).map(([name, count]) => ({
      name,
      count,
      percentage: calculatePercentage(count, data?.length || 0)
    }));
  };

  // Format date for display (e.g., "Mon 15")
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  };

  // Get admission trends for last 7 days
  const getAdmissionTrends = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today

      // Format dates for Supabase query
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      // Get daily admissions from patient_admission
      const { data: patientAdmissions, error } = await supabase
        .from('patient_admission')
        .select('timestamp')
        .gte('timestamp', `${startDate}T00:00:00`)
        .lte('timestamp', `${endDate}T23:59:59`);

      if (error) throw error;

      // Generate dates for last 7 days
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Count admissions per day
      const dailyCounts = {};
      patientAdmissions?.forEach(admission => {
        const date = admission.timestamp.split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      // Format for chart
      return dates.map(date => ({
        date: formatDateForDisplay(date),
        count: dailyCounts[date] || 0
      }));

    } catch (error) {
      console.error('Error fetching admission trends:', error);
      return [];
    }
  };

  // Calculate pie chart segments for gender distribution
  const calculatePieChartSegments = (genderDistribution) => {
    const total = genderDistribution.reduce((sum, gender) => sum + gender.percentage, 0);
    let accumulatedPercentage = 0;
    
    return genderDistribution.map((gender, index) => {
      const segment = {
        name: gender.name,
        count: gender.count,
        percentage: gender.percentage,
        start: accumulatedPercentage,
        end: accumulatedPercentage + (gender.percentage / total * 360)
      };
      accumulatedPercentage = segment.end;
      return segment;
    });
  };

  // Fetch staff counts from all_staff table
  const fetchStaffCounts = async () => {
    try {
      // Fetch doctors count
      const { count: doctorCount, error: doctorError } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true })
      

      // Fetch nurses count
      const { count: nurseCount, error: nurseError } = await supabase
        .from('all_staff')
        .select('*', { count: 'exact', head: true })
        .eq('designation', 'Staff Nurse');

      // Fetch RMO count
      const { count: rmoCount, error: rmoError } = await supabase
        .from('all_staff')
        .select('*', { count: 'exact', head: true })
        .eq('designation', 'RMO');

      // Fetch OT staff count
      const { count: otStaffCount, error: otStaffError } = await supabase
        .from('all_staff')
        .select('*', { count: 'exact', head: true })
        .eq('designation', 'OT STAFF');

      if (doctorError || nurseError || rmoError || otStaffError) {
        console.error('Error fetching staff counts:', { doctorError, nurseError, rmoError, otStaffError });
        return { doctorCount: 0, nurseCount: 0, rmoCount: 0, otStaffCount: 0 };
      }

      return {
        doctorCount: doctorCount || 0,
        nurseCount: nurseCount || 0,
        rmoCount: rmoCount || 0,
        otStaffCount: otStaffCount || 0
      };

    } catch (error) {
      console.error('Error in fetchStaffCounts:', error);
      return { doctorCount: 0, nurseCount: 0, rmoCount: 0, otStaffCount: 0 };
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch patient_admission count
      const { count: patientAdmissionCount, error: patientError } = await supabase
        .from('patient_admission')
        .select('*', { count: 'exact', head: true });

      // Fetch ipd_admissions count
      const { count: ipdAdmissionCount, error: ipdError } = await supabase
        .from('ipd_admissions')
        .select('*', { count: 'exact', head: true });

      // Fetch ward distribution (from ipd_admissions)
      const { data: wardData, error: wardError } = await supabase
        .from('ipd_admissions')
        .select('ward_type')
        .not('ward_type', 'is', null);

      // Fetch department distribution (from ipd_admissions)
      const { data: departmentData, error: departmentError } = await supabase
        .from('ipd_admissions')
        .select('department')
        .not('department', 'is', null);

      // Fetch gender distribution (from patient_admission)
      const { data: genderData, error: genderError } = await supabase
        .from('patient_admission')
        .select('gender')
        .not('gender', 'is', null);

      // Fetch planned1 and actual1 for active/discharged patients (from ipd_admissions)
      const { data: ipdStatusData, error: ipdStatusError } = await supabase
        .from('ipd_admissions')
        .select('planned1, actual1');

      // Fetch staff counts
      const staffCounts = await fetchStaffCounts();

      if (
        patientError || ipdError || wardError || 
        departmentError || genderError || ipdStatusError
      ) {
        console.error('Error fetching dashboard data:', {
          patientError, ipdError, wardError, departmentError, genderError, ipdStatusError
        });
        return;
      }

      // Process ward distribution
      const wardDistribution = processDistributionData(wardData, 'ward_type');

      // Process department distribution
      const departmentDistribution = processDistributionData(departmentData, 'department');

      // Process gender distribution
      const genderDistribution = processDistributionData(genderData, 'gender');

      // Process active/discharged patients based on planned1 and actual1
      const activePatients = ipdStatusData?.filter(patient => 
        patient.planned1 && !patient.actual1
      ).length || 0;

      const dischargedPatients = ipdStatusData?.filter(patient => 
        patient.planned1 && patient.actual1
      ).length || 0;

      // Get admission trends (last 7 days)
      const admissionTrends = await getAdmissionTrends();

      setStats({
        patientAdmissionCount: patientAdmissionCount || 0,
        ipdAdmissionCount: ipdAdmissionCount || 0,
        wardDistribution: wardDistribution.sort((a, b) => b.count - a.count),
        departmentDistribution: departmentDistribution.sort((a, b) => b.count - a.count),
        genderDistribution,
        admissionTrends,
        activePatients,
        dischargedPatients,
        doctorCount: staffCounts.doctorCount,
        nurseCount: staffCounts.nurseCount,
        rmoCount: staffCounts.rmoCount,
        otStaffCount: staffCounts.otStaffCount
      });

    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate pie chart segments for gender distribution
  const pieSegments = calculatePieChartSegments(stats.genderDistribution);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Patient Admission Count */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stats.patientAdmissionCount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Patient Admission Table</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* IPD Admission Count */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">IPD Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stats.ipdAdmissionCount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">IPD Admission Table</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Patients */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stats.activePatients.toLocaleString()}
              </p>
              <div className="text-xs text-gray-500 mt-1">Planned ✓ | Discharged ✗</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${calculatePercentage(stats.activePatients, stats.ipdAdmissionCount)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Discharged Patients */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Discharged Patients</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                {stats.dischargedPatients.toLocaleString()}
              </p>
              <div className="text-xs text-gray-500 mt-1">Planned ✓ | Discharged ✓</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${calculatePercentage(stats.dischargedPatients, stats.ipdAdmissionCount)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <Home className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ward Distribution</h3>
              <p className="text-sm text-gray-500">Patients distributed across different wards</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <Building className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {stats.wardDistribution.length > 0 ? (
            <div className="space-y-4">
              {stats.wardDistribution.map((ward, index) => (
                <div key={ward.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{ward.name}</span>
                    <span className="font-semibold text-gray-900">
                      {ward.count} <span className="text-gray-500 font-normal">({ward.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${ward.percentage}%`,
                        backgroundColor: getChartColor(index)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No ward data available</p>
              <p className="text-gray-500 text-sm mt-1">Ward information not found in records</p>
            </div>
          )}
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Department Distribution</h3>
              <p className="text-sm text-gray-500">Patients by medical department</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {stats.departmentDistribution.length > 0 ? (
            <div className="space-y-4">
              {stats.departmentDistribution.slice(0, 8).map((dept, index) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{dept.name}</span>
                    <span className="font-semibold text-gray-900">
                      {dept.count} <span className="text-gray-500 font-normal">({dept.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${dept.percentage}%`,
                        backgroundColor: getChartColor(index)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {stats.departmentDistribution.length > 8 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{stats.departmentDistribution.length - 8} more departments
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No department data available</p>
              <p className="text-gray-500 text-sm mt-1">Department information not found in records</p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Summary Section */}
     <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
  <div className="flex flex-col md:flex-row md:items-center justify-between">
    <div>
      <h3 className="text-xl font-bold">Hospital Staff Overview</h3>
      <p className="opacity-90 mt-1">Total staff distribution across different roles</p>
    </div>
    <div className="mt-4 md:mt-0">
      <div className="text-center">
        <p className="text-2xl font-bold">
          {stats.doctorCount + stats.nurseCount + stats.rmoCount + stats.otStaffCount}
        </p>
        <p className="text-sm opacity-90 mt-1">Total Staff</p>
      </div>
    </div>
  </div>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
    <div className="text-center">
      <p className="text-2xl font-bold">{stats.doctorCount}</p>
      <p className="text-sm opacity-90 mt-1">Doctors</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold">{stats.nurseCount}</p>
      <p className="text-sm opacity-90 mt-1">Nurses</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold">{stats.rmoCount}</p>
      <p className="text-sm opacity-90 mt-1">RMOs</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold">{stats.otStaffCount}</p>
      <p className="text-sm opacity-90 mt-1">OT Staff</p>
    </div>
  </div>
</div>
    </div>
  );
}