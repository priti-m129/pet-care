import React, { useState, useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const LoginPage = ({ onLogin, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;
  
  const [type, setType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onLogin({ email, password, type }, () => setLoading(false));
  };

  return (
    <div className="min-h-full w-full flex items-center justify-center p-4" style={{ background: bg }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="p-8 rounded-3xl shadow-2xl" style={{ background: surface }}>
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🐾</div>
            <h2 className="font-bold mb-2" style={{ fontSize: `${fontSize * 2}px`, color: text }}>Welcome Back</h2>
            <p style={{ fontSize: `${fontSize}px`, color: text, opacity: 0.7 }}>Sign in to your Pet Care account</p>
          </div>

          <div className="mb-6">
            <label className="block mb-3 font-semibold" style={{ fontSize: `${fontSize}px`, color: text }}>Login As</label>
            <div className="grid grid-cols-3 gap-3">
              {['admin', 'doctor', 'patient'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-3 rounded-xl font-semibold capitalize transition-colors ${type === t ? 'text-white' : ''}`}
                  style={{ 
                    background: type === t ? primary : bg, 
                    color: type === t ? 'white' : text,
                    border: type === t ? `2px solid ${primary}` : '2px solid transparent',
                    fontSize: `${fontSize * 0.85}px`
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-semibold" style={{ fontSize: `${fontSize * 0.95}px`, color: text }}>Email or Phone</label>
              <input 
                type="text" 
                required
                className="input-focus w-full px-4 py-3 rounded-xl border-2 outline-none"
                style={{ fontSize: `${fontSize}px`, color: text, borderColor: `${primary}30` }}
                placeholder="Enter your email or phone"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold" style={{ fontSize: `${fontSize * 0.95}px`, color: text }}>Password</label>
              <input 
                type="password" 
                required
                className="input-focus w-full px-4 py-3 rounded-xl border-2 outline-none"
                style={{ fontSize: `${fontSize}px`, color: text, borderColor: `${primary}30` }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-hover w-full py-4 rounded-xl font-bold shadow-lg" style={{ background: primary, color: 'white', fontSize: `${fontSize * 1.1}px`, border: 'none', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => onNavigate('home')} style={{ color: config.secondary_action_color, fontSize: `${fontSize}px`, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;