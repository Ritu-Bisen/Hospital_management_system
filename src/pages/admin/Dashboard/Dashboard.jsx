import React, { useState } from "react";
import {
  Users,
  Bed,
  DollarSign,
  Stethoscope,
  TrendingUp,
  Clock,
  Activity,
  ChevronDown,
  ClipboardList,
  TrendingDown,
  // PersonStanding, // [UPDATED] No longer needed
} from "lucide-react";

// --- [UPDATED] Import local images ---
// This path assumes your Dashboard.jsx file is in src/pages/admin/
import womanIcon from "/src/Image/Icon/woman.png";
import manIcon from "/src/Image/Icon/Man.png";
// --- [END UPDATED] ---

// --- DUMMY DATA ---

const dashboardData = {
  totalPatients: 50876,
  patientsAdmitted: 42456,
  operationalCost: 16456,
  avgCostPerPatient: 6.2,
  avgPatientsPerDoctor: 27.46,
  patientSatisfaction: { excellent: 52, good: 20, poor: 28 },
  doctorTreatmentPlan: {
    stronglyAgree: 12,
    agree: 5,
    neutral: 50,
    disagree: 13,
    stronglyDisagree: 7,
  },
  confidenceInTreatment: {
    stronglyAgree: 17,
    agree: 75,
    neutral: 20,
    disagree: 16,
    stronglyDisagree: 16,
  },
  admissionByDivision: [
    { name: "Gynecology", value: 15 },
    { name: "Neurology", value: 18 },
    { name: "Cardiology", value: 20 },
    { name: "Surgery", value: 12 },
    { name: "Concology", value: 10 },
    { name: "Orthopaedics", value: 13 },
    { name: "Dermatology", value: 12 },
  ],
  staffPerDivision: [
    { division: "Cardiology", doctors: 21, patients: 40 },
    { division: "Concology", doctors: 22, patients: 35 },
    { division: "Dermatology", doctors: 30, patients: 44 },
    { division: "Gynaecology", doctors: 25, patients: 50 },
    { division: "Neurology", doctors: 25, patients: 42 },
    { division: "Orthopaedics", doctors: 40, patients: 47 },
    { division: "Paedrics", doctors: 25, patients: 38 },
  ],
  avgWaitTimes: [
    { division: "Cardiology", time: 40 },
    { division: "Concology", time: 35 },
    { division: "Dermatology", time: 44 },
    { division: "Gynaecology", time: 50 },
    { division: "Neurology", time: 42 },
    { division: "Orthopaedics", time: 47 },
  ],
  admissionVsCost: [
    { month: "Jan-22", admitted: 3100, outpatient: 2800, cost: 1.3 },
    { month: "Feb-22", admitted: 3200, outpatient: 3100, cost: 1.4 },
    { month: "Mar-22", admitted: 2900, outpatient: 3600, cost: 1.55 },
    { month: "Apr-22", admitted: 1600, outpatient: 3100, cost: 1.45 },
    { month: "May-22", admitted: 2900, outpatient: 3000, cost: 1.5 },
    { month: "Jun-22", admitted: 3000, outpatient: 1800, cost: 1.65 },
    { month: "Jul-22", admitted: 2800, outpatient: 2400, cost: 1.35 },
    { month: "Aug-22", admitted: 2700, outpatient: 2600, cost: 1.7 },
    { month: "Sep-22", admitted: 3200, outpatient: 2800, cost: 1.6 },
    { month: "Oct-22", admitted: 2900, outpatient: 2700, cost: 1.65 },
    { month: "Nov-22", admitted: 2400, outpatient: 3000, cost: 1.55 },
    { month: "Dec-22", admitted: 2600, outpatient: 2700, cost: 1.6 },
  ],
};

