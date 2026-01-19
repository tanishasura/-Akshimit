import React, { useEffect, useState, useCallback, useMemo } from "react";
import AddedItems from "../../components/AddedItems";
import CheckoutButton from "../../components/CheckoutButton";
import PaymentModal from "../../components/PaymentModal";
import CheckoutSearch from "../../components/CheckoutSearch";
import CheckoutFilter from "../../components/CheckoutFilter";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

export default function Checkout() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    size: "all",
    brand: "all",
    color: "all",
    section: "all",
  });
  
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickAddId, setQuickAddId] = useState("");
  const [quickAddError, setQuickAddError] = useState(""); 
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const brands = useMemo(() => [...new Set(items.map((i) => i.brand))].filter(Boolean), [items]);
  const colors = useMemo(() => [...new Set(items.map((i) => i.color))].filter(Boolean), [items]);
  const sizes = useMemo(() => [...new Set(items.map((i) => i.size))].filter(Boolean), [items]);
  const sections = useMemo(() => [...new Set(items.map((i) => i.section))].filter(Boolean), [items]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/products`, {
        params: { 
          search: searchTerm,
          size: filters.size === "all" ? null : filters.size,
          color: filters.color === "all" ? null : filters.color,
          brand: filters.brand === "all" ? null : filters.brand,
          section: filters.section === "all" ? null : filters.section
        }
      });
      setItems(response.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [fetchProducts, refreshTrigger]); 

  const handleItemClick = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) {
        if (item.stock_qty < 1) {
          alert("Out of stock!");
          return prev;
        }
        return [...prev, { ...item, qty: 1 }];
      }
      if (existing.qty >= item.stock_qty) {
        alert(`Cannot add more. Only ${item.stock_qty} available.`);
        return prev;
      }
      return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    });
  };

  const handleQuickAddChange = async (e) => {
    const value = e.target.value.toUpperCase();
    setQuickAddId(value);
    setQuickAddError(""); 

    if (value.length === 8) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/products/${value}`);
        if (response.data) {
          handleItemClick(response.data);
          setQuickAddId(""); 
        } else {
          setQuickAddError("ID is not valid");
        }
      } catch (err) {
        setQuickAddError("ID is not valid");
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (delta > 0 && newQty > item.stock_qty) {
            alert("Maximum stock reached");
            return item;
          }
          return { ...item, qty: Math.max(0, newQty) };
        }
        return item;
      }).filter((item) => item.qty > 0)
    );
  };

 const handleConfirmPayment = async (method) => {
    try {
      const transactionId = `TXN-${Date.now()}`;
      
      const currentDate = new Date().toISOString().split('T')[0];

      const transactionData = {
        id: transactionId,     
        date: currentDate,          
        amount: totalAmount,
        method: method,
        items: cart.map(item => ({
          id: item.id,              
          qty: item.qty             
        }))
      };

      await axios.post("http://127.0.0.1:8000/transactions", transactionData);
      
      setCart([]);
      setShowModal(false);
      setRefreshTrigger(prev => prev + 1); 
      
      navigate("/dashboard/transaction"); 
    } catch (err) {
      console.error("Transaction failed", err.response?.data || err);
      const errorMsg = err.response?.data?.detail || "Payment failed. Please try again.";
      alert(errorMsg);
    }
  };

  const totalAmount = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row justify-between gap-4 border-slate-200">
            <div className="font-bold text-2xl text-slate-700">Checkout</div>
            <div className="flex items-center gap-2">
              <CheckoutSearch setSearchTerm={setSearchTerm} />
              <CheckoutFilter
                filters={filters} 
                setFilters={setFilters}
                sections={sections}
                brands={brands}
                colors={colors}
                sizes={sizes}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="bg-slate-50 text-slate-500 uppercase border-b text-md font-medium">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} onClick={() => handleItemClick(item)} className="hover:bg-blue-50 cursor-pointer text-sm">
                    <td className="px-6 py-4 font-semibold">{item.id}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full ${item.stock_qty > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.stock_qty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="font-bold text-slate-700 mb-2">Quick add</div>
            <input 
              type="text" 
              value={quickAddId}
              placeholder="eg:ABCD1234"
              maxLength={8}
              className={`w-full p-3 border rounded-lg uppercase transition-all outline-none focus:ring-2 ${quickAddError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'}`}
              onChange={handleQuickAddChange}
            />
            {quickAddError && (
              <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">
                {quickAddError}
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100">
            <AddedItems cart={cart} updateQty={updateQty} />
          </div>
          
          <CheckoutButton disabled={cart.length === 0} onClick={() => setShowModal(true)} />
        </div>
      </div>
      
      <PaymentModal 
        isOpen={showModal} 
        total={totalAmount} 
        onClose={() => setShowModal(false)} 
        onConfirm={handleConfirmPayment} 
      />
    </div>
  );
}