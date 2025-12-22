import React, { useState, useEffect } from 'react';
import { Pill, Plus, X, Eye, Edit, Trash2, Search, CheckCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import supabase from '../../../SupabaseClient';

const StatusBadge = ({ status }) => {
  const getColors = () => {
    if (status === 'Completed' || status === 'Approved & Dispensed') return 'bg-green-100 text-green-700';
    if (status === 'Pending' || status === 'Pending Approval') return 'bg-yellow-100 text-yellow-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColors()}`}>
      {status}
    </span>
  );
};

export default function Pharmacy() {
  const { data } = useOutletContext();
  const currentIpdNumber = data?.personalInfo?.ipd || '';

  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [submittedIndents, setSubmittedIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for fetched data
  const [medicineNames, setMedicineNames] = useState([]);
  const [pathologyTests, setPathologyTests] = useState([]);
  const [xrayTests, setXrayTests] = useState([]);
  const [ctScanTests, setCtScanTests] = useState([]);
  const [usgTests, setUsgTests] = useState([]);
  const [staffNames, setStaffNames] = useState([]);

  const [formData, setFormData] = useState({
    diagnosis: '',
    staffName: ''
  });

  const [requestTypes, setRequestTypes] = useState({
    medicineSlip: false,
    investigation: false,
    package: false,
    nonPackage: false
  });

  const [medicines, setMedicines] = useState([]);
  const [investigationAdvice, setInvestigationAdvice] = useState({
    priority: 'Medium',
    adviceCategory: '',
    pathologyTests: [],
    radiologyType: '',
    radiologyTests: [],
    remarks: ''
  });

  // Fetch all required data from Supabase
  useEffect(() => {
    if (currentIpdNumber) {
      fetchAllData();
    }
  }, [currentIpdNumber]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      await fetchIndents();
      await fetchMedicines();
      await fetchInvestigationTests();
      await fetchStaffNames();
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndents = async () => {
    try {
      const { data: indents, error } = await supabase
        .from('pharmacy')
        .select('*')
        .or(`ipd_number.eq.${currentIpdNumber},admission_number.eq.${currentIpdNumber}`)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedIndents = (indents || []).map(indent => ({
        indentNumber: indent.indent_no,
        patientName: indent.patient_name,
        admissionNo: indent.admission_number || indent.ipd_number || '',
        uhidNumber: indent.uhid_number,
        diagnosis: indent.diagnosis,
        requestTypes: indent.request_types ? JSON.parse(indent.request_types) : {},
        medicines: indent.medicines ? JSON.parse(indent.medicines) : [],
        investigationAdvice: indent.investigation_advice ? JSON.parse(indent.investigation_advice) : {},
        submittedAt: indent.timestamp,
        updatedAt: indent.updated_at,
        status: indent.status,
        staffName: indent.staff_name,
        consultantName: indent.consultant_name,
        age: indent.age,
        gender: indent.gender,
        wardLocation: indent.ward_location,
        category: indent.category,
        room: indent.room,
        ipdNumber: indent.ipd_number,
        slip_image: indent.slip_image
      }));

      setSubmittedIndents(formattedIndents);
    } catch (error) {
      console.error('Error fetching indents:', error);
      setSubmittedIndents([]);
    }
  };

  const fetchMedicines = async () => {
    try {
      const { data: medicines, error } = await supabase
        .from('medicine')
        .select('medicine_name')
        .order('medicine_name');

      if (error) throw error;

      const medicineList = (medicines || []).map(med => med.medicine_name);
      setMedicineNames(medicineList);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicineNames([]);
    }
  };

  const fetchInvestigationTests = async () => {
    try {
      const { data: allInvestigations, error } = await supabase
        .from('investigation')
        .select('name, type')
        .order('name');

      if (error) throw error;

      const investigations = allInvestigations || [];
      
      const pathology = investigations
        .filter(item => item.type === 'Pathology')
        .map(item => item.name);
      
      const xray = investigations
        .filter(item => item.type === 'X-ray')
        .map(item => item.name);
      
      const ctScan = investigations
        .filter(item => item.type === 'CT Scan')
        .map(item => item.name);
      
      const usg = investigations
        .filter(item => item.type === 'USG')
        .map(item => item.name);

      setPathologyTests(pathology);
      setXrayTests(xray);
      setCtScanTests(ctScan);
      setUsgTests(usg);

    } catch (error) {
      console.error('Error fetching investigation tests:', error);
      setPathologyTests([]);
      setXrayTests([]);
      setCtScanTests([]);
      setUsgTests([]);
    }
  };

  const fetchStaffNames = async () => {
    try {
      const { data: staff, error } = await supabase
        .from('all_staff')
        .select('name')
        .eq('designation', 'Staff Nurse')
        .order('name');

      if (error) throw error;

      const staffList = (staff || []).map(s => s.name);
      setStaffNames(staffList);
    } catch (error) {
      console.error('Error fetching staff names:', error);
      setStaffNames([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (type) => {
    setRequestTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const addMedicine = () => {
    const newMedicine = {
      id: Date.now(),
      name: '',
      quantity: ''
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleInvestigationAdviceChange = (e) => {
    const { name, value } = e.target;
    setInvestigationAdvice(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'adviceCategory' && {
        pathologyTests: [],
        radiologyType: '',
        radiologyTests: []
      }),
      ...(name === 'radiologyType' && { radiologyTests: [] })
    }));
  };

  const handleAdviceCheckboxChange = (testName, category) => {
    setInvestigationAdvice(prev => {
      const currentTests = category === 'pathology' ? prev.pathologyTests : prev.radiologyTests;
      const newTests = currentTests.includes(testName)
        ? currentTests.filter(t => t !== testName)
        : [...currentTests, testName];

      return {
        ...prev,
        [category === 'pathology' ? 'pathologyTests' : 'radiologyTests']: newTests
      };
    });
  };

  const getRadiologyTests = () => {
    switch (investigationAdvice.radiologyType) {
      case 'X-ray': return xrayTests;
      case 'CT-scan': return ctScanTests;
      case 'USG': return usgTests;
      default: return [];
    }
  };

  const generateIndentNumber = () => {
    const timestamp = Date.now();
    return `IND-${timestamp.toString().slice(-9)}`;
  };

  const handleSubmit = async () => {
    try {
      if (!formData.diagnosis) {
        alert('Please enter Diagnosis');
        return;
      }

      const hasRequestType = Object.values(requestTypes).some(value => value);
      if (!hasRequestType) {
        alert('Please select at least one Request Type');
        return;
      }

      if (requestTypes.medicineSlip && medicines.length === 0) {
        alert('Please add at least one medicine');
        return;
      }

      const incompleteMedicines = medicines.some(med => !med.name || !med.quantity);
      if (requestTypes.medicineSlip && incompleteMedicines) {
        alert('Please fill all medicine details');
        return;
      }

      if (requestTypes.investigation) {
        if (!investigationAdvice.adviceCategory) {
          alert('Please select Pathology or Radiology for investigation');
          return;
        }

        if (investigationAdvice.adviceCategory === 'Pathology' && investigationAdvice.pathologyTests.length === 0) {
          alert('Please select at least one pathology test');
          return;
        }

        if (investigationAdvice.adviceCategory === 'Radiology') {
          if (!investigationAdvice.radiologyType) {
            alert('Please select radiology type');
            return;
          }
          if (investigationAdvice.radiologyTests.length === 0) {
            alert('Please select at least one radiology test');
            return;
          }
        }
      }

      let indentNumber;
      let totalMedicines = requestTypes.medicineSlip ? medicines.reduce((sum, med) => sum + parseInt(med.quantity || 0), 0) : 0;

      const pharmacyData = {
        timestamp: new Date().toISOString(),
        indent_no: editMode && selectedIndent ? selectedIndent.indentNumber : generateIndentNumber(),
        admission_number: currentIpdNumber || '',
        ipd_number: currentIpdNumber || '',
        staff_name: formData.staffName || '',
        patient_name: data.personalInfo.name,
        uhid_number: data.personalInfo.uhid || '',
        age: data.personalInfo.age || '',
        gender: data.personalInfo.gender || '',
        diagnosis: formData.diagnosis,
        request_types: JSON.stringify(requestTypes),
        medicines: JSON.stringify(medicines),
        investigation_advice: JSON.stringify(investigationAdvice),
        status: 'Pending'
      };

      if (editMode && selectedIndent) {
        const { error } = await supabase
          .from('pharmacy')
          .update(pharmacyData)
          .eq('indent_no', selectedIndent.indentNumber);

        if (error) throw error;
        indentNumber = selectedIndent.indentNumber;
      } else {
        const { data: newIndent, error } = await supabase
          .from('pharmacy')
          .insert([pharmacyData])
          .select()
          .single();

        if (error) throw error;
        indentNumber = newIndent.indent_no;
      }

      await fetchIndents();

      setSuccessData({
        indentNumber: indentNumber,
        patientName: data.personalInfo.name,
        admissionNo: currentIpdNumber || '',
        totalMedicines: totalMedicines
      });

      setShowModal(false);
      setEditMode(false);
      setSuccessModal(true);
      resetForm();

    } catch (error) {
      console.error('Error saving indent:', error);
      alert('Error saving indent. Please try again.');
    }
  };

  const handleDelete = async (indentNumber) => {
    if (window.confirm('Are you sure you want to delete this indent?')) {
      try {
        const { error } = await supabase
          .from('pharmacy')
          .delete()
          .eq('indent_no', indentNumber);

        if (error) throw error;

        await fetchIndents();
        alert('Indent deleted successfully');
      } catch (error) {
        console.error('Error deleting indent:', error);
        alert('Error deleting indent');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      diagnosis: '',
      staffName: ''
    });
    setRequestTypes({
      medicineSlip: false,
      investigation: false,
      package: false,
      nonPackage: false
    });
    setMedicines([]);
    setInvestigationAdvice({
      priority: 'Medium',
      adviceCategory: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
    setSelectedIndent(null);
  };

  const handleView = (indent) => {
    setSelectedIndent(indent);
    setViewModal(true);
  };

  const handleEdit = (indent) => {
    if (indent.ipdNumber !== currentIpdNumber && indent.admissionNo !== currentIpdNumber) {
      alert('You can only edit indents for the current patient');
      return;
    }
    
    setSelectedIndent(indent);
    setFormData({
      diagnosis: indent.diagnosis,
      staffName: indent.staffName || ''
    });
    setRequestTypes({ ...indent.requestTypes });
    setMedicines([...indent.medicines]);
    setInvestigationAdvice(indent.investigationAdvice || {
      priority: 'Medium',
      adviceCategory: '',
      pathologyTests: [],
      radiologyType: '',
      radiologyTests: [],
      remarks: ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const getFilteredIndents = () => {
    return submittedIndents.filter(indent => {
      const matchesSearch = 
        indent.indentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indent.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indent.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || indent.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  if (!data) return null;

  const filteredIndents = getFilteredIndents();

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
      {/* Header Section - FIXED DASHBOARD VIEW */}
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-md flex-shrink-0">
        {/* Desktop View - Everything inline in one row */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side: Title and icon */}
          <div className="flex items-center gap-3">
            <Pill className="w-8 h-8" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Pharmacy Indents</h1>
              <p className="text-xs opacity-90 mt-1">
                {currentIpdNumber && currentIpdNumber !== 'N/A' 
                  ? `${data.personalInfo.name} - IPD: ${currentIpdNumber}` 
                  : data.personalInfo.name}
              </p>
            </div>
          </div>
          
          {/* Right side: Search and Filter - ALL INLINE */}
          <div className="flex items-center gap-3">
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
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white text-sm"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="Pending" className="text-gray-900">Pending</option>
              <option value="Approved" className="text-gray-900">Approved</option>
              <option value="Completed" className="text-gray-900">Completed</option>
            </select>
          </div>
        </div>

        {/* Mobile View - Stacked layout */}
        <div className="md:hidden">
          <div className="flex flex-col gap-3">
            {/* Title Row */}
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">Pharmacy Indents</h1>
                <p className="text-xs opacity-90 mt-1">
                  {currentIpdNumber && currentIpdNumber !== 'N/A' 
                    ? `${data.personalInfo.name} - IPD: ${currentIpdNumber}` 
                    : data.personalInfo.name}
                </p>
              </div>
            </div>

            {/* Search and Filter in same row */}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1.5 bg-white/10 border border-green-400 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white text-xs min-w-16"
              >
                <option value="all" className="text-gray-900">All</option>
                <option value="Pending" className="text-gray-900">Pending</option>
                <option value="Approved" className="text-gray-900">Approved</option>
                <option value="Completed" className="text-gray-900">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View - UNCHANGED */}
      <div className="md:hidden flex-1 min-h-0 mt-2">
        <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading pharmacy indents...</p>
              </div>
            </div>
          ) : filteredIndents.length > 0 ? (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {filteredIndents.map((indent) => (
                  <div key={indent.indentNumber} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-green-600 text-sm">{indent.indentNumber}</h3>
                        <p className="text-sm font-medium text-gray-900 mt-1">{indent.patientName}</p>
                        <p className="text-xs text-gray-500">IPD: {indent.admissionNo || indent.ipdNumber}</p>
                      </div>
                      <StatusBadge status={indent.status || 'Pending'} />
                    </div>
                    
                    <div className="space-y-3">
                      {/* Diagnosis */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Diagnosis: </span>
                        <span className="text-gray-600 truncate">{indent.diagnosis}</span>
                      </div>
                      
                      {/* Request Types */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Request Types: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {indent.requestTypes.medicineSlip && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Medicine</span>
                          )}
                          {indent.requestTypes.investigation && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Investigation</span>
                          )}
                          {indent.requestTypes.package && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Package</span>
                          )}
                          {indent.requestTypes.nonPackage && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Non-Package</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Medicines Count */}
                      {indent.requestTypes.medicineSlip && indent.medicines.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Medicines: </span>
                          <span className="text-gray-600">{indent.medicines.length} items</span>
                        </div>
                      )}
                      
                      {/* UHID */}
                      {indent.uhidNumber && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">UHID: </span>
                          <span className="text-gray-600">{indent.uhidNumber}</span>
                        </div>
                      )}
                      
                      {/* Actions - Fixed to stay inside card */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleView(indent)}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleEdit(indent)}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(indent.indentNumber)}
                            className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium text-sm">No pharmacy indents found</p>
                <p className="text-gray-500 text-xs mt-1">
                  {currentIpdNumber && currentIpdNumber !== 'N/A'
                    ? `No indents found for IPD: ${currentIpdNumber}`
                    : searchTerm 
                      ? 'No indents match your search' 
                      : 'No indents available'
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
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading pharmacy indents...</p>
                {currentIpdNumber && (
                  <p className="text-sm text-gray-500 mt-1">For IPD: {currentIpdNumber}</p>
                )}
              </div>
            </div>
          ) : filteredIndents.length > 0 ? (
            <div className="h-full overflow-auto" style={{ maxHeight: '100%' }}>
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Indent No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Patient</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">IPD No</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Diagnosis</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Request Type</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Status</th>
                    <th className="px-4 py-3 font-bold text-gray-700 uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIndents.map((indent) => (
                    <tr key={indent.indentNumber} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">{indent.indentNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{indent.patientName}</div>
                        {indent.uhidNumber && (
                          <div className="text-xs text-gray-500">UHID: {indent.uhidNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-700">{indent.admissionNo || indent.ipdNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 truncate max-w-xs">{indent.diagnosis}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {indent.requestTypes.medicineSlip && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Medicine</span>
                          )}
                          {indent.requestTypes.investigation && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Investigation</span>
                          )}
                          {indent.requestTypes.package && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Package</span>
                          )}
                          {indent.requestTypes.nonPackage && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Non-Package</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={indent.status || 'Pending'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(indent)}
                            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(indent)}
                            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="Edit Indent"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(indent.indentNumber)}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="Delete Indent"
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
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium text-sm">No pharmacy indents found</p>
                <p className="text-gray-500 text-xs mt-1">
                  {currentIpdNumber && currentIpdNumber !== 'N/A'
                    ? `No indents found for IPD: ${currentIpdNumber}`
                    : searchTerm 
                      ? 'No indents match your search' 
                      : 'No indents available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create New Indent Button - Fixed position at bottom right */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all hover:shadow-xl"
          title="Create New Indent"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editMode ? 'Edit Indent' : 'Create New Indent'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setEditMode(false);
                }}
                className="text-white hover:bg-green-700 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={data.personalInfo.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UHID Number</label>
                    <input
                      type="text"
                      value={data.personalInfo.uhid || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IPD Number</label>
                    <input
                      type="text"
                      value={currentIpdNumber || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Name (Nurse)
                    </label>
                    <select
                      name="staffName"
                      value={formData.staffName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Staff Nurse</option>
                      {staffNames.map((name, index) => (
                        <option key={index} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Request Type */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Request Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'medicineSlip', label: 'Medicine Slip' },
                    { id: 'investigation', label: 'Investigation' },
                    { id: 'package', label: 'Package' },
                    { id: 'nonPackage', label: 'Non Package' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestTypes[type.id]}
                        onChange={() => handleCheckboxChange(type.id)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medicines Section */}
              {requestTypes.medicineSlip && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medicines</h3>
                  <div className="space-y-3 mb-4">
                    {medicines.map((medicine, index) => (
                      <div key={medicine.id} className="flex gap-3 items-end">
                        <div className="w-8 h-10 flex items-center justify-center bg-green-600 text-white rounded font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                          <select
                            value={medicine.name}
                            onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Medicine</option>
                            {medicineNames.map((med, index) => (
                              <option key={index} value={med}>{med}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) => updateMedicine(medicine.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0"
                          />
                        </div>
                        <button
                          onClick={() => removeMedicine(medicine.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg h-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addMedicine}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>
                </div>
              )}

              {/* Investigation Advice Section */}
              {requestTypes.investigation && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Investigation Advice</h3>
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                        <select
                          name="priority"
                          value={investigationAdvice.priority}
                          onChange={handleInvestigationAdviceChange}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pathology & Radiology *</label>
                        <select
                          name="adviceCategory"
                          value={investigationAdvice.adviceCategory}
                          onChange={handleInvestigationAdviceChange}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Category</option>
                          <option value="Pathology">Pathology</option>
                          <option value="Radiology">Radiology</option>
                        </select>
                      </div>
                    </div>

                    {/* Pathology Tests */}
                    {investigationAdvice.adviceCategory === 'Pathology' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Pathology Tests * ({investigationAdvice.pathologyTests.length} selected)
                        </label>
                        <div className="p-4 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-300">
                          {pathologyTests.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                              {pathologyTests.map((test, index) => (
                                <label key={index} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={investigationAdvice.pathologyTests.includes(test)}
                                    onChange={() => handleAdviceCheckboxChange(test, 'pathology')}
                                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{test}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No pathology tests available</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Radiology Section */}
                    {investigationAdvice.adviceCategory === 'Radiology' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Radiology Type *</label>
                          <select
                            name="radiologyType"
                            value={investigationAdvice.radiologyType}
                            onChange={handleInvestigationAdviceChange}
                            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Type</option>
                            <option value="X-ray">X-ray</option>
                            <option value="CT-scan">CT Scan</option>
                            <option value="USG">USG</option>
                          </select>
                        </div>

                        {investigationAdvice.radiologyType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select {investigationAdvice.radiologyType} Tests * ({investigationAdvice.radiologyTests.length} selected)
                            </label>
                            <div className="p-4 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-300">
                              {getRadiologyTests().length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                  {getRadiologyTests().map((test, index) => (
                                    <label key={index} className="flex items-start gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={investigationAdvice.radiologyTests.includes(test)}
                                        onChange={() => handleAdviceCheckboxChange(test, 'radiology')}
                                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                      />
                                      <span className="text-sm text-gray-700">{test}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">No {investigationAdvice.radiologyType} tests available</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        name="remarks"
                        value={investigationAdvice.remarks}
                        onChange={handleInvestigationAdviceChange}
                        rows="3"
                        placeholder="Add any additional notes or instructions..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setEditMode(false);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editMode ? 'Update Indent' : 'Submit Indent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Success!</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">Your indent has been {editMode ? 'updated' : 'submitted'} successfully!</p>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Indent Number:</span>
                  <span className="text-sm font-bold text-green-600">{successData.indentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Patient Name:</span>
                  <span className="text-sm font-medium text-gray-800">{successData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">IPD Number:</span>
                  <span className="text-sm font-medium text-gray-800">{successData.admissionNo}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSuccessModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setSuccessModal(false);
                    resetForm();
                    setShowModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && selectedIndent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Indent Details - {selectedIndent.indentNumber}</h2>
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedIndent(null);
                }}
                className="text-white hover:bg-green-700 rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
             <img src={selectedIndent.slip_image} alt="Indent" className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}