const patientRecordData = {
  totalPatient: 259,
  lastMonthChange: -14.24,
  patientInICU: 15,
  icuChange: -6.25,
  totalDiedPatient: 3,
  diedChange: -50,
  reAdmitPatient: 18,
  reAdmitChange: -5.26,
  avgDaysDischarge: 8,
  dischargeChange: 60,
  genderDistribution: { female: 140, male: 119 }, // Data source for the chart
  divisionDistribution: [
    { name: "Other", value: 99 },
    { name: "Telemetry", value: 51 },
    { name: "Orthope...", value: 45 },
    { name: "Oncology", value: 31 },
    { name: "Obstetr...", value: 20 },
    { name: "Cardiolo...", value: 16 },
    { name: "Radiatio...", value: 1 },
    { name: "Radiology", value: 1 },
  ],
  ageGroupDistribution: [
    { group: "16-30", value: 13 },
    { group: "31-45", value: 26 },
    { group: "46-60", value: 65 },
    { group: "61-75", value: 109 },
    { group: "Age Group", value: 36 },
  ],
  losBucket: [
    { range: "<1", count: 5 },
    { range: "1 to 5", count: 200 },
    { range: "6 to 10", count: 41 },
    { range: "11 to 15", count: 5 },
    { range: "16 to 20", count: 3 },
    { range: "21 to 25", count: 3 },
    { range: "31+", count: 1 },
  ],
  dischargeType: [
    { type: "Clinical Advice / consent", count: 250 },
    { type: "Discharged Themselves", count: 150 },
    { type: "Died", count: 80 },
  ],
  waitingTimeByDivision: [
    { division: "Cardiology", time: 18 },
    { division: "Obstetric...", time: 12 },
    { division: "Other", time: 15 },
    { division: "Oncology", time: 13 },
    { division: "Telemetry", time: 11 },
    { division: "Orthope...", time: 10 },
  ],
};

// --- REUSABLE COMPONENTS ---

