import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdSave, IoMdTrash } from "react-icons/io";
import axios from "axios";

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard/inventory");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Product not found");
        navigate("/dashboard/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAdmin, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:8000/products/${id}`, {
        price: parseFloat(product.price),
        stock_qty: parseInt(product.stock_qty)
      });
      alert("Product updated successfully!");
      navigate("/dashboard/inventory");
    } catch (err) {
      alert("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/products/${id}`);
        alert("Product deleted!");
        navigate("/dashboard/inventory");
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  if (!isAdmin) return null; 
  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Connecting to Server...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Update {product.name}</h2>
        
        <form onSubmit={handleUpdate} className="space-y-4">
         

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
            <input 
              type="number" 
              min='0'
              step="0.01"
              required
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.price}
              onChange={(e) => setProduct({...product, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              min='0'
              required
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.stock_qty}
              onChange={(e) => setProduct({...product, stock_qty: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <IoMdSave className="text-xl" /> Update Product
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100 flex items-center gap-2 transition-colors">
              <IoMdTrash className="text-xl" /> Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}