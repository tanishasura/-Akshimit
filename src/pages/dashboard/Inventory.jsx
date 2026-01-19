import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios"; 
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import InventorySearch from "../../components/InventorySearch";
import InventoryFilter from "../../components/InventoryFilter";
import InventoryTable from "../../components/InventoryTable";
import InventorySort from "../../components/InventorySort";

export default function Inventory() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("default");

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
      setItems(response.data); 
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [fetchProducts]);

  const brands = useMemo(() => [...new Set(items.map((item) => item.brand))], [items]);
  const sections = useMemo(() => [...new Set(items.map((item) => item.section))], [items]);
  const colors = useMemo(() => [...new Set(items.map((item) => item.color))], [items]);
  const sizes =useMemo(() => [...new Set(items.map((item) => item.size))], [items]);

  let processedItems = [...items];
  if (sortType === "lowToHigh") processedItems.sort((a, b) => a.price - b.price);
  else if (sortType === "highToLow") processedItems.sort((a, b) => b.price - a.price);
  else if (sortType === "alphabetical") processedItems.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
        {isAdmin && (
          <Link
            to="/dashboard/inventory/addProduct"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
          >
            <IoMdAdd className="text-xl" /> Add New Product
          </Link>
        )}
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