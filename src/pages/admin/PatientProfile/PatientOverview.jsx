import React, { useState, useEffect } from 'react';
import {
    Calendar,
    User,
    Stethoscope,
    Activity,
    Bed,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import supabase from '../../../SupabaseClient'; // Adjust path as needed

// Status Badge Component
const StatusBadge = ({ status }) => {
    const getColors = () => {
        if (status === 'Completed' || status === 'Active' || status === 'Approved & Dispensed') {
            return 'bg-green-100 text-green-700 border-green-300';
        } else if (status === 'Pending' || status === 'Pending Approval') {
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        } else if (status === 'In Progress') {
            return 'bg-blue-100 text-blue-700 border-blue-300';
        } else if (status === 'Emergency' || status === 'Occupied') {
            return 'bg-red-100 text-red-700 border-red-300';
        } else if (status === 'Stable') {
            return 'bg-emerald-100 text-emerald-700 border-emerald-300';
        }
        return 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
            {status}
        </span>
    );
};

// Expandable Section Component
const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
            {isOpen && <div className="px-6 py-4 border-t border-gray-200">{children}</div>}
        </div>
    );
};

// Information Grid Component
const InfoGrid = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">{key}</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{value}</p>
            </div>
        ))}
    </div>
);

// Format date for display
const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
};