const FilterDropdown = ({ title, value, onChange, options = [] }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {title}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 appearance-none"
      >
        <option value="All">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

const StatCard = ({ title, value, lastMonthValue, change, changeType, Icon, borderColorClass }) => {
  const isPositive = changeType === "positive";
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColorClass = isPositive ? "text-green-600" : "text-red-600";
  const changePrefix = isPositive ? "+" : "";

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${borderColorClass} p-5 flex items-center space-x-4`}>
      <div className="p-3 rounded-full bg-gray-100 hidden sm:block">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
        <div className="flex items-center text-sm">
          <ChangeIcon className={`w-4 h-4 mr-1 ${changeColorClass}`} />
          <span className={`${changeColorClass} font-medium`}>
            {changePrefix}{change}%
          </span>
          <span className="text-gray-500 ml-2">(Last Month: {lastMonthValue})</span>
        </div>
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ title, data, colorClass = "bg-green-500" }) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-20 truncate">{item.name}</span>
            <div className="flex-1 bg-gray-200 h-6 rounded">
              <div
                className={`${colorClass} h-6 rounded flex items-center justify-end px-2`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                {item.value > maxValue * 0.1 && <span className="text-white text-xs font-semibold">{item.value}</span>}
              </div>
            </div>
            {item.value <= maxValue * 0.1 && <span className="text-xs font-semibold text-gray-900 w-8">{item.value}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- [UPDATED COMPONENT] ---
// This component now uses your local .png images
const GenderChart = ({ female, male }) => {
  const maxValue = 150;
  const femaleHeightPercent = (female / maxValue) * 100;
  const maleHeightPercent = (male / maxValue) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">No of Patient by Gender</h3>

      <div className="flex h-[200px]"> {/* Set a fixed height for the chart */}

        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between text-right text-xs text-gray-500 pr-2 py-1">
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* Chart Area with Gridlines and Bars */}
        <div className="flex-1 flex justify-around items-end gap-4 border-l border-b border-gray-300 relative px-4">
          {/* Grid lines */}
          <div className="absolute w-full h-px bg-gray-200" style={{ top: '0%' }}></div>
          <div className="absolute w-full h-px bg-gray-200" style={{ top: '33.33%' }}></div>
          <div className="absolute w-full h-px bg-gray-200" style={{ top: '66.66%' }}></div>
          {/* Bottom line is the border-b */}

          {/* Female Bar */}
          <div className="w-1/3 flex flex-col items-center">
            <div
              className="w-full flex items-end justify-center relative"
              style={{ height: `${femaleHeightPercent}%` }}
            >
              {/* [UPDATED] Use <img> tag with imported womanIcon */}
              <img 
                src={womanIcon} 
                alt="Female" 
                className="h-full w-auto object-contain" 
              />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-2">Female ({female})</span>
          </div>

          {/* Male Bar */}
          <div className="w-1/3 flex flex-col items-center">
            <div
              className="w-full flex items-end justify-center relative"
              style={{ height: `${maleHeightPercent}%` }}
            >
              {/* [UPDATED] Use <img> tag with imported manIcon */}
              <img 
                src={manIcon} 
                alt="Male" 
                className="h-full w-auto object-contain" 
              />
            </div>
            <span className="text-xs font-medium text-gray-700 mt-2">Male ({male})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- [END UPDATED COMPONENT] ---

// --- DASHBOARD TABS ---

const KPIDashboard = () => {
  // Data for the "Doctor's Treatment Plan" and "Confidence in Treatment" charts
  const treatmentPlanData = [
    { label: 'Strongly Agree', value: dashboardData.doctorTreatmentPlan.stronglyAgree, color: 'bg-green-600' },
    { label: 'Agree', value: dashboardData.doctorTreatmentPlan.agree, color: 'bg-green-500' },
    { label: 'Neutral', value: dashboardData.doctorTreatmentPlan.neutral, color: 'bg-green-400' },
    { label: 'Disagree', value: dashboardData.doctorTreatmentPlan.disagree, color: 'bg-green-300' },
    { label: 'Strongly Disagree', value: dashboardData.doctorTreatmentPlan.stronglyDisagree, color: 'bg-green-200' }
  ];

  const confidenceData = [
    { label: 'Strongly Agree', value: dashboardData.confidenceInTreatment.stronglyAgree, color: 'bg-orange-500' },
    { label: 'Agree', value: dashboardData.confidenceInTreatment.agree, color: 'bg-orange-400' },
    { label: 'Neutral', value: dashboardData.confidenceInTreatment.neutral, color: 'bg-orange-300' },
    { label: 'Disagree', value: dashboardData.confidenceInTreatment.disagree, color: 'bg-orange-200' },
    { label: 'Strongly Disagree', value: dashboardData.confidenceInTreatment.stronglyDisagree, color: 'bg-orange-100' }
  ];

  const SatisfactionPieChart = ({ satisfaction }) => {
    const { poor, good, excellent } = satisfaction;
    const circumference = 2 * Math.PI * 70;
    const poorOffset = 0;
    const goodOffset = (poor / 100) * circumference;
    const excellentOffset = ((poor + good) / 100) * circumference;

    return (
      <div className="relative w-48 h-48">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle cx="90" cy="90" r="70" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray={`${(poor / 100) * circumference} ${circumference}`} transform="rotate(-90 90 90)" />
          <circle cx="90" cy="90" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${(good / 100) * circumference} ${circumference}`} strokeDashoffset={-goodOffset} transform="rotate(-90 90 90)" />
          <circle cx="90" cy="90" r="70" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray={`${(excellent / 100) * circumference} ${circumference}`} strokeDashoffset={-excellentOffset} transform="rotate(-90 90 90)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{excellent}%</span>
          <span className="text-sm text-gray-600">Excellent</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Hospital KPI Dashboard</h1>
        <p className="text-sm text-gray-600">
          An overview of key performance indicators, patient satisfaction, and operational metrics across hospital divisions.
        </p>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Bed className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Length of Stay</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full"><Users className="w-10 h-10 text-orange-500" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalPatients.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><DollarSign className="w-10 h-10 text-green-500" /></div>
            <div>
              <p className="text-sm text-gray-600">Operational Cost</p>
              <p className="text-3xl font-bold text-gray-900">${dashboardData.operationalCost.toLocaleString()}K</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full"><Stethoscope className="w-10 h-10 text-purple-500" /></div>
            <div>
              <p className="text-sm text-gray-600">Avg Patients per Doctor</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.avgPatientsPerDoctor}</p>
            </div>
          </div>
        </div>

        {/* Middle & Right Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Satisfaction */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Patient Satisfaction</h2>
            </div>
            <div className="flex justify-center mb-4">
              <SatisfactionPieChart satisfaction={dashboardData.patientSatisfaction} />
            </div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div>{dashboardData.patientSatisfaction.poor}% Poor</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div>{dashboardData.patientSatisfaction.good}% Good</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div>{dashboardData.patientSatisfaction.excellent}% Excellent</span>
            </div>
          </div>

          {/* Doctor's Treatment Plan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Doctor's Treatment Plan</h2>
            </div>
            <div className="space-y-3">
              {treatmentPlanData.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">{item.label}</span>
                  <div className="flex-1 bg-gray-200 h-5 rounded-full">
                    <div className={`${item.color} h-5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admission by Division (Updated UI) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Admission by Division</h2>
          </div>
          <div className="space-y-3">
            {dashboardData.admissionByDivision.sort((a, b) => b.value - a.value).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Staff per Division */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Staff per Division</h2>
          </div>
          <div className="space-y-3">
            {dashboardData.staffPerDivision.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 font-medium">{item.division}</span>
                  <span className="text-sm text-gray-900 font-bold">{item.doctors} <span className="text-gray-500 font-medium">/ {item.patients}</span></span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full relative">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${(item.patients / 60) * 100}%` }}></div>
                  <div className="bg-green-500 h-2 rounded-full absolute top-0" style={{ width: `${(item.doctors / 60) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence in Treatment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Confidence in Treatment</h2>
          </div>
          <div className="space-y-3">
            {confidenceData.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">{item.label}</span>
                <div className="flex-1 bg-gray-200 h-5 rounded-full">
                  <div className={`${item.color} h-5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientRecordDashboard = () => {
  const filtersConfig = [
    { key: "datePeriod", title: "Date Period", initial: "Feb 2017" },
    { key: "hospital", title: "Hospital", initial: "All" },
    { key: "division", title: "Division", initial: "All" },
    { key: "physician", title: "Physician", initial: "All" },
  ];

  const [filters, setFilters] = useState(filtersConfig.reduce((acc, f) => ({ ...acc, [f.key]: f.initial }), {}));

  // Data for charts
  const losData = patientRecordData.losBucket.map(d => ({ name: d.range, value: d.count }));
  const dischargeData = patientRecordData.dischargeType.map(d => ({ name: d.type, value: d.count }));
  const waitingTimeData = patientRecordData.waitingTimeByDivision.map(d => ({ name: d.division, value: d.time }));

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">Patient Record Details</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtersConfig.map((config) => (
            <FilterDropdown
              key={config.key}
              title={config.title}
              value={filters[config.key]}
              onChange={(e) => setFilters({ ...filters, [config.key]: e.target.value })}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Metrics */}
        <div className="space-y-4">
          <StatCard title="Total Patients" value={patientRecordData.totalPatient} lastMonthValue={302} change={patientRecordData.lastMonthChange} changeType="negative" Icon={Users} borderColorClass="border-green-500" />
          <StatCard title="Patients in ICU" value={patientRecordData.patientInICU} lastMonthValue={16} change={patientRecordData.icuChange} changeType="negative" Icon={Bed} borderColorClass="border-green-500" />
          <StatCard title="Died Patients" value={patientRecordData.totalDiedPatient} lastMonthValue={6} change={patientRecordData.diedChange} changeType="negative" Icon={Activity} borderColorClass="border-red-500" />
          <StatCard title="Re-Admitted Patients" value={patientRecordData.reAdmitPatient} lastMonthValue={19} change={patientRecordData.reAdmitChange} changeType="negative" Icon={Users} borderColorClass="border-yellow-500" />
          <StatCard title="Avg. Discharge Days" value={patientRecordData.avgDaysDischarge} lastMonthValue={5} change={patientRecordData.dischargeChange} changeType="positive" Icon={Clock} borderColorClass="border-purple-500" />
        </div>

        {/* Right Column: Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This will now render your local .png icons */}
          <GenderChart female={patientRecordData.genderDistribution.female} male={patientRecordData.genderDistribution.male} />

          <HorizontalBarChart title="No. of Patients by Division" data={patientRecordData.divisionDistribution} colorClass="bg-teal-500" />
          <HorizontalBarChart title="No. of Patients by LOS Bucket" data={losData} colorClass="bg-gray-600" />

          <HorizontalBarChart title="Avg. Waiting Time by Division (min)" data={waitingTimeData} colorClass="bg-gradient-to-r from-pink-500 to-red-500" />
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kpi");

  const TabButton = ({ tabName, title }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tabName
          ? "bg-green-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex gap-4 px-4 sm:px-6 lg:px-8 py-3">
          <TabButton tabName="kpi" title="Hospital KPI Dashboard" />
          <TabButton tabName="records" title="Patient Record Details" />
        </div>
      </div>
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === "kpi" ? <KPIDashboard /> : <PatientRecordDashboard />}
      </main>
    </div>
  );
};

export default AdminDashboard;