import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";

export default function Transaction() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");


  const [restock, setRestock] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  // Search
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const searchLower = searchTerm.toLowerCase();
      const idMatch = txn.id?.toLowerCase().includes(searchLower);
      const nameMatch = txn.customer_name?.toLowerCase().includes(searchLower);
      const phoneMatch = txn.customer_phone?.includes(searchTerm);

      return idMatch || nameMatch || phoneMatch;
    });
  }, [transactions, searchTerm]);

  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    const date = dateObj.toLocaleDateString("en-GB");
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

  useEffect(() => {
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

  const copyToClipboard = (text, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setToast(`ID Copied!`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleRefundSubmit = async () => {
    if (!refundReason.trim()) return alert("Please enter a reason.");
    const confirmAction = window.confirm("Do you want to generate refund?");
    if (!confirmAction) return;

    try {
      setIsRefunding(true);
      await axios.put(`http://127.0.0.1:8000/transactions/${selectedTxn.id}`, {
        status: "Refunded",
        refund_reason: refundReason,
        // restocked: restock
      });
      if (restock && selectedTxn.items) {
      const restockPromises = selectedTxn.items.map(item => {
        return axios.patch(`http://127.0.0.1:8000/products/${item.id}/restock`, {
          quantity: item.qty
        });
      });
      await Promise.all(restockPromises);
    }
      setToast("Refund process completed");
      setSelectedTxn(null);
      setRefundReason("");
      fetchTransactions();
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert("Refund failed. Ensure your backend supports updates.");
    } finally {
      setIsRefunding(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="p-6 relative">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-lg shadow-xl z-50 animate-bounce text-sm font-bold">
          {toast}
        </div>
      )}

      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
              Generate Refund
            </h2>
            <div className="space-y-3 mb-6 text-sm">
              <p>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Order ID:
                </span>{" "}
                <span className="font-mono font-bold text-blue-600">
                  {selectedTxn.id}
                </span>
              </p>
              <p>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Customer:
                </span>{" "}
                <span className="font-medium">
                  {selectedTxn.customer_name || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Contact:
                </span>{" "}
                <span className="font-medium">
                  {selectedTxn.customer_phone || "—"}
                </span>
              </p>
              <div className="pt-2">
                <label className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                  Reason for Refund
                </label>
                <textarea
                  className="w-full border rounded-lg p-2 h-24 outline-none focus:ring-2 focus:ring-red-100 border-slate-200"
                  placeholder="Enter reason..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>

<div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
  <input 
    type="checkbox" 
    id="restock" 
    className="w-4 h-4 accent-blue-600"
    checked={restock}
    onChange={(e) => setRestock(e.target.checked)}
  />
  <label htmlFor="restock" className="text-sm font-bold text-blue-700 cursor-pointer">
    Add items back to Inventory stock
  </label>
</div>



            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTxn(null)}
                className="flex-1 px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={isRefunding}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
              >
                {isRefunding ? "Processing..." : "Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-2xl text-slate-700">
            Transaction History
          </h3>

          <div className="relative w-full md:w-80">
            <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search ID, Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-500 font-bold">
              Fetching records...
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4 text-center">Contact</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    // onClick={() => txn.status !== "Refunded" && setSelectedTxn(txn)}
                    onClick={() => {
                      if (txn.status === "Refunded") {
                        navigate(`/dashboard/refund-details/${txn.id}`, {
                          state: { transaction: txn },
                        });
                      } else {
                        setSelectedTxn(txn);
                      }
                    }}
                    className={`transition-colors cursor-pointer ${
                      txn.status === "Refunded"
                        ? "bg-red-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td
                      className="p-4 text-blue-600 font-mono font-bold cursor-pointer select-none blur-[2.5px] hover:blur-none transition-all duration-300"
                      onClick={(e) => copyToClipboard(txn.id, e)}
                      title="Click to copy"
                    >
                      {txn.id}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {txn.customer_name || "N/A"}
                    </td>
                    <td className="p-4 text-center text-slate-500 font-mono">
                      {txn.customer_phone || "—"}
                    </td>
                    <td className="p-4">{renderDateTime(txn.date)}</td>
                    <td className="p-4 font-bold text-slate-800">
                      ₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          txn.status === "Refunded"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {txn.status === "Refunded" ? "Refunded" : txn.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
