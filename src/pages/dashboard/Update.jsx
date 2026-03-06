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
  const [qrSize, setQrSize] = useState("2x2");

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


  const handleDownloadSingleQR = async () => {
    setIsDownloading(true);
    const [w, h] = qrSize.split("x").map(Number);
    const doc = new jsPDF({
      orientation: w > h ? "landscape" : "portrait",
      unit: "in",
      format: [w, h], 
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
      
      // Side-by-side layout: QR on left, details on right
      const qrWidth = w * 0.50; // 50% for QR code area (used to be 45%)
      const detailsX = w * 0.50; // Text starts right at 50% boundary (used to be 55%)
      
      // Calculate QR dimensions to fit in left half
      let qrDim = h - 0.4;
      if (qrDim > qrWidth - 0.2) qrDim = qrWidth - 0.2;
      if (qrDim < 0.3) qrDim = 0.3;
      
      // Center QR vertically in its half
      const qrX = (qrWidth - qrDim) / 2;
      const qrY = (h - qrDim) / 2;
      
      // Add QR code
      doc.addImage(base64, "PNG", qrX, qrY, qrDim, qrDim);
      
      // Add details on the right side
      // Calculate total height of text block to center vertically
      const lineHeight = 0.16;
      const totalTextHeight = 0.18 + lineHeight * 2 + 0.18; // ID(0.18) + Name(0.16) + Size(0.16) + Unit Price(0.18) + Price amount(last line doesn't add to start pos offset)
      let detailsY = (h - totalTextHeight) / 2; // Subtract total height from container height and divide by 2 for center point
      
      const detailsXOffset = 0.05; // Give it a tiny bit of left margin from center divider
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${product.id}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 0.18;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const displayName = product.name.length > 25 ? product.name.substring(0, 23) + "..." : product.name;
      doc.text(displayName, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 0.16;
      
      doc.text(`Size: ${product.size || "N/A"}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 0.16;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const formattedPrice = parseFloat(product.price).toFixed(2);
      doc.text(`Unit Price:`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 0.18;
      doc.text(`Rs. ${formattedPrice}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      
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
            <option value="2x1">2 x 1 inch</option>
            <option value="2x2">2 x 2 inch</option>
            <option value="3x2">3 x 2 inch</option>
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