import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";

export default function Logout() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/signIn");
  };

  const handleCancel = () => {
    setShowModal(false);
    navigate("/dashboard/checkout"); 
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineLogout size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">
                Are you sure you want to logout?
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                >
                  Yes, Logout
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}