import React from 'react';
import { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const DoctorSidebar = ({ activeView, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, secondary_action_color: secondary, font_size: fontSize } = config;

  // Helper to determine if a link is active
  const isActive = (viewName) => activeView === viewName;

  const linkClass = (viewName) => `
    flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200 cursor-pointer
    ${isActive(viewName) 
      ? `bg-[${secondary}] text-white shadow-lg` 
      : `text-[${text}] opacity-70 hover:opacity-100 hover:bg-[${surface}]`
    }
  `;

  const sectionTitleClass = `
    mt-6 mb-3 px-4 text-xs font-bold uppercase tracking-wider opacity-50
  `;

  return (
    <div 
      className="hidden md:flex flex-col w-72 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto border-r border-opacity-10 p-4 rounded-r-3xl"
      style={{ background: surface, borderColor: text, color: text }}
    >
      
      {/* --- MAIN NAVIGATION --- */}
      <div style={{ fontSize: `${fontSize * 0.9}px` }}>
        <p className={sectionTitleClass}>Menu</p>
        
        <div className={linkClass('dashboard')} onClick={() => onNavigate('dashboard')}>
          <span className="mr-3 text-xl">📊</span> Dashboard
        </div>
        <div className={linkClass('appointments')} onClick={() => onNavigate('appointments')}>
          <span className="mr-3 text-xl">📅</span> Appointments
        </div>
        <div className={linkClass('consultations')} onClick={() => onNavigate('consultations')}>
          <span className="mr-3 text-xl">📹</span> Consultations
        </div>
        {/* Pet Records Removed */}
        {/* Prescriptions Removed */}
        {/* Messages Removed */}
        <div className={linkClass('availability')} onClick={() => onNavigate('availability')}>
          <span className="mr-3 text-xl">⏰</span> Availability
        </div>
        <div className={linkClass('profile')} onClick={() => onNavigate('profile')}>
          <span className="mr-3 text-xl">👤</span> Profile
        </div>

        {/* --- DASHBOARD SPECIFIC / MAIN OPTIONS --- */}
        <p className={sectionTitleClass}>Quick Access</p>
        
        <div className={linkClass('today-schedule')} onClick={() => onNavigate('today-schedule')}>
          <span className="mr-3">📌</span> Today's Schedule
        </div>
        <div className={linkClass('pending-requests')} onClick={() => onNavigate('pending-requests')}>
          <span className="mr-3">⏳</span> Pending Requests
        </div>
        <div className={linkClass('ongoing-sessions')} onClick={() => onNavigate('ongoing-sessions')}>
          <span className="mr-3">🔴</span> Ongoing Sessions
        </div>
        <div className={linkClass('stats-reviews')} onClick={() => onNavigate('stats-reviews')}>
          <span className="mr-3">⭐</span> Stats & Reviews
        </div>
        
        <p className={sectionTitleClass}>Clinical</p>

        <div className={linkClass('pet-health-details')} onClick={() => onNavigate('pet-health-details')}>
          <span className="mr-3">🩺</span> Pet Health Details
        </div>
        <div className={linkClass('case-notes')} onClick={() => onNavigate('case-notes')}>
          <span className="mr-3">📝</span> Case Notes
        </div>
        <div className={linkClass('patient-history')} onClick={() => onNavigate('patient-history')}>
          <span className="mr-3">📂</span> Patient History
        </div>

        {/* --- HELP & SUPPORT SECTION --- */}
        <p className={sectionTitleClass}>Help & Support</p>
        
        <div className={linkClass('help-center')} onClick={() => onNavigate('help-center')}>
          <span className="mr-3">❓</span> Help Center
        </div>
        <div className={linkClass('contact-support')} onClick={() => onNavigate('contact-support')}>
          <span className="mr-3">🎧</span> Contact Support
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;