const PatientOverview = () => {
    const { data, calculateDaysInHospital, refetchPatientData } = useOutletContext();
    const [patientAdmissionData, setPatientAdmissionData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch patient admission data
    useEffect(() => {
        const fetchPatientAdmissionData = async () => {
            if (!data?.personalInfo?.ipd) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data: admissionData, error } = await supabase
                    .from('patient_admission')
                    .select('phone_no, attender_name, attender_mobile_no, reason_for_visit, admission_no, patient_name')
                    .or(`ipd_number.eq.${data.personalInfo.ipd},admission_no.eq.${data.personalInfo.ipd}`)
                    .order('timestamp', { ascending: false })
                    .limit(1)
                    .single();

                if (error) {
                    console.warn('Error fetching patient admission data:', error);
                    setPatientAdmissionData(null);
                } else {
                    setPatientAdmissionData(admissionData);
                }
            } catch (err) {
                console.error('Error in fetchPatientAdmissionData:', err);
                setPatientAdmissionData(null);
            } finally {
                setLoading(false);
            }
        };

        if (data) {
            fetchPatientAdmissionData();
        }
    }, [data]);

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Loading patient data...</p>
            </div>
        );
    }

    // Get phone number from patient_admission table or fallback
    const getPhoneNumber = () => {
        if (patientAdmissionData?.phone_no) {
            return patientAdmissionData.phone_no;
        }
        return data.personalInfo.phone || 'N/A';
    };

    // Get admission reason from patient_admission table or fallback
    const getAdmissionReason = () => {
        if (patientAdmissionData?.reason_for_visit) {
            return patientAdmissionData.reason_for_visit;
        }
        return data.admissionInfo.reasonForAdmission || 'N/A';
    };

    // Get emergency contact info from patient_admission table
    const getEmergencyContact = () => {
        if (patientAdmissionData?.attender_name && patientAdmissionData?.attender_mobile_no) {
            return `${patientAdmissionData.attender_name} - ${patientAdmissionData.attender_mobile_no}`;
        }
        if (patientAdmissionData?.attender_name) {
            return patientAdmissionData.attender_name;
        }
        if (patientAdmissionData?.attender_mobile_no) {
            return patientAdmissionData.attender_mobile_no;
        }
        return 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* Personal Information Section */}
            <ExpandableSection title="Personal Information" icon={User} defaultOpen={true}>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading contact information...</p>
                    </div>
                ) : (
                    <InfoGrid
                        data={{
                            'Full Name': data.personalInfo.name || 'N/A',
                            'UHID No.': data.personalInfo.uhid || 'N/A',
                            'IPD No.': data.personalInfo.ipd || 'N/A',
                            'Age': data.personalInfo.age ? `${data.personalInfo.age} years` : 'N/A',
                            'Gender': data.personalInfo.gender || 'N/A',
                            'Consultant Dr.': data.personalInfo.consultantDr || 'N/A',
                            'Phone': getPhoneNumber(),
                            'Address': data.personalInfo.address || 'N/A',
                            'Emergency Contact': getEmergencyContact(),
                        }}
                    />
                )}
                <div className="mt-4 text-xs text-gray-500">
                    <p>Phone and Emergency Contact fetched from patient admission records</p>
                </div>
            </ExpandableSection>

            {/* Admission Information Section */}
            <ExpandableSection title="Admission Information" icon={Calendar} defaultOpen={true}>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading admission details...</p>
                    </div>
                ) : (
                    <InfoGrid
                        data={{
                            'Admission Date': formatDate(data.admissionInfo.admissionDate),
                            'Admission Type': data.admissionInfo.admissionType || 'N/A',
                            'Mode of Admission': data.admissionInfo.admissionMode || 'N/A',
                            'Reason': getAdmissionReason(),
                            'Status': data.admissionInfo.status || 'N/A',
                            'Duration': `${calculateDaysInHospital(data.admissionInfo.admissionDate)} days`,
                        }}
                    />
                )}
                <div className="mt-4 text-xs text-gray-500">
                    <p>Admission reason fetched from patient admission records</p>
                </div>
            </ExpandableSection>

            {/* Department & Ward Information Section */}
            <ExpandableSection title="Department & Ward Information" icon={Bed} defaultOpen={true}>
                <div className="space-y-4">
                    <InfoGrid
                        data={{
                            'Department': data.departmentInfo.department || 'N/A',
                            'Ward': data.departmentInfo.ward || 'N/A',
                            'Bed Number': data.departmentInfo.bedNumber || 'N/A',
                            'Bed Status': data.departmentInfo.bedStatus || 'N/A',
                        }}
                    />
                    <div className="mt-4">
                        <StatusBadge status={data.departmentInfo.bedStatus} />
                    </div>
                </div>
            </ExpandableSection>

            {/* Doctor Information Section */}
            <ExpandableSection title="Doctor Information" icon={Stethoscope} defaultOpen={true}>
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Primary Doctor</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                            {data.doctorInfo.primaryDoctor}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">{data.doctorInfo.specialty}</span>
                        </div>
                    </div>

                    <InfoGrid
                        data={{
                            'Specialty': data.doctorInfo.specialty || 'N/A',
                            'Office Hours': data.doctorInfo.officeHours || 'N/A',
                        }}
                    />
                </div>
            </ExpandableSection>

            {/* Current Vitals Monitoring Section
            <ExpandableSection title="Current Vitals Monitoring" icon={Activity} defaultOpen={true}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">
                            Last Updated: {data.vitalsMonitoring.lastUpdated || 'N/A'}
                        </p>
                        <StatusBadge status={data.vitalsMonitoring.status} />
                    </div>
                    <InfoGrid
                        data={{
                            'Blood Pressure': data.vitalsMonitoring.bloodPressure || 'N/A',
                            'Heart Rate': data.vitalsMonitoring.heartRate || 'N/A',
                            'Temperature': data.vitalsMonitoring.temperature || 'N/A',
                            'Respiratory Rate': data.vitalsMonitoring.respiratoryRate || 'N/A',
                            'Oxygen Saturation': data.vitalsMonitoring.oxygenSaturation || 'N/A',
                        }}
                    />
                </div>
            </ExpandableSection> */}

            {/* Billing Information Section
            {data.billing && (
                <ExpandableSection title="Billing Information" icon={Calendar} defaultOpen={false}>
                    <InfoGrid
                        data={{
                            'Total Billed Amount': data.billing.totalBilledAmount 
                                ? `₹${data.billing.totalBilledAmount.toLocaleString('en-IN')}` 
                                : 'N/A',
                            'Outstanding Amount': data.billing.outstandingAmount 
                                ? `₹${data.billing.outstandingAmount.toLocaleString('en-IN')}` 
                                : 'N/A',
                            'Payment Mode': data.billing.paymentMode || 'N/A',
                            'Insurance Company': data.billing.insuranceCompany || 'N/A',
                        }}
                    />
                </ExpandableSection>
            )}

            {/* Treatment Plan Section */}
            {/* <ExpandableSection title="Treatment Plan" icon={Activity} defaultOpen={false}>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Diagnosis</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                            {data.treatmentPlan.diagnosis}
                        </p>
                    </div>

                    {data.treatmentPlan.procedures && data.treatmentPlan.procedures.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 font-medium mb-2">Procedures</p>
                            <div className="space-y-3">
                                {data.treatmentPlan.procedures.map((procedure, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div>
                                            <p className="font-medium text-gray-900">{procedure.name}</p>
                                            <p className="text-sm text-gray-600">{procedure.notes}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">{procedure.date}</p>
                                            <StatusBadge status={procedure.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ExpandableSection>  */}

            {/* Additional Patient Admission Details Section */}
            {/* {patientAdmissionData && (
                <ExpandableSection title="Admission Details" icon={Calendar} defaultOpen={false}>
                    <div className="space-y-4">
                        <InfoGrid
                            data={{
                                'Admission Number': patientAdmissionData.admission_no || 'N/A',
                                'Patient Name (Admission)': patientAdmissionData.patient_name || 'N/A',
                                'Phone Number': patientAdmissionData.phone_no || 'N/A',
                                'Attender Name': patientAdmissionData.attender_name || 'N/A',
                                'Attender Mobile': patientAdmissionData.attender_mobile_no || 'N/A',
                                'Reason for Visit': patientAdmissionData.reason_for_visit || 'N/A',
                            }}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                            <p>This data is fetched from the patient admission table</p>
                        </div>
                    </div>
                </ExpandableSection>
            )} */}

            {/* Refresh Button */}
            <div className="flex justify-end">
                <button
                    onClick={refetchPatientData}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Patient Data
                </button>
            </div>
        </div>
    );
};

export default PatientOverview;