import React, { useContext, useState, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import { updateDoctorProfile } from '../../api/dataService';

// --- SVG ICONS ---
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IdCardIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const DoctorProfile = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;  

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: user?.specialization || 'General Veterinary',
    license: user?.license || '',
    fee: user?.fee || 500,
    bio: user?.bio || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if(user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        specialization: user.specialization || prev.specialization,
        fee: user.fee || prev.fee,
        license: user.license || prev.license
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;

    setIsSaving(true);
    try {
      await updateDoctorProfile(user.id, profileData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="doctor-profile" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="My Profile" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- LEFT COLUMN: PROFILE CARD (Read Only & Stats) --- */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cover / Avatar Area */}
                <div className="relative h-32 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-4xl overflow-hidden">
                       {/* Placeholder Avatar or Emoji */}
                       <span role="img" aria-label="doctor">🩺</span>
                       
                       {/* Hover Overlay for Change Photo */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h7.86a2 2 0 011.664.89l.812 1.22A2 2 0 0121 9v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                       </div>
                    </div>
                  </div>
                </div>
                
                {/* Info Block */}
                <div className="pt-14 pb-6 px-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Dr. {profileData.name}</h2>
                  <p className="text-indigo-600 font-medium mt-1">{profileData.specialization}</p>
                </div>
              </div>

              {/* Read-Only Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                   <p className="text-gray-800 font-medium truncate">{profileData.email}</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">License Number</p>
                   <p className="text-gray-800 font-mono">{profileData.license || 'N/A'}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-indigo-600">4.9</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Rating</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <p className="text-2xl font-bold text-gray-800">1.2k</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Patients</p>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: EDIT FORM --- */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your public profile information.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BriefcaseIcon />
                      </div>
                      <input 
                        type="text" 
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Fee */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Fee (₹)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyIcon />
                      </div>
                      <input 
                        type="number" 
                        name="fee"
                        value={profileData.fee}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* License (Editable here for context, or keep read-only if preferred) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">License Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdCardIcon />
                      </div>
                      <input 
                        type="text" 
                        name="license"
                        value={profileData.license}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio (Full Width) */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
                  <textarea 
                    name="bio"
                    rows="5" 
                    value={profileData.bio}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none resize-none transition-all"
                    placeholder="Describe your experience, skills, and approach to treatment..."
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-2 text-right">{profileData.bio.length} characters</p>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ background: primary }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : 'Save Changes'}
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

export default DoctorProfile;