import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const RegistrationOptions = ({ onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, secondary_action_color: secondary, font_size: fontSize } = config;

  return (
    <div className="min-h-full w-full flex items-center justify-center p-4" style={{ background: bg }}>
      <div className="max-w-4xl w-full animate-fade-in flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="font-bold mb-3" style={{ fontSize: `${fontSize * 2.5}px`, color: text }}>
            Choose Your Role
          </h2>
          <p style={{ fontSize: `${fontSize * 1.1}px`, color: text, opacity: 0.7 }}>
            Select the account type that best describes you to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Patient Option Card */}
          <div 
            onClick={() => onNavigate('register-patient')}
            className="group relative bg-white p-8 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl"
            style={{ background: surface, color: text }}
          >
            {/* Top Accent Border */}
            <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: primary }}></div>
            
            {/* Image Container */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-inner" style={{ background: `${primary}15` }}>
              {/* PATIENT IMAGE SOURCE - REPLACE SRC WITH YOUR OWN IMAGE PATH */}
              <img 
                src="https://tse2.mm.bing.net/th/id/OIP.9HSVWoQmEJzdOtuhxXWmOAHaHa?pid=Api&P=0&h=180" 
                alt="Patient Icon" 
                className="w-16 h-16 object-contain drop-shadow-sm"
              />
            </div>

            <h3 className="font-bold mb-2" style={{ fontSize: `${fontSize * 1.5}px` }}>Patient</h3>
            <p className="mb-8 leading-relaxed" style={{ fontSize: `${fontSize * 1}px`, opacity: 0.75, maxWidth: '280px' }}>
              Manage your pet's health records, track history, and book appointments with ease.
            </p>

            <button 
              className="w-full py-3 rounded-xl font-semibold shadow-md transition-colors duration-200"
              style={{ 
                background: primary, 
                color: '#ffffff',
                fontSize: `${fontSize * 1}px`
              }}
            >
              Sign Up as Patient
            </button>
          </div>

          {/* Doctor Option Card */}
          <div 
            onClick={() => onNavigate('register-doctor')}
            className="group relative bg-white p-8 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl"
            style={{ background: surface, color: text }}
          >
            {/* Top Accent Border */}
            <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: secondary }}></div>
            
            {/* Image Container */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-inner" style={{ background: `${secondary}15` }}>
              {/* DOCTOR IMAGE SOURCE - REPLACE SRC WITH YOUR OWN IMAGE PATH */}
              <img 
                src="https://tse4.mm.bing.net/th/id/OIP.h-Tk-rRUAA7kNH6hOgNBRwHaHa?pid=Api&P=0&h=180" 
                alt="Doctor Icon" 
                className="w-16 h-16 object-contain drop-shadow-sm"
              />
            </div>

            <h3 className="font-bold mb-2" style={{ fontSize: `${fontSize * 1.5}px` }}>Doctor</h3>
            <p className="mb-8 leading-relaxed" style={{ fontSize: `${fontSize * 1}px`, opacity: 0.75, maxWidth: '280px' }}>
              Join our network of professionals to schedule appointments and help pets stay healthy.
            </p>

            <button 
              className="w-full py-3 rounded-xl font-semibold shadow-md transition-colors duration-200"
              style={{ 
                background: secondary, 
                color: '#ffffff',
                fontSize: `${fontSize * 1}px`
              }}
            >
              Sign Up as Doctor
            </button>
          </div>

        </div>
        
        {/* Back Button */}
        <div className="mt-10">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 transition-all hover:opacity-70"
            style={{ color: text, fontSize: `${fontSize * 0.95}px` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RegistrationOptions;