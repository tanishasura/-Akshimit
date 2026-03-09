import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosSearch } from "react-icons/io";
import { printBill } from "../../utils/printBill";

export default function Transaction() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const [restock, setRestock] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [refundingItemId, setRefundingItemId] = useState(null);
  const [refundQtyInput, setRefundQtyInput] = useState(1);
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [viewingRefundItem, setViewingRefundItem] = useState(null);

  const isWithin7Days = (dateString) => {
    const txnDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - txnDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24); 
    return diffDays <= 7;
  };

  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  // Search and Filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Free text search
      const searchLower = searchTerm.toLowerCase();
      const idMatch = txn.id?.toLowerCase().includes(searchLower);
      const nameMatch = txn.customer_name?.toLowerCase().includes(searchLower);
      const phoneMatch = txn.customer_phone?.includes(searchTerm);
      const matchesSearch = idMatch || nameMatch || phoneMatch;

      // Date Range Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const txnDateObj = new Date(txn.date);
        // Reset time parts to easily compare just the dates
        txnDateObj.setHours(0, 0, 0, 0);

        const sDate = startDate ? new Date(startDate) : null;
        if (sDate) sDate.setHours(0, 0, 0, 0);

        const eDate = endDate ? new Date(endDate) : null;
        if (eDate) eDate.setHours(23, 59, 59, 999);

        if (sDate && txnDateObj < sDate) matchesDate = false;
        if (eDate && txnDateObj > eDate) matchesDate = false;
      }

      return matchesSearch && matchesDate;
    });
  }, [transactions, searchTerm, startDate, endDate]);

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
    // navigate removed
  }, [isAdmin, navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/transactions");
      // Sort newest first instead of oldest first
      const sortedByNewest = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedByNewest);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (location.state && location.state.amount > 0) {
      setToast("Payment Successful!");
      window.history.replaceState({}, document.title);
      setTimeout(() => setToast(""), 3000);
    }
  }, [location.state]);

  const copyToClipboard = (text, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setToast(`ID Copied!`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleItemRefund = async (item) => {
    if (!refundReasonInput.trim()) return alert("Please enter a reason for this refund.");
    if (refundQtyInput < 1 || refundQtyInput > (item.qty - (item.refunded_qty || 0))) {
        return alert("Invalid refund quantity.");
    }
    
    // Safety check - we no longer strict confirm since the UI makes it explicit, but we can keep it
    const confirmAction = window.confirm(`Do you want to refund ${refundQtyInput}x ${item.product_name || item.id}?`);
    if (!confirmAction) return;

    try {
      // Set to processing state using negative ID or similar if needed, but we already have refundingItemId set
      
      await axios.put(`http://127.0.0.1:8000/transactions/${selectedTxn.id}/items/${item.id}/refund`, {
        refund_qty: refundQtyInput,
        refund_reason: refundReasonInput
      });
      
      if (restock) {
        await axios.patch(`http://127.0.0.1:8000/products/${item.product_id || item.id}/restock`, {
          quantity: refundQtyInput
        });
      }
      
      setToast(`Refunded ${refundQtyInput}x item(s) successfully`);
      
      setSelectedTxn(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === item.id ? { ...i, refunded_qty: (i.refunded_qty || 0) + refundQtyInput, refund_reason: refundReasonInput } : i)
      }));
      
      fetchTransactions();
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert("Refund failed. Ensure your backend supports updates.");
    } finally {
      setRefundingItemId(null);
      setRefundQtyInput(1);
      setRefundReasonInput("");
    }
  };

  // if (!isAdmin) return null; // removed

  return (
    <div className="p-6 relative">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-lg shadow-xl z-50 animate-bounce text-sm font-bold">
          {toast}
        </div>
      )}

      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
              Bill View: {selectedTxn.id}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer</span>
                <span className="font-medium">{selectedTxn.customer_name || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Date</span>
                <span className="font-medium">{new Date(selectedTxn.date).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Contact</span>
                <span className="font-medium">{selectedTxn.customer_phone || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Amount</span>
                <span className="font-bold text-blue-600">₹{selectedTxn.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs sticky top-0">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTxn.items && selectedTxn.items.length > 0 ? selectedTxn.items.map((item, idx) => {
                      const isRefunded = item.qty === (item.refunded_qty || 0);
                      const isEligible = isWithin7Days(selectedTxn.date);
                      return (
                        <React.Fragment key={idx}>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-700">{item.product_name || item.id}</div>
                              <div className="text-xs text-slate-400">{item.product_id}</div>
                            </td>
                            <td className="p-3 text-center font-mono">
                                {item.qty}
                                {(item.refunded_qty > 0) && (
                                    <span className="block text-[10px] text-red-500 font-bold tracking-tighter">(-{item.refunded_qty} Ref)</span>
                                )}
                            </td>
                            <td className="p-3 text-right font-bold">₹{((item.price || 0) * item.qty).toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {item.refunded_qty > 0 && (
                                  <button 
                                    onClick={() => setViewingRefundItem({ item, reason: item.refund_reason || selectedTxn.refund_reason })}
                                    className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap hover:bg-red-200 transition-colors"
                                  >
                                    View Reason
                                  </button>
                                )}
                                {!isRefunded && (
                                  <button 
                                    disabled={!isEligible}
                                    onClick={() => {
                                        if (refundingItemId === item.id) {
                                            setRefundingItemId(null);
                                        } else {
                                            setRefundingItemId(item.id);
                                            setRefundQtyInput(item.qty - (item.refunded_qty || 0));
                                            setRefundReasonInput("");
                                        }
                                    }}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap ${!isEligible ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : refundingItemId === item.id ? 'bg-slate-700 text-white hover:bg-slate-800' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                    title={!isEligible ? "Refund period expired (7 days)" : "Issue Refund"}
                                  >
                                    {refundingItemId === item.id ? "Cancel" : "Refund"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Inline Refund Form Row */}
                          {refundingItemId === item.id && !isRefunded && (
                            <tr className="bg-red-50/50 border-y border-red-100">
                                <td colSpan="4" className="p-3">
                                    <div className="flex items-center gap-3 w-full animate-fadeIn">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Qty to Refund</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max={item.qty - (item.refunded_qty || 0)}
                                                value={refundQtyInput}
                                                onChange={(e) => setRefundQtyInput(parseInt(e.target.value) || 1)}
                                                className="w-20 border border-red-200 rounded p-1.5 text-sm font-mono outline-none focus:ring-2 focus:ring-red-200"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Reason for Refund</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Defective, Size mismatch..."
                                                value={refundReasonInput}
                                                onChange={(e) => setRefundReasonInput(e.target.value)}
                                                className="w-full border border-red-200 rounded p-1.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end pt-5">
                                            <button 
                                                onClick={() => handleItemRefund(item)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded shadow-sm text-sm transition-colors whitespace-nowrap"
                                            >
                                                Confirm Refund
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }) : (
                        <tr><td colSpan="4" className="p-4 text-center text-slate-500 whitespace-normal">Legacy transaction or no items found. Refunds must be processed manually.</td></tr>
                    )}
                  </tbody>
                </table>
            </div>

            {/* Removed global refund reason input in favor of inline per-item forms */}
            
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input 
                  type="checkbox" 
                  id="restock" 
                  className="w-4 h-4 accent-blue-600"
                  checked={restock}
                  onChange={(e) => setRestock(e.target.checked)}
                />
                <label htmlFor="restock" className="text-sm font-bold text-blue-700 cursor-pointer">
                  Add refunded items back to Inventory stock
                </label>
            </div>

            <div className="flex gap-3 mt-auto flex-shrink-0">
              <button
                onClick={() => printBill(selectedTxn)}
                className="flex-1 px-4 py-3 text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Print Bill
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="flex-1 px-4 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Bill View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Reason Popup Modal */}
      {viewingRefundItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingRefundItem(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              Refund Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item</label>
                <p className="text-slate-700 font-semibold">{viewingRefundItem.item.product_name || viewingRefundItem.item.id}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity Refunded</label>
                <p className="text-slate-700 font-mono">{viewingRefundItem.item.refunded_qty}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-2">Reason for Refund</label>
                <p className="text-slate-700 italic">"{viewingRefundItem.reason || "No reason provided"}"</p>
              </div>
            </div>
            <button
              onClick={() => setViewingRefundItem(null)}
              className="w-full mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-2xl text-slate-700 w-full xl:w-auto">
            Transaction History
          </h3>

          <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 pl-1">From</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 bg-white"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 pl-1">To</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 text-sm text-slate-700 bg-white"
                />
              </div>
            </div>

            <div className="relative w-full md:w-80 flex items-center justify-end h-full mt-auto">
              <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                placeholder="Search ID, Name, or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm h-[40px]"
              />
            </div>
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
                        setSelectedTxn(txn);
                    }}
                    className={`transition-colors cursor-pointer hover:bg-slate-50`}
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
