// original approach

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdSave, IoMdTrash } from "react-icons/io";
import axios from "axios";
import { jsPDF } from "jspdf";
import { MdQrCodeScanner } from "react-icons/md";

export default function Update() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrSize, setQrSize] = useState("50x25");
  const [mrp, setMrp] = useState("");

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
        const data = response.data;
        const gstPercent = parseFloat(data.gst || 5);
        const priceVal = parseFloat(data.price || 0);
        setProduct(data);
        setMrp((priceVal * (1 + gstPercent / 100)).toFixed(2));
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

  const colorOptions = [
    { name: "Red", class: "bg-red-500" }, { name: "Black", class: "bg-black" },
    { name: "Blue", class: "bg-blue-700" }, { name: "Purple", class: "bg-purple-800" },
    { name: "Grey", class: "bg-gray-500" }, { name: "White", class: "bg-white border border-slate-300" },
    { name: "Maroon", class: "bg-red-700" }, { name: "Khaki", class: "bg-[#C3B091]" },
    { name: "Dark Brown", class: "bg-red-900" }, { name: "Pink", class: "bg-pink-400" },
    { name: "Sky Blue", class: "bg-blue-400" }, { name: "Orange", class: "bg-orange-500" },
    { name: "Yellow", class: "bg-yellow-400" }, { name: "Green", class: "bg-green-600" },
  ];

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:8000/products/${id}`, {
        name: product.name,
        brand: product.brand,
        size: product.size,
        material: product.material,
        type: product.type,
        color: product.color,
        section: product.section,
        price: parseFloat(product.price),
        stock_qty: parseInt(product.stock_qty),
        gst: parseFloat(product.gst || 5)
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


    const handleDownloadSingleQR = async () => {
    setIsDownloading(true);
    const [w, h] = qrSize.split("x").map(Number);
    const isLandscape = w > h;
    const formatParams = [w, h];
    
    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: formatParams, 
    });

    const getBase64Image = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${product.id}`;
      const base64 = await getBase64Image(qrUrl);
      
      // Add 4mm general padding to left and right limits
      const padding = 0;
      const safeWidth = w - padding * 2;
      
      // Side-by-side layout: QR on left, details on right inside safe width
      const qrWidth = safeWidth * 0.50; 
      const detailsX = padding + safeWidth * 0.50; 
      
      // Calculate QR dimensions to fit in left half
      let qrDim = h - 10;
      if (qrDim > qrWidth - 5) qrDim = qrWidth - 5;
      if (qrDim < 7.5) qrDim = 7.5;
      
      // Center QR vertically in its half, but offset by left padding
      const qrX = padding + (qrWidth - qrDim) / 2;
      const qrY = (h - qrDim) / 2;
      
      // Add QR code
      doc.addImage(base64, "PNG", qrX, qrY, qrDim, qrDim);
      
      // Add details on the right side
      // Calculate total height of text block to center vertically
      const lineHeight = 4.1;
      const totalTextHeight = 4.6 + lineHeight * 2 + 4.6; // ID + Name + Size + MRP gap
      let detailsY = (h - totalTextHeight) / 2;
      
      const detailsXOffset = 1.3;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${product.id}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.6;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const displayName = product.name.length > 25 ? product.name.substring(0, 23) + "..." : product.name;
      doc.text(displayName, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.1;
      
      doc.text(`Size: ${product.size || "N/A"}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.1;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const gstPercent = parseFloat(product.gst || 5);
      const mrp = parseFloat(product.price) * (1 + (gstPercent / 100));
      const formattedMRP = mrp.toFixed(2);
      doc.text(`MRP:`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.6;
      doc.text(`Rs. ${formattedMRP}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      
      doc.save(`QR_${product.id}.pdf`);
    } catch (err) {
      console.error("QR Generation failed", err);
      alert("Failed to generate QR code image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Update {product.name}</h2>
        
        <div className="flex items-center gap-2">
          <select 
            value={qrSize} 
            onChange={(e) => setQrSize(e.target.value)}
            className="bg-slate-100 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          >
            <option value="50x25">50 x 25 mm</option>
            <option value="75x50">75 x 50 mm</option>
            <option value="50x50">50 x 50 mm</option>
            <option value="100x50">100 x 50 mm</option>
          </select>
          <button 
              type="button"
              onClick={handleDownloadSingleQR}
              disabled={isDownloading}
              className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <MdQrCodeScanner className="text-blue-600 text-lg" />
              {isDownloading ? "Generating..." : "Download QR"}
            </button>
        </div>

          </div>

        
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Inputs Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Product Name</label>
              <input name="name" required value={product.name || ""} onChange={(e) => setProduct({...product, name: e.target.value})} type="text" className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Brand</label>
              <input name="brand" required value={product.brand || ""} onChange={(e) => setProduct({...product, brand: e.target.value})} type="text" className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          {/* Size, Material, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Size</label>
              <input name="size" required value={product.size || ""} onChange={(e) => setProduct({...product, size: e.target.value})} type="text" className="border border-slate-300 rounded-lg p-2.5 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Material</label>
              <input name="material" value={product.material || ""} onChange={(e) => setProduct({...product, material: e.target.value})} type="text" className="border border-slate-300 rounded-lg p-2.5 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Type</label>
              <input name="type" value={product.type || ""} onChange={(e) => setProduct({...product, type: e.target.value})} type="text" className="border border-slate-300 rounded-lg p-2.5 outline-none" />
            </div>
          </div>

          {/* Color Select */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700">Select Color: <span className="text-blue-600 ml-2">{product.color || "None"}</span></label>
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {colorOptions.map((color) => (
                <button key={color.name} type="button" onClick={() => setProduct({...product, color: color.name})} className={`w-5 h-5 rounded-full ${color.class} ${product.color === color.name ? "ring-4 ring-blue-500" : ""}`} />
              ))}
            </div>
          </div>

          {/* Section & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Section</label>
              <select name="section" required value={product.section || "Men"} onChange={(e) => setProduct({...product, section: e.target.value})} className="border border-slate-300 rounded-lg p-2.5 bg-white outline-none">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Stock Quantity</label>
              <input 
                type="number" 
                min='0'
                required
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={product.stock_qty}
                onChange={(e) => setProduct({...product, stock_qty: e.target.value})}
              />
            </div>
          </div>

          {/* Pricing fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Price (₹)</label>
              <input 
                type="number" 
                min='0'
                step="0.01"
                required
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={product.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setProduct({...product, price: val});
                  const gstPercent = parseFloat(product.gst || 5);
                  setMrp((parseFloat(val || 0) * (1 + gstPercent / 100)).toFixed(2));
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">GST (%)</label>
              <input 
                type="number" 
                min='0'
                step="0.01"
                required
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold"
                value={product.gst || 5}
                onChange={(e) => {
                  const val = e.target.value;
                  setProduct({...product, gst: val});
                  const priceVal = parseFloat(product.price || 0);
                  setMrp((priceVal * (1 + parseFloat(val || 0) / 100)).toFixed(2));
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">MRP (including taxes) (₹)</label>
              <input 
                type="number" 
                min='0'
                step="0.01"
                required
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={mrp}
                onChange={(e) => {
                  const val = e.target.value;
                  setMrp(val);
                  const gstPercent = parseFloat(product.gst || 5);
                  setProduct({...product, price: (parseFloat(val || 0) / (1 + gstPercent / 100)).toFixed(2)});
                }}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
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