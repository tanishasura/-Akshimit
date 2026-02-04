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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 80], 
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
      
      doc.addImage(base64, "PNG", 15, 5, 50, 50); 
      doc.setFontSize(12);
      doc.text(`ID: ${product.id}`, 40, 62, { align: "center" });
      doc.setFontSize(10);
      doc.text(product.name, 40, 68, { align: "center" });
      
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