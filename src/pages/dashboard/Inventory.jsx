import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios"; 
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import InventorySearch from "../../components/InventorySearch";
import InventoryFilter from "../../components/InventoryFilter";
import InventoryTable from "../../components/InventoryTable";
import InventorySort from "../../components/InventorySort";
import { MdQrCodeScanner } from "react-icons/md";
import { jsPDF } from "jspdf";

export default function Inventory() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("default");
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrSize, setQrSize] = useState("50x25");

  const [filters, setFilters] = useState({
    section: "all",
    size: "all",
    brand: "all",
    color: "all",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/products", {
        params: { 
          search: searchTerm,
          size: filters.size === "all" ? null : filters.size,
          color: filters.color === "all" ? null : filters.color,
          section: filters.section === "all" ? null : filters.section,
          brand: filters.brand === "all" ? null : filters.brand
        }
      });


      const cachedData = JSON.parse(localStorage.getItem("inventory_cache") || "[]");
      
      const updatedItems = response.data.map(serverItem => {
        const cachedItem = cachedData.find(c => c.id === serverItem.id);
        return cachedItem ? { ...serverItem, stock_qty: cachedItem.stock_qty } : serverItem;
      });

      setItems(updatedItems);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);


  //     setItems(response.data); 
  //   } catch (error) {
  //     console.error("Error fetching inventory:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [searchTerm, filters]);

  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [fetchProducts]);

  const brands = useMemo(() => [...new Set(items.map((item) => item.brand))], [items]);
  const sections = useMemo(() => [...new Set(items.map((item) => item.section))], [items]);
  const colors = useMemo(() => [...new Set(items.map((item) => item.color))], [items]);
  const sizes = useMemo(() => [...new Set(items.map((item) => item.size))], [items]);

  let processedItems = [...items];
  if (sortType === "lowToHigh") processedItems.sort((a, b) => a.price - b.price);
  else if (sortType === "highToLow") processedItems.sort((a, b) => b.price - a.price);
  else if (sortType === "alphabetical") processedItems.sort((a, b) => a.name.localeCompare(b.name));


// const handleDownloadAllQR = async () => {
//   setIsDownloading(true);
//   const doc = new jsPDF({
//     orientation: "portrait",
//     unit: "mm",
//     format: [40, 40], // Decreased page size to 40x40mm
//   });

//   const getBase64Image = (url) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "Anonymous";
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/png"));
//       };
//       img.onerror = reject;
//       img.src = url;
//     });
//   };

//   try {
//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${product.id}`;
//     const base64 = await getBase64Image(qrUrl);
    
//     // Centers the 25mm QR code on the 40mm page (left margin: 7.5mm)
//     doc.addImage(base64, "PNG", 7.5, 3, 25, 25); 
    
//     // ID Text - Centered at X=20
//     doc.setFontSize(9);
//     doc.text(`ID: ${product.id}`, 20, 32, { align: "center" });
    
//     // Product Name - Centered at X=20
//     doc.setFontSize(7);
//     // Truncate name if it's too long for the small 40mm width
//     const displayName = product.name.length > 25 ? product.name.substring(0, 22) + "..." : product.name;
//     doc.text(displayName, 20, 37, { align: "center" });
    
//     doc.save(`QR_${product.id}.pdf`);
//   } catch (err) {
//     console.error("QR Generation failed", err);
//     alert("Failed to generate QR code image.");
//   } finally {
//     setIsDownloading(false);
//   }
// };
  

// const handleDownloadAllQR = async () => {
  
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: [80, 80], 
//     });

//     const getBase64Image = (url) => {
//       return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = "Anonymous";
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;
//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0);
//           resolve(canvas.toDataURL("image/png"));
//         };
//         img.onerror = reject;
//         img.src = url;
//       });
//     };

//     for (let i = 0; i < processedItems.length; i++) {
//       const item = processedItems[i];
//       const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${item.id}`;
      
//       try {
//         const base64 = await getBase64Image(qrUrl);
        
//         if (i > 0) doc.addPage([80, 80], "portrait");

