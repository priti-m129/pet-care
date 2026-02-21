import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminHome = ({ users, products, loading, onNavigate }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, secondary_action_color: secondary, font_size: fontSize } = config;

  const doctors = users.filter(u => u.role === 'DOCTOR');
  const pendingDoctors = doctors.filter(d => !d.isApproved);
  const patients = users.filter(u => u.role === 'PATIENT');

  const StatCard = ({ icon, title, value, page }) => (
    <div onClick={() => page && onNavigate(page)} className="card-hover p-6 rounded-3xl shadow-md cursor-pointer" style={{ background: surface }}>
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold mb-1" style={{ fontSize: `${fontSize * 0.95}px`, color: text, opacity: 0.7 }}>{title}</p>
      <p className="stat-number" style={{ fontSize: `${fontSize * 2.2}px`, color: primary }}>{value}</p>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="👥" title="Total Users" value={users.length} page="user-management" />
        <StatCard icon="🩺" title="Total Doctors" value={doctors.length} page="vet-management" />
        <StatCard icon="⏳" title="Pending Approvals" value={pendingDoctors.length} page="vet-management" />
        <StatCard icon="📦" title="Active Products" value={products.length} page="marketplace" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Actions */}
        <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
          <h3 className="font-bold mb-5" style={{ fontSize: `${fontSize * 1.4}px`, color: text }}>System Management</h3>
          <div className="space-y-3">
            <button onClick={() => onNavigate('user-management')} className="btn-hover w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3" style={{ background: `${primary}15` }}>
              <span className="text-3xl">👥</span>
              <div><div className="font-bold">User Management</div><div style={{ fontSize: `${fontSize * 0.85}px`, opacity: 0.7 }}>View patient accounts</div></div>
            </button>
            <button onClick={() => onNavigate('marketplace')} className="btn-hover w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3" style={{ background: `${secondary}15` }}>
              <span className="text-3xl">📦</span>
              <div><div className="font-bold">Marketplace</div><div style={{ fontSize: `${fontSize * 0.85}px`, opacity: 0.7 }}>Manage products</div></div>
            </button>
            <button onClick={() => onNavigate('reports')} className="btn-hover w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3" style={{ background: `${primary}15` }}>
              <span className="text-3xl">📊</span>
              <div><div className="font-bold">System Reports</div><div style={{ fontSize: `${fontSize * 0.85}px`, opacity: 0.7 }}>View sales stats</div></div>
            </button>
          </div>
        </div>
        
        {/* Alerts */}
        <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
          <h3 className="font-bold mb-5" style={{ fontSize: `${fontSize * 1.4}px`, color: text }}>System Alerts</h3>
          <div className="space-y-3">
            {pendingDoctors.length > 0 && (
              <div className="px-5 py-4 rounded-2xl cursor-pointer hover:opacity-90" style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444' }} onClick={() => onNavigate('vet-management')}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-bold mb-1 text-red-800">Pending Approvals</p>
                    <p style={{ fontSize: `${fontSize * 0.9}px`, opacity: 0.9, color: '#7f1d1d' }}>{pendingDoctors.length} doctor requests.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="px-5 py-4 rounded-2xl" style={{ background: '#e0f2fe' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div><p className="font-bold mb-1 text-blue-900">System Health</p><p style={{ fontSize: `${fontSize * 0.9}px`, opacity: 0.8, color: '#1e3a8a' }}>Backup completed.</p></div>
              </div>
            </div>
            <div className="px-5 py-4 rounded-2xl" style={{ background: '#fef3c7' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📉</span>
                <div><p className="font-bold mb-1 text-yellow-900">Low Inventory</p><p style={{ fontSize: `${fontSize * 0.9}px`, opacity: 0.8, color: '#78350f' }}>Premium Dog Food low.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold" style={{ fontSize: `${fontSize * 1.2}px`, color: text }}>Recent Requests</h3>
            <button onClick={() => onNavigate('vet-management')} className="text-sm font-semibold" style={{ color: primary }}>View All</button>
        </div>
        {loading ? <p className="text-center py-6 opacity-70">Loading...</p> : pendingDoctors.length === 0 ? <p className="text-center py-6 opacity-60">No pending approvals.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.slice(0, 4).map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl border border-gray-100 flex flex-col justify-between" style={{ background: '#fff' }}>
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-gray-800">Dr. {doc.name}</h4></div>
                  <p className="text-xs text-gray-500">{doc.specialization} • {doc.clinicName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;