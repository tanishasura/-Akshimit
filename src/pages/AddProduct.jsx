import React, { useState } from "react";
import { IoMdCloudUpload } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 

export default function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    gst: "5",
  });

  const colorOptions = [
    { name: "Red", class: "bg-red-500" }, { name: "Black", class: "bg-black" },
    { name: "Blue", class: "bg-blue-700" }, { name: "Purple", class: "bg-purple-800" },
    { name: "Grey", class: "bg-gray-500" }, { name: "White", class: "bg-white border border-slate-300" },
    { name: "Maroon", class: "bg-red-700" }, { name: "Khaki", class: "bg-[#C3B091]" },
    { name: "Dark Brown", class: "bg-red-900" }, { name: "Pink", class: "bg-pink-400" },
    { name: "Sky Blue", class: "bg-blue-400" }, { name: "Orange", class: "bg-orange-500" },
    { name: "Yellow", class: "bg-yellow-400" }, { name: "Green", class: "bg-green-600" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (colorName) => {
    setFormData({ ...formData, color: colorName });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.color) return alert("Please select a color!");

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_qty: parseInt(formData.stock_qty),
        gst: parseFloat(formData.gst),
      };

      const response = await axios.post("http://127.0.0.1:8000/products", payload);

      if (response.status === 200 || response.status === 201) {
        alert("Product saved to Database!");
        navigate("/dashboard/inventory");
      }
    } catch (error) {
      console.error("Axios Error:", error);
      const message = error.response?.data?.detail || "Connection to server failed";
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Add New Inventory Item</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Inputs Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Product Name</label>
              <input name="name" required onChange={handleChange} type="text" className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Slim Fit Denim" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Brand</label>
              <input name="brand" required onChange={handleChange} type="text" className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Levi's" />
            </div>
          </div>

          {/* Size, Material, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Size</label>
              <input name="size" required onChange={handleChange} type="text" className="border border-slate-300 rounded-lg p-2.5" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Material</label>
              <input name="material" onChange={handleChange} type="text" className="border border-slate-300 rounded-lg p-2.5" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Type</label>
              <input name="type" onChange={handleChange} type="text" className="border border-slate-300 rounded-lg p-2.5" />
            </div>
          </div>

          {/* Color Select */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700">Select Color: <span className="text-blue-600 ml-2">{formData.color || "None"}</span></label>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {colorOptions.map((color) => (
                <button key={color.name} type="button" onClick={() => handleColorSelect(color.name)} className={`w-5 h-5 rounded-full ${color.class} ${formData.color === color.name ? "ring-4 ring-blue-500" : ""}`} />
              ))}
            </div>
          </div>

          {/* Section, Price, Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Section</label>
              <select name="section" required onChange={handleChange} className="border border-slate-300 rounded-lg p-2.5 bg-white">
                <option value="">Select Section</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            
           
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Stock Qty</label>
              <input name="stock_qty" required onChange={handleChange} type="number" className="border border-slate-300 rounded-lg p-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Price (₹)</label>
              <input name="price" required onChange={handleChange} type="number" className="border border-slate-300 rounded-lg p-2.5" />
            </div>
 <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">GST (%)</label>
              <input name="gst" value={formData.gst} required onChange={handleChange} type="number" className="border border-slate-300 rounded-lg p-2.5 text-black font-bold" placeholder="5" />
            </div>

          

          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link to="/dashboard/inventory" className="px-6 py-2.5 text-slate-600 font-semibold">Cancel</Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white transition-all ${isSubmitting ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <IoMdCloudUpload className="text-xl" />
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}