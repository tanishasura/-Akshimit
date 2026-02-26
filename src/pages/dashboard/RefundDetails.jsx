import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

export default function RefundDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const txn = location.state?.transaction;

  if (!txn) {
    return (
      <div className="p-10 text-center">
        <p>No transaction data found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors"
      >
        <IoIosArrowBack /> Back to Transactions
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-700">Refund Details</h1>
            <p className="text-red-600/70 text-sm font-mono">{txn.id}</p>
          </div>
          <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Refunded
          </span>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</label>
              <p className="text-slate-700 font-semibold text-lg">{txn.customer_name || "Guest Customer"}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
              <p className="text-slate-700 font-mono font-medium">{txn.customer_phone || "—"}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-2">Reason for Refund</label>
            <p className="text-slate-800 text-lg italic font-medium leading-relaxed">
              "{txn.refund_reason || "No reason provided."}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Refunded</label>
              <p className="text-2xl font-black text-slate-900">₹{txn.amount?.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</label>
              <p className="text-slate-600 font-bold">{txn.method}</p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-8 text-slate-400 text-xs italic">
        This transaction was moved to refund status on {new Date(txn.date).toLocaleDateString()}
      </p>
    </div>
  );
}