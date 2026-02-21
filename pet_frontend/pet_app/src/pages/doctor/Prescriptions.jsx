import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import { getActivePatients, issuePrescription } from '../../api/dataService';

const Prescriptions = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  const [formData, setFormData] = useState({ petId: '', drug: '', dosage: '', instructions: '' });
  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. FETCH ACTIVE PATIENTS FOR DROPDOWN ---
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getActivePatients();
        setPatients(res.data);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.petId) {
      alert("Please select a patient/pet.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send data to backend
      await issuePrescription({
        pet: { id: formData.petId }, // Backend expects Pet object
        drug: formData.drug,
        dosage: formData.dosage,
        instructions: formData.instructions
      });
      
      alert('Prescription Issued Successfully!');
      setFormData({ petId: '', drug: '', dosage: '', instructions: '' });
    } catch (error) {
      console.error("Error issuing prescription:", error);
      alert("Failed to issue prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="prescriptions" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Prescriptions" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Create Prescription Form */}
            <div className="p-8 rounded-3xl shadow-md mb-8" style={{ background: surface }}>
              <h3 className="font-bold mb-6" style={{ fontSize: `${fontSize * 1.4}px`, color: text }}>Issue New Prescription</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 opacity-70">Select Patient / Pet</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#14b8a6]"
                    value={formData.petId}
                    onChange={(e) => setFormData({...formData, petId: e.target.value})}
                    required
                  >
                    <option value="">Choose a pet...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.petName} (Owner: {p.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-70">Drug Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#14b8a6]"
                    placeholder="e.g. Amoxicillin"
                    value={formData.drug}
                    onChange={(e) => setFormData({...formData, drug: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-70">Dosage</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#14b8a6]"
                    placeholder="e.g. 500mg twice daily"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 opacity-70">Instructions</label>
                  <textarea 
                    rows="3"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#14b8a6]"
                    placeholder="Additional notes..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all" style={{ background: primary, opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Issuing...' : 'Issue Prescription'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;