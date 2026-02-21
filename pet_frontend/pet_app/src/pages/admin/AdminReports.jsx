import React, { useContext } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

const AdminReports = () => {
  const config = useContext(ConfigContext);
  const { surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-3xl shadow-md text-center" style={{ background: surface }}>
           <p className="text-sm opacity-70">Total Revenue</p>
           <p className="text-3xl font-bold" style={{ color: primary }}>$12,450</p>
         </div>
         <div className="p-6 rounded-3xl shadow-md text-center" style={{ background: surface }}>
           <p className="text-sm opacity-70">Total Orders</p>
           <p className="text-3xl font-bold" style={{ color: primary }}>1,204</p>
         </div>
         <div className="p-6 rounded-3xl shadow-md text-center" style={{ background: surface }}>
           <p className="text-sm opacity-70">New Users (MoM)</p>
           <p className="text-3xl font-bold" style={{ color: primary }}>+15%</p>
         </div>
      </div>
      <div className="p-6 rounded-3xl shadow-md" style={{ background: surface }}>
        <h3 className="font-bold mb-6">Sales Activity</h3>
        <div className="flex items-end justify-between h-64 gap-4">
          {[40, 70, 55, 90, 65, 80, 45, 60, 75, 50, 85, 95].map((h, i) => (
            <div key={i} className="w-full rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%`, background: primary, opacity: 0.8 }}>
              <span className="sr-only">Day {i+1}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;