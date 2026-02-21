import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import { getDoctorAppointments, deleteAppointment } from '../../api/dataService';

const DoctorAppointments = ({ onNavigate, user, onUpdateStatus }) => {
  const config = useContext(ConfigContext) || {};
  
  const { 
    background_color: bg = '#f3f4f6', 
    surface_color: surface = '#ffffff', 
    text_color: text = '#1f2937', 
    primary_action_color: primary = '#2563eb' 
  } = config;  

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pending'); 
  const [searchQuery, setSearchQuery] = useState("");

  // --- MODAL STATES ---
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedApptForPrescription, setSelectedApptForPrescription] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedApptForHistory, setSelectedApptForHistory] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        if (!user || !user.id) {
            console.error("User or User ID is missing");
            setLoading(false);
            return;
        }
        const res = await getDoctorAppointments(user.id);
        setAppointments(res.data || []);
      } catch (error) {
        console.error("Error fetching appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user?.id]);

  // --- ACTION HANDLERS ---
  const handleAccept = async (id) => {
    const payload = { status: "COMPLETED" };
    if (onUpdateStatus) await onUpdateStatus(id, "COMPLETED", payload);
    try {
      const res = await getDoctorAppointments(user.id);
      setAppointments(res.data);
    } catch (error) { console.error("Error refreshing list", error); }
  };

  const handleRejectAndDelete = async (id) => {
    if (!window.confirm("Are you sure you want to Reject this appointment?")) return;
    try {
        setAppointments(appointments.filter(appt => appt.id !== id));
        await deleteAppointment(id);
    } catch (error) {
        console.error("Error deleting appointment", error);
        const res = await getDoctorAppointments(user.id);
        setAppointments(res.data);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this appointment permanently?")) return;
    try {
        setAppointments(appointments.filter(appt => appt.id !== id));
        await deleteAppointment(id);
    } catch (error) {
        console.error("Error deleting appointment", error);
        const res = await getDoctorAppointments(user.id);
        setAppointments(res.data);
    }
  };

  const openPrescriptionModal = (appt) => {
    setSelectedApptForPrescription(appt);
    setPrescriptionText(appt.prescription || '');
    setShowPrescriptionModal(true);
  };

  const savePrescription = async () => {
    if (!selectedApptForPrescription) return;
    await onUpdateStatus(selectedApptForPrescription.id, 'COMPLETED', { prescription: prescriptionText });
    try {
      const res = await getDoctorAppointments(user.id);
      setAppointments(res.data);
    } catch (error) { console.error("Error refreshing list", error); }
    setShowPrescriptionModal(false);
    setSelectedApptForPrescription(null);
    alert("Prescription saved successfully!");
  };

  const handleViewHistory = async (appt) => {
    setSelectedApptForHistory(appt);
    setMedicalHistory([
      { id: 1, date: '2023-10-15', diagnosis: 'Annual Vaccination', notes: 'Administered Distemper and Parvo vaccines. Pet reacted well.' },
      { id: 2, date: '2023-06-20', diagnosis: 'Ear Infection', notes: 'Prescribed Otibiotic drops. Follow up in 7 days.' }
    ]);
    setShowHistoryModal(true);
  };

  const getStatusBadgeStyle = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    switch(s) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  // --- FILTER LOGIC ---
  const filteredAppointments = appointments.filter(appt => {
    const hasPrescription = appt.prescription && appt.prescription.trim() !== '';
    const matchesTab = viewMode === 'pending' ? !hasPrescription : hasPrescription;
    
    if (searchQuery === '') return matchesTab;
    const query = searchQuery.toLowerCase();
    const patientName = (appt.patientName || '').toLowerCase();
    const petName = (appt.petName || '').toLowerCase();
    const matchesSearch = patientName.includes(query) || petName.includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="doctor-appointments" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="My Appointments" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Main Container: Centers content but gives room for layout */}
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {/* --- REARRANGED HEADER SECTION --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-gray-200">
              
              {/* LEFT: Title & Tabs Group */}
              <div className="w-full lg:w-auto flex flex-col gap-4">
                 <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Appointments</h2>
                 
                 {/* Tabs */}
                 <div className="bg-gray-200 p-1 rounded-xl flex w-fit shadow-inner">
                    <button 
                        onClick={() => setViewMode('pending')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'pending' ? 'bg-white shadow-sm text-indigo-600 transform scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                        Pending
                    </button>
                    <button 
                        onClick={() => setViewMode('completed')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'completed' ? 'bg-white shadow-sm text-green-600 transform scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                        Completed
                    </button>
                 </div>
              </div>

              {/* RIGHT: Search Bar Group */}
              <div className="w-full lg:w-96 shrink-0">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
                      </div>
                      <input 
                          type="text" 
                          className="w-full pl-10 pr-10 py-3 rounded-2xl border-none shadow-sm bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                          placeholder="Search patient or pet name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                      )}
                  </div>
              </div>
            </div>

            {/* --- CONTENT LIST --- */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-20" style={{ color: text }}>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
              </div>
            ) : (
              <div className="flex-1">
                {filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                    <div className="bg-indigo-50 p-4 rounded-full mb-4 text-4xl">📅</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {searchQuery ? "No Search Results" : (viewMode === 'pending' ? "No Pending Requests" : "No Completed Prescriptions")}
                    </h3>
                    <p className="text-gray-500 max-w-md text-center">
                        {searchQuery ? "Try different keywords to find what you're looking for." : (viewMode === 'pending' ? "You are all caught up! No new appointments to review." : "You haven't written any prescriptions yet.")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAppointments
                      .filter(appt => (appt.doctor?.id === user.id || appt.doctorId === user.id))
                      .map((appt) => {
                          const status = appt.status?.toUpperCase();
                          const isPaid = appt.paymentStatus === 'PAID';
                          
                          return (
                          <div 
                            key={appt.id} 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b border-gray-50">
                              <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadgeStyle(appt.status)}`}>
                                    {appt.status || 'PENDING'}
                                  </span>
                                  <span className="text-xs text-gray-400 font-mono">#{appt.id}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{appt.type || 'General Consultation'}</h3>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <span>👤</span> {appt.patientName} <span className="text-gray-300">•</span> <span>🐾</span> {appt.petName}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Payment</p>
                                    <span className={`font-bold text-sm ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                      {isPaid ? 'PAID' : 'PENDING'}
                                    </span>
                                  </div>
                              </div>
                            </div>

                            {/* Card Details Grid */}
                            <div className="p-6 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-lg"> 📅 </div>
                                   <div>
                                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date</p>
                                     <p className="text-sm font-semibold text-gray-800">{appt.date || appt.appointmentDate}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-lg"> ⏰ </div>
                                   <div>
                                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Time</p>
                                     <p className="text-sm font-semibold text-gray-800">{appt.time || appt.appointmentTime}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-lg"> 🐕 </div>
                                   <div>
                                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pet Type</p>
                                     <p className="text-sm font-semibold text-gray-800">{appt.type || 'Unknown'}</p>
                                   </div>
                                </div>
                            </div>

                            {/* Card Actions Footer */}
                            <div className="p-4 md:p-6 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                              
                              {/* Left: Status Text */}
                              <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                 {status === 'COMPLETED' && !isPaid && <span>⏳ Please add prescription to allow patient payment</span>}
                                 {status === 'COMPLETED' && isPaid && <span className="text-green-600 font-semibold">✓ Paid & Prescription Added</span>}
                                 {status === 'PENDING' && <span className="text-orange-600 font-semibold">Action Required</span>}
                              </div>

                              {/* Right: Buttons */}
                              <div className="flex gap-3 w-full md:w-auto justify-end flex-wrap">
                                
                                <button 
                                   onClick={() => handleViewHistory(appt)}
                                   className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition"
                                >
                                   📂 History
                                </button>

                                {status === 'PENDING' ? (
                                   <>
                                     <button 
                                        onClick={() => handleRejectAndDelete(appt.id)} 
                                        className="px-5 py-2 rounded-xl text-sm font-bold text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 transition"
                                     >
                                        Reject
                                     </button>
                                     <button 
                                        onClick={() => handleAccept(appt.id)} 
                                        className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                                        style={{ backgroundColor: primary }}
                                     >
                                        Accept
                                     </button>
                                   </>
                                 ) : (
                                   <>
                                      {viewMode === 'pending' && (
                                        <button 
                                           onClick={() => openPrescriptionModal(appt)}
                                           className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition"
                                        >
                                           📝 Add Rx
                                        </button>
                                      )}

                                      {viewMode === 'completed' && (
                                          <button 
                                             onClick={() => openPrescriptionModal(appt)}
                                             className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-gray-700 hover:bg-gray-800 shadow-md transition"
                                          >
                                             ✏️ Edit Rx
                                          </button>
                                      )}

                                      <button 
                                          onClick={() => handleDelete(appt.id)} 
                                          className="px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                                      >
                                          🗑
                                      </button>
                                   </>
                                 )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PRESCRIPTION MODAL --- */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-white font-bold text-xl">Write Prescription</h3>
                <p className="text-indigo-200 text-sm mt-1">
                   For: <span className="font-bold text-white">{selectedApptForPrescription?.patientName}</span>'s pet <span className="font-bold text-white">{selectedApptForPrescription?.petName}</span>
                </p>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl font-bold transition">&times;</button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <textarea 
                className="w-full border-2 border-gray-200 rounded-2xl p-6 h-64 focus:border-indigo-500 outline-none resize-none text-lg leading-relaxed bg-gray-50 focus:bg-white transition-colors"
                placeholder="Enter medicines, dosage, and instructions..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
              />
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowPrescriptionModal(false)} 
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-white border border-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={savePrescription} 
                className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MEDICAL HISTORY MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-800 p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-white font-bold text-lg">Pet Medical History</h3>
                <p className="text-gray-300 text-sm mt-1">
                   {selectedApptForHistory?.petName} • {selectedApptForHistory?.patientName}
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              {medicalHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No medical records found.</div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map((record) => (
                    <div key={record.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">{record.diagnosis}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{record.date}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed pl-3 border-l-4 border-indigo-100">{record.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white text-center shrink-0">
                <button 
                    onClick={() => setShowHistoryModal(false)} 
                    className="px-8 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                    Close History
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorAppointments;