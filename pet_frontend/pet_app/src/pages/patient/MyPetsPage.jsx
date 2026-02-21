import React, { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import { getPrescriptions } from '../../api/dataService';

const MyPetsPage = ({ onNavigate, user, onAddPet, onDeletePet, onUpdatePet, getPrescriptions }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  // --- 1. HELPER: GET PET EMOJI ---
  const getPetEmoji = (pet) => {
    const type = (pet.type || pet.breed || "").toLowerCase();
    if (type.includes('cat')) return '🐱';
    if (type.includes('dog')) return '🐶';
    if (type.includes('bird')) return '🐦';
    if (type.includes('rabbit')) return '🐰';
    return '🐶'; // Default dog emoji
  };

  // --- 2. HELPER: MOCK DATA GENERATOR ---
  const generateMockData = (pet) => {
    if (!pet) return null;
    
    const baseWeight = 20 + Math.random() * 20;
    const today = new Date();
    
    // Generate Vaccinations
    const vaccines = [
      { id: 1, name: "Rabies", dateAdministered: "2023-01-10", nextDue: "2024-01-10", status: "Valid" },
      { id: 2, name: "Bordetella", dateAdministered: "2023-06-15", nextDue: "2023-12-15", status: "Upcoming" },
      { id: 3, name: "Distemper", dateAdministered: "2023-01-10", nextDue: "2024-01-10", status: "Valid" }
    ];

    // Generate Medical History
    const history = [
      { date: "2023-12-01", type: "Annual Checkup", notes: "Annual physical examination. Heart rate normal, teeth clean.", vet: "Dr. Emily Stone" },
      { date: "2023-08-15", type: "Infection", notes: "Treated for minor ear infection. Prescribed otic drops.", vet: "Dr. John Doe" },
      { date: "2022-12-10", type: "Vaccination", notes: "Administered DHPP and Rabies booster.", vet: "Dr. Emily Stone" }
    ];

    // Generate Weight History (Last 6 months)
    const weights = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(today.getMonth() - (5 - i));
      return { date: d.toLocaleDateString('en-US', { month: 'short' }), weight: parseFloat((baseWeight + (i * 0.5)).toFixed(1)) };
    });

    return {
      vaccinations: vaccines,
      medicalHistory: history,
      weightHistory: weights,
      currentWeight: weights[0].weight,
      nextVaccination: vaccines[1]
    };
  };

  // --- DATA HANDLING ---
  // Fallback demo pet used for initial render
  const demoPet = {
    id: 999,
    name: "Buddy (Demo)",
    breed: "Golden Retriever",
    type: "Dog",
    age: "3",
    weight: 32,
    vaccinations: [],
    medicalHistory: [],
    weightHistory: []
  };

  const [selectedPet, setSelectedPet] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);  
  
  // --- NEW STATE FOR PRESCRIPTIONS & DUMMY DATA ---
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [mockData, setMockData] = useState(null);

  // --- FETCH PRESCRIPTIONS & GENERATE DUMMY DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (selectedPet && selectedPet.id && selectedPet.id !== 999) {
        // 1. Generate Mock Data for this specific pet
        setMockData(generateMockData(selectedPet));

        // 2. Fetch Prescriptions from API
        if (activeTab === 'prescriptions') {
            setLoadingPrescriptions(true);
            try {
              const res = await getPrescriptions(selectedPet.id);
              setPrescriptions(res.data);
            } catch (error) {
              console.error("Error fetching prescriptions:", error);
              setPrescriptions([]);
            } finally {
              setLoadingPrescriptions(false);
            }
        }
      } else {
        // Reset if no pet selected
        setPrescriptions([]);
        setMockData(null);
      }
    };

    fetchData();
  }, [selectedPet, activeTab, getPrescriptions]);

  // --- CHART COMPONENT (Simple CSS Bar Chart) ---
  const WeightChart = ({ history }) => {
    if (!history || history.length === 0) return <p className="text-gray-500 text-center py-10">No data</p>;
    const maxWeight = Math.max(...history.map(h => parseFloat(h.weight) || 0)) * 1.2;
    
    return (
      <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2 border-l border-gray-300 pb-2 relative">
        {history.map((entry, index) => {
          const heightPercent = (parseFloat(entry.weight) / maxWeight) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 group relative h-full justify-end">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {entry.weight} kg
              </div>
              <div className="w-full rounded-t-md transition-all duration-500 hover:opacity-80" style={{ height: `${heightPercent}%`, backgroundColor: primary, minHeight: '4px' }}></div>
              <span className="text-xs mt-2 text-gray-500 truncate w-full text-center">{entry.date}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // --- MODALS (Add/Edit) ---
  const EditPetModal = ({ isOpen, onClose, pet }) => {
    if (!isOpen || !pet) return null;
    const [formData, setFormData] = useState({ name: pet.name, breed: pet.breed, age: pet.age, weight: pet.weight, type: pet.type || "Dog" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { setFormData({ name: pet.name, breed: pet.breed, age: pet.age, weight: pet.weight, type: pet.type || "Dog" }); }, [pet]);

    const handleSubmit = async (e) => {
      e.preventDefault(); setIsSubmitting(true);
      try { const payload = { ...formData, age: parseFloat(formData.age), weight: parseFloat(formData.weight), type: formData.type };
        await onUpdatePet(pet.id, payload); onClose(); 
      } catch (error) { console.error("Error:", error); alert("Failed to update pet."); } finally { setIsSubmitting(false); }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Pet Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-4">
              <span className="text-6xl bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-md transition-transform duration-300">{getPetEmoji({ type: formData.type })}</span>
              <span className="text-sm text-gray-500 mt-2 capitalize">{formData.type}</span>
            </div>
            <div><label className="block text-sm font-semibold mb-1">Type of Pet</label><select required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Rabbit">Rabbit</option>
            </select></div>
            <div><label className="block text-sm font-semibold mb-1">Pet Name</label><input required type="text" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold mb-1">Breed</label><input required type="text" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-1">Age (Yrs)</label><input required type="number" step="0.1" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} /></div><div><label className="block text-sm font-semibold mb-1">Weight (kg)</label><input required type="number" step="0.1" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} /></div></div>
            <div className="flex gap-3 mt-6"><button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700">Cancel</button><button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div>
          </form>
        </div>
      </div>
    );
  };

  const AddPetModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ name: '', breed: '', age: '', weight: '', type: 'Dog' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault(); setIsSubmitting(true);
      try { const payload = { ...formData, age: formData.age, weight: formData.weight, type: formData.type }; await onAddPet(payload); onClose(); setFormData({ name: '', breed: '', age: '', weight: '', type: 'Dog' }); } catch (error) { console.error("Error:", error); } finally { setIsSubmitting(false); }
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Pet</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-4">
              <span className="text-6xl bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-md transition-transform duration-300">{getPetEmoji({ type: formData.type })}</span>
              <span className="text-sm text-gray-500 mt-2 capitalize">{formData.type}</span>
            </div>
            <div><label className="block text-sm font-semibold mb-1">Type of Pet</label><select required className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Rabbit">Rabbit</option></select></div>
            <div><label className="block text-sm font-semibold mb-1">Pet Name</label><input required type="text" className="w-full p-3 rounded-xl border border-gray-300" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold mb-1">Breed</label><input required type="text" className="w-full p-3 rounded-xl border border-gray-300" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-1">Age</label><input required type="number" step="0.1" className="w-full p-3 rounded-xl border border-gray-300" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} /></div><div><label className="block text-sm font-semibold mb-1">Weight</label><input required type="number" step="0.1" className="w-full p-3 rounded-xl border border-gray-300" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} /></div></div>
            <div className="flex gap-3 mt-6"><button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700">Cancel</button><button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-colors">{isSubmitting ? 'Saving...' : 'Save Pet'}</button></div>
          </form>
        </div>
      </div>
    );
  };

  // Use mock data or real data from user props
  const availablePets = (Array.isArray(user?.pets) && user.pets.length > 0) ? user.pets : [demoPet];

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => onNavigate('patient-dashboard')} className="text-sm mb-2 flex items-center gap-1 hover:underline" style={{ color: primary }}>← Back to Dashboard</button>
            <h1 className="text-4xl font-bold text-gray-800">My Pets</h1>
          </div>
          {!selectedPet && (
            <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg" style={{ background: primary }}>+ Add Pet</button>
          )}
        </div>

        {/* VIEW 1: PET LIST */}
        {!selectedPet ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePets.map((pet) => (
              <div key={pet.id} onClick={() => setSelectedPet(pet)} className="p-6 rounded-3xl shadow-md cursor-pointer hover:scale-[1.02] transition-all duration-200 relative group bg-white border-l-4" style={{ borderColor: primary }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl">{getPetEmoji(pet)}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                </div>
                <h3 className="text-2xl font-bold mb-1 text-gray-800">{pet.name}</h3>
                <p className="text-gray-500 mb-4">{pet.breed} • {pet.age} years</p>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditingPet(pet); setIsEditModalOpen(true); }} className="p-2 bg-white rounded-full shadow text-blue-600 hover:bg-blue-50 transition-colors">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); if(window.confirm(`Delete ${pet.name}?`)) onDeletePet(pet.id); }} className="p-2 bg-white rounded-full shadow text-red-500 hover:bg-red-50 transition-colors">🗑️</button>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs font-semibold uppercase opacity-60 mb-2">Health Status</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span>💉</span>
                    <span>{pet.vaccinations && pet.vaccinations.length > 0 ? `Next: ${pet.vaccinations[0].nextDue}` : 'No records'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* VIEW 2: PET DETAIL */
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Column */}
            <div className="lg:w-1/3">
              <div className="p-6 rounded-3xl shadow-md mb-6 bg-white">
                <button onClick={() => setSelectedPet(null)} className="text-sm mb-4 flex items-center gap-1 hover:underline text-amber-600">← Back to List</button>
                <div className="text-center">
                  <div className="text-8xl mb-4 inline-block">{getPetEmoji(selectedPet)}</div>
                  <h2 className="text-3xl font-bold mb-1 text-gray-800">{selectedPet.name}</h2>
                  <p className="text-gray-500">{selectedPet.breed}</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 rounded-2xl bg-gray-100">
                      <p className="text-xs uppercase opacity-60">Age</p>
                      <p className="font-bold text-lg">{selectedPet.age} yrs</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-100">
                      <p className="text-xs uppercase opacity-60">Weight</p>
                      <p className="font-bold text-lg">{mockData ? mockData.currentWeight : selectedPet.weight || '?'} kg</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Analytics Card (NEW) */}
              <div className="p-6 rounded-3xl shadow-md bg-white">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800"><span>📊</span> Health Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Status</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <WeightChart history={mockData ? mockData.weightHistory : []} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:w-2/3">
              <div className="rounded-3xl shadow-md overflow-hidden flex flex-col h-full bg-white">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {['Overview', 'Medical History', 'Analytics', 'Vaccination Records', 'Prescriptions'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))} className={`flex-1 min-w-[130px] py-4 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase().replace(' ', '') ? 'text-white bg-teal-500' : 'opacity-60 hover:bg-gray-50'}`}>{tab}</button>
                  ))}
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-bold text-lg text-gray-800">Pet Info</h3>
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
                        <div className="text-center">
                           <div className="text-8xl mb-4 inline-block">{getPetEmoji(selectedPet)}</div>
                           <h2 className="text-3xl font-bold mb-1 text-gray-800">{selectedPet.name}</h2>
                           <p className="text-gray-500">{selectedPet.breed}</p>
                           <div className="grid grid-cols-2 gap-4 mt-6">
                             <div className="p-3 rounded-2xl bg-white/60">
                               <p className="text-xs uppercase opacity-60">Age</p>
                               <p className="font-bold text-lg text-teal-800">{selectedPet.age} yrs</p>
                             </div>
                             <div className="p-3 rounded-2xl bg-white/60">
                               <p className="text-xs uppercase opacity-60">Weight</p>
                               <p className="font-bold text-lg text-teal-800">{mockData ? mockData.currentWeight : selectedPet.weight || '?'} kg</p>
                             </div>
                           </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                          <p className="text-sm text-blue-600 font-semibold">Total Vaccinations</p>
                          <p className="text-3xl font-bold text-blue-800">{selectedPet.vaccinations?.length || 0}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                          <p className="text-sm text-purple-600 font-semibold">Medical Visits</p>
                          <p className="text-3xl font-bold text-purple-800">{selectedPet.medicalHistory?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MEDICAL HISTORY */}
                  {activeTab === 'medicalhistory' && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-bold text-lg text-gray-800">Clinical History</h3>
                      {!(mockData && mockData.medicalHistory) || (mockData && mockData.medicalHistory.length === 0) ? (
                        <p className="opacity-50 text-center py-10">No history</p>
                      ) : (
                        <div className="relative border-l-2 ml-3 space-y-8 pl-6 border-amber-500">
                          {(mockData ? mockData.medicalHistory : []).map((record, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[31px] top-1 bg-white border-2 border-amber-500 w-4 h-4 rounded-full"></div>
                              <div className="p-4 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between mb-2">
                                  <span className="font-bold text-teal-600">{record.type}</span>
                                  <span className="text-sm font-mono opacity-60 bg-gray-100 px-2 py-1 rounded">{record.date}</span>
                                </div>
                                <p className="text-sm opacity-80 mb-2">{record.notes}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">👨‍⚕️ {record.vet}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ANALYTICS */}
                  {activeTab === 'analytics' && (
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Weight Trend</h3>
                        <span className="text-sm opacity-60">Last 6 months</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-gray-200">
                        <WeightChart history={mockData ? mockData.weightHistory : []} />
                      </div>
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl text-center shadow-sm bg-teal-50">
                          <p className="text-xs uppercase font-bold opacity-60 tracking-wider">Avg Weight</p>
                          <p className="text-2xl font-bold mt-1 text-teal-600">
                            {mockData && mockData.weightHistory && mockData.weightHistory.length > 0 
                              ? (mockData.weightHistory.reduce((acc, curr) => acc + parseFloat(curr.weight), 0) / mockData.weightHistory.length).toFixed(1) 
                              : '-'} kg
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl text-center shadow-sm bg-amber-50">
                          <p className="text-xs uppercase font-bold opacity-60 tracking-wider">Current</p>
                          <p className="text-2xl font-bold mt-1 text-amber-600">{selectedPet.weight || '-'} kg</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: VACCINATION RECORDS */}
                  {activeTab === 'vaccinationrecords' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Vaccination Records</h3>
                        {/* Add Button (Mock) */}
                        <button className="text-sm font-bold text-teal-600 hover:underline">+ Add Record</button>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr className="opacity-60 text-sm">
                              <th className="py-3 px-4">Vaccine</th>
                              <th className="py-3 px-4">Date Administered</th>
                              <th className="py-3 px-4">Next Due</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {!(mockData && mockData.vaccinations) || (mockData && mockData.vaccinations.length === 0) ? (
                              <tr><td colSpan="4" className="p-6 text-center opacity-50">No records</td></tr>
                            ) : (
                              (mockData ? mockData.vaccinations : []).map((v, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium">{v.name}</td>
                                  <td className="py-3 px-4 opacity-80">{v.dateAdministered}</td>
                                  <td className="py-3 px-4 opacity-80">{v.nextDue}</td>
                                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${v.status === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span></td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: PRESCRIPTIONS (API LINKED) */}
                  {activeTab === 'prescriptions' && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">Prescriptions</h3>
                      
                      {loadingPrescriptions ? (
                        <div className="text-center py-10 text-gray-400">Loading prescriptions...</div>
                      ) : prescriptions.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                          <p className="text-gray-500">No prescriptions found for {selectedPet.name}.</p>
                          <p className="text-xs mt-2 opacity-60">Prescriptions will appear here once a doctor prescribes medication.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {prescriptions.map((presc) => (
                            <div key={presc.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">Rx</span>
                                  <h4 className="font-bold text-lg text-gray-800">{presc.drugName || "Medication"}</h4>
                                </div>
                                <p className="text-sm text-gray-600"><span className="font-semibold">Dosage:</span> {presc.dosage}</p>
                                {presc.instructions && (
                                  <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded">{presc.instructions}</p>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-400">Issued</div>
                                <div className="text-sm font-medium text-gray-600">{presc.dateIssued}</div>
                              </div>
                              <div className="text-right mt-2">
                                <div className="text-xs text-gray-500">Dr.</div>
                                <div className="text-sm font-medium text-gray-800">{presc.doctorName}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AddPetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditPetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} pet={editingPet} />
    </div>
  );
};

export default MyPetsPage;