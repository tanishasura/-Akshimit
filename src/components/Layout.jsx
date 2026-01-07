import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100">
      
      {/* SIDEBAR -  */}
      <aside 
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className={`hidden md:block fixed left-0 top-0 h-full bg-slate-900 text-slate-50 transition-all duration-300 ease-in-out z-[100] shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
          <Sidebar isCollapsed={isCollapsed} />
      </aside>

      {/* CONTENT  */}
      <div className="flex-1 min-w-0 md:ml-20">
          <div className="p-4 md:p-8">
             <Outlet />
          </div>
      </div>
    </div>
  );
}