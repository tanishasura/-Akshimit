import React, { useState } from "react";
import { TiShoppingCart } from "react-icons/ti";
import { CgNotes } from "react-icons/cg";
import { NavLink, useNavigate } from "react-router-dom";
import { GrTransaction } from "react-icons/gr";
import { HiOutlineLogout } from "react-icons/hi";

export default function Sidebar({ isCollapsed }) {
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);
  
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

//   const handleLogout = () => {
//     localStorage.removeItem("user_session");
//     navigate("/SignIn");
//   };

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-slate-900 text-white">
        {/* Header */}
        <div className="p-6 h-20 flex items-center border-b border-slate-700">
          <span className="text-2xl font-bold truncate">
            {isCollapsed ? "C" : "Classifabs"}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/dashboard/checkout"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`
            }
          >
            <span className="text-xl shrink-0"><TiShoppingCart /></span>
            {!isCollapsed && <span className="ml-3 font-medium">Checkout</span>}
          </NavLink>

          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`
            }
          >
            <span className="text-xl shrink-0"><CgNotes /></span>
            {!isCollapsed && <span className="ml-3 font-medium text-nowrap">Inventory Details</span>}
          </NavLink>

          <NavLink
            to="/dashboard/transaction"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`
            }
          >
            <span className="text-xl shrink-0"><GrTransaction /></span>
            {!isCollapsed && <span className="ml-3 font-medium text-nowrap">Transaction</span>}
          </NavLink>
        </nav>

       
        <div className="p-4 border-t border-slate-800 mt-auto">
          <NavLink
           to="/dashboard/logout"
           className={({isActive}) =>
        `w-full flex items-center p-3 rounded-lg ${
           isActive ? "bg-red text-white" : "text-slate-400 hover:bg-red-500/10 hover:text-red-500"}`}
          >
            <span className="text-xl shrink-0"><HiOutlineLogout /></span>
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </NavLink>
        </div>
      </div>

{/*   
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineLogout size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Are you sure you want to logout?</h3>
            
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}