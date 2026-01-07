import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// import { HiOutlineTrash } from "react-icons/hi"; 

export default function Transaction() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState("");

  // Load History 
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("all_transactions") || "[]");
    setTransactions(saved);
  }, []);

  //  Catch incoming sales
  useEffect(() => {
    if (location.state && location.state.amount > 0) {
      const { amount, method } = location.state;

      const newEntry = {
        id: "TXN-" + Date.now().toString(36).toUpperCase(),
        date: new Date().toLocaleString(),
        amount: amount,
        method: method
      };

      setTransactions((prevTransactions) => {
        const updatedList = [newEntry, ...prevTransactions];
        localStorage.setItem("all_transactions", JSON.stringify(updatedList));
        return updatedList;
      });

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  
  const handleClearHistory = () => {
    const confirmClear = window.confirm("Are you sure you want to delete all transaction history? This cannot be undone.");
    if (confirmClear) {
      setTransactions([]); 
      localStorage.removeItem("all_transactions"); 
      setToast("History Cleared Successfully");
      setTimeout(() => setToast(""), 2000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast(`ID Copied!`);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="p-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-lg shadow-xl z-50 animate-bounce text-sm font-bold">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-2xl text-slate-700">Transaction History</h3>
          
          {/* {transactions.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              <HiOutlineTrash className="text-lg" />
              Clear History
            </button>
          )} */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td 
                    className="p-4 text-blue-600 font-mono font-bold cursor-pointer select-none blur-[2.5px] hover:blur-none transition-all duration-300"
                    onClick={() => copyToClipboard(txn.id)}
                    title="Click to copy"
                  >
                    {txn.id}
                  </td>
                  <td className="p-4 text-slate-600">{txn.date}</td>
                  <td className="p-4 font-bold text-slate-800">₹{txn.amount}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold">
                      {txn.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}