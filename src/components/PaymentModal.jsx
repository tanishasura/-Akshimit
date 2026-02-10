import React, { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  if (!isOpen) return null;

  const handleConfirm = (method) => {
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }
    setLoading(true);
    const info = { 
        name: customerName, 
        phone: customerPhone 
    };
onConfirm(method, info);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Payment</h2>
        <p className="text-slate-500 mb-6">Total: <span className="text-blue-600 font-bold">₹{total}</span></p>
        
{/* <div className="space-y-3 mb-6">
          <input 
            type="text"
            placeholder="Customer Name *"
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            type="text"
            placeholder="Phone Number *"
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div> */}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Customer Name</label>
            <input 
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
            <input 
              type="tel"
              placeholder="10-digit Mobile Number"
              className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
              value={customerPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCustomerPhone(val.slice(0, 10));
              }}
            />
          </div>
        </div>

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