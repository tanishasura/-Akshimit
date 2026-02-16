import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import CheckoutButton from "../../components/CheckoutButton";
import AddedItems from "../../components/AddedItems";
import PaymentModal from "../../components/PaymentModal";
import CheckoutSearch from "../../components/CheckoutSearch";
import CheckoutFilter from "../../components/CheckoutFilter";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Checkout() {
  const navigate = useNavigate();
  const quickAddInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    size: "all",
    brand: "all",
    color: "all",
    section: "all",
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("pending_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [discount, setDiscount] = useState(() => {
    const savedDiscount = localStorage.getItem("pending_discount");
    return savedDiscount ? JSON.parse(savedDiscount) : 0;
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickAddId, setQuickAddId] = useState("");
  const [quickAddError, setQuickAddError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem("pending_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("pending_discount", JSON.stringify(discount));
  }, [discount]);

  const calculateFinalTotal = () => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    const gstTotal = cart.reduce((acc, i) => acc + (i.price * i.qty * ((i.gst || 5) / 100)), 0);
    const beforeDiscount = subtotal + gstTotal;
    return beforeDiscount - (beforeDiscount * (discount / 100));
  };

  const syncOfflineTransactions = useCallback(async () => {
    const offlineQueue = JSON.parse(
      localStorage.getItem("offline_sales") || "[]"
    );
    if (offlineQueue.length === 0) return;

    for (const txn of offlineQueue) {
      try {
        await axios.post("http://127.0.0.1:8000/transactions", txn);
      } catch (e) {
        console.error("Sync failed for transaction:", txn.id);
      }
    }
    localStorage.setItem("offline_sales", JSON.stringify([]));
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineTransactions();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) syncOfflineTransactions();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncOfflineTransactions]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        showModal
      ) {
        return;
      }

      if (e.key.length === 1) {
        quickAddInputRef.current?.focus();
        setQuickAddId((prev) => {
          const newValue = (prev + e.key).toUpperCase();
          return newValue.slice(0, 8);
        });
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showModal]);

  const brands = useMemo(
    () => [...new Set(items.map((i) => i.brand))].filter(Boolean),
    [items]
  );
  const colors = useMemo(
    () => [...new Set(items.map((i) => i.color))].filter(Boolean),
    [items]
  );
  const sizes = useMemo(
    () => [...new Set(items.map((i) => i.size))].filter(Boolean),
    [items]
  );
  const sections = useMemo(
    () => [...new Set(items.map((i) => i.section))].filter(Boolean),
    [items]
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      if (navigator.onLine) {
        const response = await axios.get(`http://127.0.0.1:8000/products`, {
          params: {
            search: searchTerm,
            size: filters.size === "all" ? null : filters.size,
            color: filters.color === "all" ? null : filters.color,
            brand: filters.brand === "all" ? null : filters.brand,
            section: filters.section === "all" ? null : filters.section,
          },
        });
        
        const syncedItems = response.data.map(item => {
          const inCart = cart.find(c => c.id === item.id);
          return inCart ? { ...item, stock_qty: item.stock_qty - inCart.qty } : item;
        });

        setItems(syncedItems);
        localStorage.setItem("inventory_cache", JSON.stringify(syncedItems));
      } else {
        const cached = JSON.parse(
          localStorage.getItem("inventory_cache") || "[]"
        );
        const filtered = cached.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toUpperCase().includes(searchTerm.toUpperCase())
        );
        setItems(filtered);
      }
    } catch (err) {
      const cached = JSON.parse(
        localStorage.getItem("inventory_cache") || "[]"
      );
      setItems(cached);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, cart]); 

  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [fetchProducts, refreshTrigger]);

  const handleItemClick = (item) => {
    const targetItem = items.find(i => i.id === item.id);
    if (!targetItem || targetItem.stock_qty < 1) {
        alert("Out of stock!");
        return;
    }

    setItems(prevItems => 
        prevItems.map(i => i.id === item.id ? { ...i, stock_qty: i.stock_qty - 1 } : i)
    );

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) {
        return [...prev, { ...item, qty: 1 }];
      }
      return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    });
  };

  const handleQuickAddChange = async (e) => {
    const value = e.target.value.toUpperCase();
    setQuickAddId(value);
    setQuickAddError("");

    if (value.length === 8) {
      const foundItem = items.find((i) => i.id === value);
      if (foundItem) {
        handleItemClick(foundItem);
        setQuickAddId("");
      } else {
        setQuickAddError("Invalid Id");
      }
    }
  };

  const updateQty = (id, delta) => {
    if (delta > 0) {
        const itemInStock = items.find(i => i.id === id);
        if (!itemInStock || itemInStock.stock_qty < 1) {
            alert("Maximum stock reached");
            return;
        }
    }

    setItems(prevItems => 
        prevItems.map(i => i.id === id ? { ...i, stock_qty: i.stock_qty - delta } : i)
    );

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleConfirmPayment = async (method, customerInfo) => {
    if (!customerInfo) return;
    const transactionId = `TXN-${Date.now()}`;
    const transactionData = {
        id: transactionId,
        date: new Date().toISOString(),
        amount: calculateFinalTotal(), 
        method: method,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
    };

    try {
        if (navigator.onLine) {
            await axios.post("http://127.0.0.1:8000/transactions", transactionData);
        } else {
            const queue = JSON.parse(localStorage.getItem("offline_sales") || "[]");
            queue.push(transactionData);
            localStorage.setItem("offline_sales", JSON.stringify(queue));

            const cache = JSON.parse(localStorage.getItem("inventory_cache") || "[]");
            transactionData.items.forEach((sold) => {
                const idx = cache.findIndex((i) => i.id === sold.id);
                if (idx !== -1) cache[idx].stock_qty -= sold.qty;
            });
            localStorage.setItem("inventory_cache", JSON.stringify(cache));
        }

        setCart([]);
        setDiscount(0);
        localStorage.removeItem("pending_cart");
        localStorage.removeItem("pending_discount");

        setShowModal(false);
        setRefreshTrigger((prev) => prev + 1);
        navigate("/dashboard/transaction");
    } catch (err) {
        console.error("Payment failed:", err);
        alert("Payment failed. Please check your backend connection.");
    }
  };

  return (
    <div className="p-6">
      {!isOnline && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 text-center rounded-lg font-bold">
          Offline Mode - Transactions will sync when connection returns
        </div>
      )}
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
                {items
                  .filter((item) => item.stock_qty >= 0) 
                  .map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      <td className="px-6 py-4 font-semibold">{item.id}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full ${
                            item.stock_qty > 10
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
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
              ref={quickAddInputRef}
              value={quickAddId}
              placeholder="eg:ABCD1234"
              maxLength={8}
              className={`w-full p-3 border rounded-lg uppercase transition-all outline-none focus:ring-2 ${
                quickAddError
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:ring-blue-100"
              }`}
              onChange={handleQuickAddChange}
            />
            {quickAddError && (
              <p className="text-red-500 text-xs mt-2 font-medium animate-pulse">
                {quickAddError}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm flex items-center justify-between">
            <label className="text-sm font-bold text-yellow-800">Regular Customer?</label>
            <input 
              type="checkbox" 
              checked={discount === 100} 
              onChange={(e) => setDiscount(e.target.checked ? 100 : 0)} 
              className="w-5 h-5 cursor-pointer accent-yellow-600" 
            />
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100">
            <AddedItems cart={cart} updateQty={updateQty} discount={discount} />
          </div>

          <CheckoutButton
            disabled={cart.length === 0}
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showModal}
        total={calculateFinalTotal()}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}