//         // Inside the for-loop
// const qrSize = 15; // Smaller QR to fit small page
// const pageWidth = 50; 
// const pageHeight = 25;
// const xPos = 2; // Move to the left
// const yPos = 5; // Center vertically

// // Add QR Code
// doc.addImage(base64, "PNG", xPos, yPos, qrSize, qrSize); 

// // Adjust Text Position (to the right of the QR code)
// doc.setFontSize(7);
// doc.text(`ID: ${item.id}`, 20, 10); // x=20 moves text to the right of QR

// doc.setFontSize(6);
// const shortName = item.name.substring(0, 20);
// doc.text(shortName, 20, 16);

//       //  const qrSize = 20;
//       //   const pageWidth = 80;
//       //   const xPos = (pageWidth - qrSize) / 2; 
//       //   const yPos = 15;

//       //   doc.addImage(base64, "PNG", xPos, yPos, qrSize, qrSize); 

//       //   doc.setFontSize(6);
//       //   doc.text(`ID: ${item.id}`, 40, yPos + qrSize + 8, { align: "center" });
        
//       //   doc.setFontSize(5);
//       //   doc.text(item.name.substring(0, 30), 40, yPos + qrSize + 14, { align: "center" });
//       } catch (err) {
//         console.error("Failed to load QR for item", item.id);
//       }
//     }
//     doc.save("Inventory_All_QRCodes.pdf");
//   };


const handleDownloadAllQR = async () => {
  const [w, h] = qrSize.split("x").map(Number);
  const isLandscape = w > h;
  // For custom formats in jsPDF, if it's landscape, it expects the base format to be [shorter, longer].
  // Otherwise it double rotates and turns the labels sideways! 
  const formatParams = isLandscape ? [h, w] : [w, h];
  
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

  for (let i = 0; i < processedItems.length; i++) {
    const item = processedItems[i];
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${item.id}`;
    
    try {
      const base64 = await getBase64Image(qrUrl);
      
      if (i > 0) doc.addPage(formatParams, isLandscape ? "landscape" : "portrait");

      // Add 4mm general padding to left and right limits
      const padding = 4;
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
      doc.text(`${item.id}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.6;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const shortName = item.name.length > 25 ? item.name.substring(0, 23) + "..." : item.name;
      doc.text(shortName, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.1;
      
      doc.text(`Size: ${item.size || "N/A"}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.1;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const gstPercent = parseFloat(item.gst || 5);
      const mrp = parseFloat(item.price) * (1 + (gstPercent / 100));
      const formattedMRP = mrp.toFixed(2);
      doc.text(`MRP:`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });
      detailsY += 4.6;
      doc.text(`Rs. ${formattedMRP}`, detailsX + detailsXOffset, detailsY, { align: "left", baseline: "top" });

    } catch (err) {
      console.error("Failed to load QR for item", item.id);
    }
  }
  doc.save("Compact_QR_Labels.pdf");
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
            <select 
              value={qrSize} 
              onChange={(e) => setQrSize(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 shadow-sm outline-none"
            >
              <option value="50x25">50 x 25 mm</option>
              <option value="75x50">75 x 50 mm</option>
              <option value="50x50">50 x 50 mm</option>
              <option value="100x50">100 x 50 mm</option>
            </select>
            <button 
              onClick={handleDownloadAllQR}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
            >
              <MdQrCodeScanner className="text-xl text-blue-600" /> 
              Download All QR Code
            </button>
            </div>
          )}
          <Link
            to="/dashboard/inventory/addProduct"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
          >
            <IoMdAdd className="text-xl" /> Add New Product
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <InventorySearch setSearchTerm={setSearchTerm} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <InventoryFilter
            filters={filters}
            setFilters={setFilters}
            sections={sections}
            sizes={sizes}
            brands={brands}
            colors={colors}
          />
          <InventorySort sortType={sortType} setSortType={setSortType} />
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-xl font-bold text-slate-500 animate-pulse">
          Loading Inventory...
        </div>
      ) : (
        <InventoryTable 
          processedItems={processedItems} 
          onRowClick={(id) => navigate(`/dashboard/inventory/update/${id}`)} 
        />
      )}
    </div>
  );
}