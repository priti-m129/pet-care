import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const UserManagement = ({ users, loading, onDeleteUser }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, font_size: fontSize } = config;

  const patients = users.filter(u => u.role === 'PATIENT');

  return (
    <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
      <h3 className="font-bold mb-6" style={{ fontSize: `${fontSize * 1.5}px`, color: text }}>Patient List</h3>
      {loading ? <p>Loading...</p> : patients.length === 0 ? <p>No patients found.</p> : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="p-4 rounded-xl border border-gray-200 flex justify-between items-center" style={{ background: '#fff' }}>
              <div>
                <p className="font-bold text-lg">{patient.name}</p>
                <p className="text-sm text-gray-500">{patient.email}</p>
              </div>
              <button onClick={() => onDeleteUser(patient.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;