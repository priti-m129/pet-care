import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const VetManagement = ({ users, loading, onApprove, onDeleteUser, onApproveDocument }) => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  const doctors = users.filter(u => u.role === 'DOCTOR');
  const pendingDoctors = doctors.filter(d => !d.isApproved);
  const verifiedDoctors = doctors.filter(d => d.isApproved);

  return (
    <div className="space-y-8">
      {/* --- PENDING APPROVALS SECTION --- */}
      <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
        <h3 className="font-bold mb-4" style={{ fontSize: `${fontSize * 1.2}px`, color: text }}>Pending Approvals</h3>
        
        {loading ? (
            <p className="text-gray-500">Loading doctors...</p>
        ) : pendingDoctors.length === 0 ? (
            <p className="text-gray-400">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="p-5 rounded-xl border border-gray-200 flex flex-col justify-between" style={{ background: '#fff' }}>
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-bold text-lg">Dr. {doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.specialization || 'General'}</p>
                    </div>
                    {/* Status Badge */}
                    <span className="px-2 py-1 text-xs rounded-full font-bold bg-yellow-100 text-yellow-800">
                        {doc.documentStatus || 'PENDING'}
                    </span>
                  </div>
                  
                  {/* --- NEW: CHECK FOR MULTIPLE DOCUMENTS --- */}
                  <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-800 mb-2">UPLOADED DOCUMENTS:</p>
                      
                      <ul className="space-y-1">
                          {doc.mbbsDegree && (
                              <li>
                                  <a 
                                    href={`http://localhost:8080/uploads/${doc.mbbsDegree}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1"
                                  >
                                    🎓 MBBS Degree
                                  </a>
                              </li>
                          )}
                          {doc.medicalRegistration && (
                              <li>
                                  <a 
                                    href={`http://localhost:8080/uploads/${doc.medicalRegistration}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1"
                                  >
                                    📋 Medical Registration
                                  </a>
                              </li>
                          )}
                          {doc.resume && (
                              <li>
                                  <a 
                                    href={`http://localhost:8080/uploads/${doc.resume}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1"
                                  >
                                    📄 Resume (CV)
                                  </a>
                              </li>
                          )}
                          {doc.identityProof && (
                              <li>
                                  <a 
                                    href={`http://localhost:8080/uploads/${doc.identityProof}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1"
                                  >
                                    🪪 Identity Proof
                                  </a>
                              </li>
                          )}
                      </ul>

                      {/* If NO documents are uploaded at all */}
                      {!doc.mbbsDegree && !doc.medicalRegistration && !doc.resume && !doc.identityProof && (
                          <p className="text-xs text-gray-500 italic">Doctor has not uploaded documents yet.</p>
                      )}

                      {/* Show Approve Button if at least one document is uploaded */}
                      {(doc.mbbsDegree || doc.medicalRegistration || doc.resume || doc.identityProof) && (
                          <button 
                              onClick={() => onApproveDocument(doc.id)}
                              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded shadow-sm transition-colors"
                          >
                              Verify All & Unlock
                          </button>
                      )}
                  </div>
                  {/* ---------------------------------------- */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => onDeleteUser(doc.id)} className="px-3 py-1 rounded text-sm text-red-500 hover:bg-red-50">Reject / Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- VERIFIED DOCTORS SECTION --- */}
      <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
        <h3 className="font-bold mb-4" style={{ fontSize: `${fontSize * 1.2}px`, color: text }}>Verified Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verifiedDoctors.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl border border-gray-200 flex justify-between items-center" style={{ background: '#fff' }}>
              <div>
                <p className="font-bold">Dr. {doc.name}</p>
                <p className="text-xs text-gray-500">{doc.specialization}</p>
                <p className="text-xs text-green-600 font-semibold mt-1">Active • Dashboard Unlocked</p>
              </div>
              <button onClick={() => onDeleteUser(doc.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm">Remove</button>
            </div>
          ))}
          {verifiedDoctors.length === 0 && <p className="text-gray-400 col-span-3">No verified doctors yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default VetManagement;