import React, { useContext } from 'react';
import { ConfigContext } from '../contexts/ConfigContext';

const Navbar = ({ onNavigate, user, onLogout }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary } = config;

  return (
    <nav className="shadow-sm" style={{ background: surface }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="text-4xl">🐾</div>
            <div>
              <h1 className="font-bold" style={{ fontSize: `${config.font_size * 1.5}px`, color: primary }}>Pet Care </h1>
              <p style={{ fontSize: `${config.font_size * 0.7}px`, color: text, opacity: 0.7 }}>Complete Pet Care Platform</p>
            </div>
          </div>
          
          {!user ? (
            <div className="flex gap-3">
              <button onClick={() => onNavigate('login')} className="btn-hover px-6 py-2 rounded-full font-semibold border-2" style={{ background: surface, color: primary, borderColor: primary, fontSize: `${config.font_size * 0.95}px` }}>
                Login
              </button>
              <button onClick={() => onNavigate('register-options')} className="btn-hover px-6 py-2 rounded-full font-semibold" style={{ background: primary, color: 'white', fontSize: `${config.font_size * 0.95}px`, border: 'none' }}>
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block font-semibold" style={{ color: text }}>Hi, {user.name}</span>
              <button onClick={onLogout} className="btn-hover px-4 py-2 rounded-full font-semibold text-sm" style={{ background: '#ef4444', color: 'white' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;