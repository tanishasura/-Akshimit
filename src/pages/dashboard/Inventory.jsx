import React, { useState, useMemo } from "react";
import products from "../../mockdata/products.json";
import { IoMdAdd, IoIosSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import InventorySearch from "../../components/InventorySearch";
import InventoryFilter from "../../components/InventoryFilter";
import InventoryTable from "../../components/InventoryTable";

export default function Inventory() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("my_inventory");
    return saved ? JSON.parse(saved) : products;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const brands = useMemo(
    () => [...new Set(items.map((item) => item.brand))],
    [items]
  );
  const sections = useMemo(
    () => [...new Set(items.map((item) => item.section))],
    [items]
  );
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  let processedItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting logic
  if (filterType === "lowToHigh") {
    processedItems.sort((a, b) => a.price - b.price);
  } else if (filterType === "highToLow") {
    processedItems.sort((a, b) => b.price - a.price);
  } else if (filterType === "alphabetical") {
    processedItems.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Filtering logic
  if (sizes.includes(filterType)) {
    processedItems = processedItems.filter((item) => item.size === filterType);
  }

  if (brands.includes(filterType)) {
    processedItems = processedItems.filter((item) => item.brand === filterType);
  }

  if (sections.includes(filterType)) {
    processedItems = processedItems.filter(
      (item) => item.section === filterType
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          Inventory Management
        </h1>
        <Link
          to="/dashboard/inventory/addProduct"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
        >
          <IoMdAdd className="text-xl" />
          Add New Product
        </Link>
      </div>

      {/* Search & Filter  */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <InventorySearch setSearchTerm={setSearchTerm}/>
        </div>
        <InventoryFilter 
          filterType={filterType} 
          setFilterType={setFilterType} 
          sections={sections} 
          sizes={sizes} 
          brands={brands}
        />
      </div>

      {/* Table  */}
      <InventoryTable processedItems={processedItems}/>
    </div>
  );
}