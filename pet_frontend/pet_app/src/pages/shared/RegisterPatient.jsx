import React, { useState, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const RegisterPatient = ({ onRegister, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onRegister({ ...formData, user_type: 'patient' }, () => setLoading(false));
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center p-4" style={{ background: bg }}>
      <div className="w-full max-w-2xl animate-fade-in p-8 rounded-3xl shadow-2xl" style={{ background: surface }}>
        <h2 className="font-bold mb-6 text-center" style={{ fontSize: `${fontSize * 2}px`, color: text }}>Patient Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="Full Name" className="input-focus w-full px-4 py-3 rounded-xl border-2" style={{ borderColor: `${primary}30`, color: text }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required type="email" placeholder="Email" className="input-focus w-full px-4 py-3 rounded-xl border-2" style={{ borderColor: `${primary}30`, color: text }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input required placeholder="Phone" className="input-focus w-full px-4 py-3 rounded-xl border-2" style={{ borderColor: `${primary}30`, color: text }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input required type="password" placeholder="Password" className="input-focus w-full px-4 py-3 rounded-xl border-2" style={{ borderColor: `${primary}30`, color: text }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <button type="submit" disabled={loading} className="md:col-span-2 btn-hover w-full py-4 rounded-xl font-bold shadow-lg" style={{ background: primary, color: 'white' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => onNavigate('home')} className="underline">← Back Home</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;