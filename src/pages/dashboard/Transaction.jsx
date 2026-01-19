import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Transaction() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";


  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    
    // 19/01/2026
    const date = dateObj.toLocaleDateString("en-GB");
    
    //19:05:30 
    const time = dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { date, time };
  };

  const renderDateTime = (rawDate) => {
    const { date, time } = formatDateTime(rawDate);
    return (
      <div className="flex flex-col">
        <span className="font-medium text-slate-700">{date}</span>
        <span className="text-xs text-slate-400 font-mono">{time}</span>
      </div>
    );
  };


  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard/checkout");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/transactions");
        const reversedData = response.data.reverse();
        setTransactions(reversedData);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchTransactions();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && location.state && location.state.amount > 0) {
      setToast("Payment Successful!");
      window.history.replaceState({}, document.title);
      setTimeout(() => setToast(""), 3000);
    }
  }, [location.state, isAdmin]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast(`ID Copied!`);
    setTimeout(() => setToast(""), 2000);
  };

  if (!isAdmin) return null;

  return (
    <div className="p-6 relative">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-lg shadow-xl z-50 animate-bounce text-sm font-bold">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-2xl text-slate-700">
            Transaction History
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-500 font-bold">
              Fetching records...
            </div>
          ) : (
            <>
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
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td
                        className="p-4 text-blue-600 font-mono font-bold cursor-pointer select-none blur-[2.5px] hover:blur-none transition-all duration-300"
                        onClick={() => copyToClipboard(txn.id)}
                        title="Click to copy"
                      >
                        {txn.id}
                      </td>
                      <td className="p-4">
                        {renderDateTime(txn.date)}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        ₹{txn.amount}
                      </td>
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
                  No transactions
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}