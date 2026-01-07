import React from 'react';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
  if (!isOpen) return null;

  const methods = [
    { name: "Cash"},
    { name: "UPI / QR" },
    { name: "Card" }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Payment</h2>
        <p className="text-slate-500 mb-6">Total Amount: <span className="text-blue-600 font-bold text-xl">₹{total}</span></p>
        
        <div className="space-y-3">
          {methods.map((m) => (
            <button 
              key={m.name}
              onClick={() => onConfirm(m.name)} 
              className="w-full p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 font-bold flex justify-between items-center transition-all group"
            >
              <span> {m.name}</span>
              <span className="text-slate-300 group-hover:text-blue-500">→</span>
            </button>
          ))}
        </div>
        
        <button onClick={onClose} className="w-full mt-6 text-slate-400 text-sm hover:text-red-500 transition-colors">
          Cancel Transaction
        </button>
      </div>
    </div>
  );
}