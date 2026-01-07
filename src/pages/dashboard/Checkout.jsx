import React, { useState } from "react";
import products from "../../mockdata/products.json";
import AddedItems from "../../components/AddedItems";
import CheckoutButton from "../../components/CheckoutButton";
import PaymentModal from "../../components/PaymentModal";
import { useNavigate } from "react-router-dom";
import CheckoutSearch from "../../components/CheckoutSearch";
import CheckoutFilter from "../../components/CheckoutFilter";

export default function Checkout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [cart, setCart] = useState([]);

  const [quickAddId, setQuickAddId] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const items = products;

  const handleItemClick = (item) => {
    setCart((prevCart) => {
      const isItemInCart = prevCart.find((cartItem) => cartItem.id === item.id);

      if (isItemInCart) {
        // reached stock limittt
        if (isItemInCart.qty >= item.stock) {
          alert(`Only ${item.stock} units available in stock!`);
          return prevCart;
        }

        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      if (item.stock < 1) {
        alert("Item out of stock!");
        return prevCart;
      }

      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  // QUICKADDDD
  const handleQuickAdd = (value) => {
    setQuickAddId(value);
    setError("");

    // P-Product
    if (value.length === 8) {
      const foundProduct = items.find(
        (p) => p.id.toLowerCase() === value.toLowerCase()
      );

      if (foundProduct) {
        handleItemClick(foundProduct);
        setQuickAddId("");
        setError("");
      } else {
        setError("Invalid ID");
      }
    }
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;

            if (delta > 0 && newQty > item.stock) {
              alert(`Cannot exceed stock limit of ${item.stock}`);
              return item;
            }

            return { ...item, qty: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  // search&filter
  let processedItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterType === "lowToHigh") {
    processedItems.sort((a, b) => a.price - b.price);
  } else if (filterType === "highToLow") {
    processedItems.sort((a, b) => b.price - a.price);
  }

  const sizes = ["XS", "S", "M", "L", "XL"];
  if (sizes.includes(filterType)) {
    processedItems = processedItems.filter((item) => item.size === filterType);
  }

  const colors = [
    "Red",
    "Blue",
    "Black",
    "White",
    "Maroon",
    "Khaki",
    "Dark Brown",
    "Pink",
  ];
  if (colors.includes(filterType)) {
    processedItems = processedItems.filter((item) => item.color === filterType);
  }

  const navigate = useNavigate();

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleConfirmPayment = (method) => {
    // Nexttt Pageee
    const saleData = {
      amount: totalAmount,
      method: method,
      itemsCount: cart.length,
    };

    // Clear cartttt
    setCart([]);
    setShowModal(false);

    navigate("/dashboard/transaction", { state: saleData });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-[calc(100vh-100px)]">
        {/* LEFTTTTTT */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
            <div className="font-bold text-2xl text-slate-700">
              Current Stock
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                
              <CheckoutSearch setSearchTerm={setSearchTerm} />
              </div>

              <CheckoutFilter filterType={filterType} setFilterType={setFilterType}/>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-slate-50 text-slate-500 uppercase text-md font-medium border-b">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 text-center">Size</th>
                  <th className="px-6 py-4 text-center">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer group font-medium text-sm"
                  >
                    <td className="px-6 py-4 text-slate-600">{item.id}</td>
                    <td className="px-6 py-4 text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        {item.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-800">
                      ₹{item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT  */}
        <div className="flex flex-col gap-4 sticky top-0 h-full overflow-hidden">
          {/*  QUICK ADDDDD  */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Quick Add (By ID)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={8}
                value={quickAddId}
                placeholder="Ex: ABCD1234"
                className={`w-full p-3 border rounded-lg focus:outline-none uppercase transition-all ${
                  error
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:ring-blue-200 focus:ring-4"
                }`}
                onChange={(e) => handleQuickAdd(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl">
            <AddedItems cart={cart} updateQty={updateQty} />
          </div>
          <div onClick={() => cart.length > 0 && setShowModal(true)}>
            <CheckoutButton
              disabled={cart.length === 0}
              onClick={() => setShowModal(true)}
            />
          </div>
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
