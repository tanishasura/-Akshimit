import React, { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = (method) => {
    setLoading(true);
    onConfirm(method);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Payment</h2>
        <p className="text-slate-500 mb-6">Total: <span className="text-blue-600 font-bold">₹{total}</span></p>
        
        <div className="space-y-3">
          {["Cash", "UPI / QR", "Card"].map((method) => (
            <button 
              key={method}
              disabled={loading}
              onClick={() => handleConfirm(method)} 
              className={`w-full p-4 border border-slate-200 rounded-xl font-bold flex justify-between items-center transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
            >
              <span>{method}</span>
              <span>{loading ? "..." : "→"}</span>
            </button>
          ))}
        </div>
        
        {!loading && (
          <button onClick={onClose} className="w-full mt-6 text-slate-400 text-sm">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}