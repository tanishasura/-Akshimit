import React, { useState } from "react";
import {IoMdCloudUpload } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";; 
import products from "../mockdata/products.json";

export default function AddProduct() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    price: "",
    color: "",
    material: "",
    brand: "",
    stock_qty: "",
    section: "",
    type: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      ...formData,
      id: "ABCD" + Math.floor(1000 + Math.random() * 9000), 
      price: parseFloat(formData.price),
      stock_qty: parseInt(formData.stock_qty),
    };
    const savedData = localStorage.getItem("my_inventory");
    const currentInventory = savedData ? JSON.parse(savedData) : products;

    const updatedInventory = [newProduct, ...currentInventory];
    localStorage.setItem("my_inventory", JSON.stringify(updatedInventory));
    alert("Product added successfully!");
    navigate("/dashboard/inventory");
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Add New Inventory Item
          </h2>
          
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
     
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Product Name</label>
              <input
                name="name"
                required
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Slim Fit Denim"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Brand</label>
              <input
                name="brand"
                required
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Levi's"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Size</label>
              <input
                name="size"
                required
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="XL, 32, M, etc."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Color</label>
              <input
                name="color"
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Blue, Black..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Material</label>
              <input
                name="material"
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Cotton, Silk..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Type</label>
              <input
                name="type"
                onChange={handleChange}
                type="text"
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Formal, Casual..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-blue-900">Section</label>
              <select
                name="section"
                required
                onChange={handleChange}
                className="border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              >
                <option value="">Select Section</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-blue-900">Price (₹)</label>
              <input
                name="price"
                required
                onChange={handleChange}
                type="number"
                className="border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-blue-900">Stock Quantity</label>
              <input
                name="stock_qty"
                required
                onChange={handleChange}
                type="number"
                className="border border-blue-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link 
              to="/dashboard/inventory"
              className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <IoMdCloudUpload className="text-xl" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}