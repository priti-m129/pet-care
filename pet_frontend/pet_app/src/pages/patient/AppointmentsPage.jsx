import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import PatientHeader from '../../components/headers/PatientHeader';
import { getAppointments, getDoctors, getPets, deleteAppointment } from '../../api/dataService';

const AppointmentsPage = ({ onNavigate, user, onBook, onUpdateStatus, refreshKey }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  const [showForm, setShowForm] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [viewPrescriptionData, setViewPrescriptionData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingAppt, setReviewingAppt] = useState(null);
  
  // --- STATE: Success Popup ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]); 
  const [doctors, setDoctors] = useState([]); 
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // --- NEW STATE FOR SEARCH & TABS ---
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const CONSULTATION_FEES = {
    'General Checkup': 300,
    'Vaccination': 200,
    'Dental Cleaning': 600,
    'Emergency': 1500
  };

  const [formData, setFormData] = useState({ petName: '', type: '', doctorId: '', date: '', time: '' });

  // --- FETCH SLOTS ---
  const fetchSlots = async (doctorId, date) => {
      if (!doctorId || !date) return;
      setIsLoadingSlots(true);
      setAvailableSlots([]); 
      try {
          const response = await fetch(`http://localhost:8080/api/patient/availability/slots?doctorId=${doctorId}&date=${date}`);
          if (response.ok) {
              const slots = await response.json();
              const slotOptions = slots.map(time => {
                  const [hours, minutes] = time.split(':');
                  const h = parseInt(hours, 10);
                  const m = parseInt(minutes, 10);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const h12 = h % 12 || 12;
                  const minStr = m < 10 ? '0'+m : m;
                  return { value: time, label: `${h12}:${minStr} ${ampm}` };
              });
              setAvailableSlots(slotOptions);
          } else { setAvailableSlots([]); }
      } catch (error) { console.error("Error fetching slots", error); }
      finally { setIsLoadingSlots(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.id) {
        try {
          if (pets.length === 0) {
            const petsRes = await getPets(user.id);
            setPets(petsRes.data);
            const docsRes = await getDoctors();
            setDoctors(docsRes.data);
          }
          const apptsRes = await getAppointments(user.id);
          setAppointments(apptsRes.data);
        } catch (error) { console.error("Failed to fetch data", error); }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 1500); 
    return () => clearInterval(interval);
  }, [user?.id, refreshKey]); 

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const docIdNum = parseInt(docId);
    const docObj = doctors.find(d => d.id === docIdNum);
    setFormData({ ...formData, doctorId: docId });
    setSelectedDoctor(docObj || null);
    if (formData.date) fetchSlots(docIdNum, formData.date);
    else setAvailableSlots([]); 
  };

  const handleDateChange = (e) => {
      const date = e.target.value;
      setFormData({ ...formData, date });
      if (selectedDoctor) fetchSlots(selectedDoctor.id, date);
      else setAvailableSlots([]);
  };

  const typeFee = formData.type ? (CONSULTATION_FEES[formData.type] || 0) : 0;
  const doctorFee = selectedDoctor ? (selectedDoctor.fee || 500) : 500;
  const totalFee = typeFee + doctorFee;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onBook({ 
        ...formData, 
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : null, 
        fee: totalFee, 
        typeFee: typeFee, 
        doctorFee: doctorFee 
      });

      setShowForm(false);
      setShowSuccessModal(true);

      setFormData({ petName: '', type: '', doctorId: '', date: '', time: '' });
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error("Booking failed", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const handleOneAction = (appt) => {
    const status = appt.status?.toUpperCase();
    if (status === 'COMPLETED') return; 
    if (status === 'REJECTED') { if (window.confirm("Delete this rejected appointment?")) handleDelete(appt.id); } 
    else { if (window.confirm("Cancel this appointment?")) handleDelete(appt.id); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try { setAppointments(appointments.filter(appt => appt.id !== id)); await deleteAppointment(id); } 
    catch (error) { console.error(error); alert("Failed to delete"); }
  };

  const handlePayClick = (appt) => {
    if (!window.Razorpay) return alert("Razorpay SDK not loaded");
    const options = { key: "rzp_test_S7IJ8H7u2xLJ3A", amount: appt.fee * 100, currency: "INR", name: "Pet Care Clinic", description: `Appointment Total: ₹${appt.fee}`, handler: async (response) => {
        alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
        if (onUpdateStatus) await onUpdateStatus(appt.id, 'COMPLETED', { paymentMethod: 'RAZORPAY', paymentStatus: 'PAID', razorpay_payment_id: response.razorpay_payment_id });
        const apptsRes = await getAppointments(user.id); setAppointments(apptsRes.data);
    }, prefill: { name: user?.name, email: user?.email, contact: user?.phone } };
    const rzp = new window.Razorpay(options); rzp.open();
  };

  const handleViewPrescription = (appt) => { 
      if (!appt.prescription || appt.prescription.trim() === "") {
          alert("Doctor has not added a prescription yet.");
          return;
      }
      setViewPrescriptionData(appt); 
      setShowPrescriptionModal(true); 
  };
  
  const handleOpenReview = (appt) => { setReviewingAppt(appt); setRating(0); setReviewComment(''); setShowReviewModal(true); };
  const submitReview = async () => { if (rating === 0) return alert("Please select a star rating"); if (onUpdateStatus) await onUpdateStatus(reviewingAppt.id, 'COMPLETED', { rating, reviewComment }); setShowReviewModal(false); };

  // --- FILTER LOGIC ---
  const filteredAppointments = appointments.filter(appt => {
    const status = appt.status?.toUpperCase();
    
    // Tab Filter
    const matchesTab = activeTab === 'ALL' || status === activeTab;

    // Search Filter
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      (appt.petName && appt.petName.toLowerCase().includes(lowerQuery)) ||
      (appt.doctorName && appt.doctorName.toLowerCase().includes(lowerQuery)) ||
      (appt.type && appt.type.toLowerCase().includes(lowerQuery)) ||
      (appt.date && appt.date.includes(lowerQuery));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-full w-full" style={{ background: bg }}>
      <PatientHeader title="Appointments" onNavigate={onNavigate} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <button onClick={() => onNavigate('patient-dashboard')} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-200/50 text-base" style={{ color: text }}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back</button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow hover:shadow-lg transition-all active:scale-95 text-base" style={{ background: primary, color: 'white' }}>{showForm ? 'Cancel' : 'Book New'}</button>
        </div>

        {showForm && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-lg animate-slide-down border border-gray-100" style={{ background: surface }}>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-6" style={{ color: text }}>New Appointment</h3>
              {pets.length === 0 ? <div className="text-center py-6 bg-yellow-50 rounded-xl text-yellow-800">No pets found.</div> : (
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Pet</label><select required className="input-focus w-full pl-10 pr-3 py-2.5 rounded-lg border-2 appearance-none bg-transparent transition-all text-sm" style={{ borderColor: `${primary}30`, color: text }} value={formData.petName} onChange={e => setFormData({...formData, petName: e.target.value})}><option value="">Choose pet</option>{pets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Type</label><select required className="input-focus w-full pl-10 pr-3 py-2.5 rounded-lg border-2 appearance-none bg-transparent transition-all text-sm" style={{ borderColor: `${primary}30`, color: text }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="">Select type</option>{Object.keys(CONSULTATION_FEES).map(type => (<option key={type} value={type}>{type} (₹{CONSULTATION_FEES[type]})</option>))}</select></div>
                  <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Doctor</label><select required className="input-focus w-full pl-10 pr-3 py-2.5 rounded-lg border-2 appearance-none bg-transparent transition-all text-sm" style={{ borderColor: `${primary}30`, color: text }} value={formData.doctorId} onChange={handleDoctorChange}><option value="">Select doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} (₹{d.fee || 500})</option>)}</select></div>
                  <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Fee</label><div className="flex flex-col items-center justify-center h-[46px] rounded-lg border-2 font-bold text-xl bg-white shadow-sm" style={{ borderColor: primary, color: primary }}><span>₹{totalFee}</span></div></div>
                  <div className="space-y-1"><label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Date</label><input required type="date" className="input-focus w-full pl-10 pr-3 py-2.5 rounded-lg border-2 appearance-none bg-transparent transition-all text-sm" style={{ borderColor: `${primary}30`, color: text }} value={formData.date} onChange={handleDateChange} /></div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide opacity-70 ml-1">Time Slot</label>
                    <div className="relative">
                        {isLoadingSlots ? <div className="w-full h-[46px] flex items-center justify-center rounded-lg border-2 bg-gray-50 text-sm text-gray-500 border-gray-200"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading slots...</div> : 
                        <select required className="input-focus w-full pl-10 pr-3 py-2.5 rounded-lg border-2 appearance-none bg-transparent transition-all text-sm" style={{ borderColor: `${primary}30`, color: text }} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
                            <option value="">Select time</option>
                            {availableSlots.length > 0 ? availableSlots.map(s => <option key={s.value} value={s.value}>{s.label}</option>) : <option disabled>Select date & doctor</option>}
                        </select>}
                        <span className="absolute left-3 top-3 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-2"><button type="submit" className="w-full py-3 rounded-lg font-bold text-lg shadow hover:shadow-lg transition-all" style={{ background: primary, color: 'white' }}>Confirm Appointment</button></div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- NEW SEARCH & TABS SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${activeTab === tab ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        style={activeTab === tab ? { background: primary } : { background: 'transparent' }}
                    >
                        {tab === 'ALL' ? 'All Appointments' : tab}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
                <span className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search by doctor, pet, or date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 focus:outline-none focus:ring-0 transition-all text-sm shadow-sm bg-white"
                    style={{ borderColor: `${primary}30`, color: text }}
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
        {/* ------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.length === 0 && (
            <div className="col-span-full text-center py-16 opacity-50 flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold" style={{color: text}}>No Appointments Found</h3>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter.</p>
            </div>
          )}
          {filteredAppointments.map((appt) => {
            const status = appt.status?.toUpperCase();
            const isPaid = appt.paymentStatus === 'PAID';
            
            const hasPrescription = appt.prescription && appt.prescription.trim() !== "";
            const canPay = status === 'COMPLETED' && !isPaid && hasPrescription;
            const canReview = isPaid && hasPrescription && (!appt.rating || appt.rating === 0);

            const getStatusBadge = () => {
                switch(status) {
                    case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending Approval</span>;
                    case 'REJECTED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Rejected</span>;
                    case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Cancelled</span>;
                    case 'COMPLETED': 
                        if(isPaid) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Paid & Completed</span>;
                        if(!hasPrescription) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Processing</span>;
                        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">Ready for Payment</span>;
                    default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{status}</span>;
                }
            };

            const displayDocFee = (appt.doctorFee || 0);
            const displayTypeFee = (appt.typeFee || 0);

            return (
            <div key={appt.id} className="relative group p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 flex flex-col" style={{ background: surface }}>
              <div className="flex justify-between items-start mb-5">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="text-xl font-bold tracking-tight" style={{ color: text }}>{appt.type}</span></div>
                    <div className="flex items-center gap-2 text-sm opacity-75 font-medium" style={{ color: text }}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg><span>{appt.petName}</span></div>
                </div>
                {getStatusBadge()}
              </div>
              <div className="grid grid-cols-2 gap-y-4 mb-6 bg-gray-50/50 rounded-xl p-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Date & Time</span>
                    <span className="font-semibold text-sm flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{appt.date}</span>
                    <span className="text-sm opacity-80 font-medium">{appt.time}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Doctor</span>
                    <span className="font-semibold text-sm flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{appt.doctorName || 'Dr. Unknown'}</span>
                </div>
                <div className="flex flex-col col-span-2 border-t border-gray-200/50 pt-3 mt-1">
                    <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Total Fee</span><span className="font-bold text-2xl" style={{ color: primary }}>₹{appt.fee}</span></div>
                    {(displayTypeFee > 0 || displayDocFee > 0) && (<div className="flex justify-between text-xs text-gray-400 mt-1 border-t border-dashed pt-1"><span>Type: ₹{displayTypeFee}</span><span>Doc: ₹{displayDocFee}</span></div>)}
                </div>
              </div>
              <div className="mt-auto space-y-2">
                {canPay && (
                  <button onClick={() => handlePayClick(appt)} className="w-full py-3 rounded-xl font-bold text-white text-base flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-sm" style={{ background: primary }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>Pay ₹{appt.fee} Now
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                    {hasPrescription && (
                        <button onClick={() => handleViewPrescription(appt)} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Prescription
                        </button>
                    )}
                    {canReview && (
                        <button onClick={() => handleOpenReview(appt)} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors border border-yellow-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> Rate Doctor
                        </button>
                    )}
                </div>
                {(status === 'PENDING' || status === 'REJECTED') && (
                  <button onClick={() => handleOneAction(appt)} className="w-full py-2.5 mt-1 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{status === 'REJECTED' ? 'Delete Rejected Appt' : 'Cancel Appointment'}
                  </button>
                )}
                {status === 'COMPLETED' && (
                  <button onClick={() => handleDelete(appt.id)} className="w-full py-2 mt-1 text-center text-xs text-red-400 hover:text-red-600 underline decoration-dashed">Remove from history</button>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>
      
      {/* PRESCRIPTION MODAL */}
      {showPrescriptionModal && viewPrescriptionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="bg-purple-600 p-6 pb-10 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-purple-800 opacity-50"></div>
                <h3 className="text-white font-bold text-xl tracking-wide">Medical Prescription</h3>
                <p className="text-purple-200 text-sm mt-1">Dr. {viewPrescriptionData.doctorName} • {viewPrescriptionData.date}</p>
                <button onClick={() => setShowPrescriptionModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6 -mt-4">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-50 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <span className="text-9xl font-serif text-purple-900">Rx</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-500 mb-4 border-b pb-2">
                  <span>Patient: {viewPrescriptionData.petName}</span>
                  <span>Date: {viewPrescriptionData.date}</span>
                </div>
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="font-serif text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {viewPrescriptionData.prescription}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <div className="text-xs text-gray-400">Pet Care Clinic</div>
                  <button onClick={() => setShowPrescriptionModal(false)} className="px-5 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100 transition-colors text-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && reviewingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-xl text-gray-800">Rate Your Visit</h3>
                <p className="text-sm text-gray-500">Dr. {reviewingAppt.doctorName}</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="w-full mb-4">
                <textarea
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none transition-all h-28 bg-gray-50 resize-none text-sm"
                  placeholder="Tell us about your experience (optional)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
              </div>
              <button onClick={submitReview} className="w-full py-3 rounded-lg font-bold text-base text-white bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl transition-all">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce-short">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Your appointment has been confirmed.<br/>A confirmation email has been sent to your inbox.
              </p>
              
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;