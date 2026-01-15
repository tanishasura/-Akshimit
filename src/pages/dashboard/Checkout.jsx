import React, { useEffect, useState, useCallback } from "react";
import AddedItems from "../../components/AddedItems";
import CheckoutButton from "../../components/CheckoutButton";
import PaymentModal from "../../components/PaymentModal";
import { useNavigate } from "react-router-dom";
import CheckoutSearch from "../../components/CheckoutSearch";
import CheckoutFilter from "../../components/CheckoutFilter";
import axios from "axios";

export default function Checkout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [quickAddId, setQuickAddId] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  // Fetch products 
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/products`, {
        params: { search: searchTerm }
      });
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchProducts();
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, fetchProducts, refreshTrigger]);

  const processedItems = items.filter((item) => {
    if (filterType === "all") return true;
    return (
      item.section === filterType || 
      item.size === filterType || 
      item.brand === filterType ||
      item.type === filterType
    );
  });

  const handleItemClick = (item) => {
    if (item.stock_qty < 1) {
      alert("Item out of stock!");
      return;
    }
    setCart((prevCart) => {
      const isItemInCart = prevCart.find((cartItem) => cartItem.id === item.id);
      if (isItemInCart) {
        if (isItemInCart.qty >= item.stock_qty) {
          alert(`Only ${item.stock_qty} units available!`);
          return prevCart;
        }
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  const handleQuickAdd = async (value) => {
    setQuickAddId(value);
    setError("");
    if (value.length === 8) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/products/${value}`);
        if (response.data) {
          handleItemClick(response.data);
          setQuickAddId(""); 
        }
      } catch (err) {
        setError("Product not found");
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            if (delta > 0 && newQty > item.stock_qty) {
              alert(`Stock limit reached!`);
              return item;
            }
            return { ...item, qty: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleConfirmPayment = async (method) => {
    if (isProcessing) return; 
    setIsProcessing(true);

    const transactionData = {
      id: "TXN-" + Date.now().toString(36).toUpperCase(),
      date: new Date().toLocaleString(),
      amount: totalAmount,
      method: method,
      items: cart.map(item => ({ id: item.id, qty: item.qty })) 
    };

    try {
      await axios.post("http://127.0.0.1:8000/transactions", transactionData);
      
      setCart([]);
      setShowModal(false);
      setRefreshTrigger(prev => prev + 1); 

      if (isAdmin) {
        navigate("/dashboard/transaction", { state: { success: true } });
      } else {
        alert("Success! Stock updated.");
      }
    } catch (err) {
      console.error("Transaction Error:", err);
      const errorMsg = err.response?.data?.detail || "Transaction failed";
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-[calc(100vh-100px)]">
   
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-bold text-2xl text-slate-700">Inventory Items</div>
            <div className="flex items-center gap-2">
              <CheckoutSearch setSearchTerm={setSearchTerm} />
              <CheckoutFilter filterType={filterType} setFilterType={setFilterType}/>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-20 text-center text-slate-500 font-medium">Loading items...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedItems.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => handleItemClick(item)} 
                      className={`hover:bg-blue-50 transition-colors cursor-pointer text-sm ${item.stock_qty <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                    >
                      <td className="px-6 py-4 text-slate-600 font-mono">{item.id}</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.stock_qty < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {item.stock_qty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-800 font-bold">₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && processedItems.length === 0 && (
              <div className="p-20 text-center text-slate-400">No matching items found.</div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: CART & QUICK ADD */}
        <div className="flex flex-col gap-4 sticky top-0 h-full overflow-hidden">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Scan or Type ID</label>
            <input
              type="text"
              maxLength={8}
              value={quickAddId}
              placeholder="ABCD1234"
              className={`w-full p-3 border rounded-lg uppercase outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-slate-300"}`}
              onChange={(e) => handleQuickAdd(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl">
            <AddedItems cart={cart} updateQty={updateQty} />
          </div>
          
          <CheckoutButton
            disabled={cart.length === 0 || isProcessing}
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        total={totalAmount}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}