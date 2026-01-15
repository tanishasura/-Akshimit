import React, { useState, useMemo, useEffect } from "react";
import axios from "axios"; 
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import InventorySearch from "../../components/InventorySearch";
import InventoryFilter from "../../components/InventoryFilter";
import InventoryTable from "../../components/InventoryTable";

export default function Inventory() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/products", {
          params: { search: searchTerm }
        });
        setItems(response.data); 
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const brands = useMemo(() => [...new Set(items.map((item) => item.brand))], [items]);
  const sections = useMemo(() => [...new Set(items.map((item) => item.section))], [items]);
  const colors = useMemo(() => [...new Set(items.map((item) => item.color))], [items]);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

 
  let processedItems = [...items]; 

  if (filterType === "lowToHigh") processedItems.sort((a, b) => a.price - b.price);
  else if (filterType === "highToLow") processedItems.sort((a, b) => b.price - a.price);
  else if (filterType === "alphabetical") processedItems.sort((a, b) => a.name.localeCompare(b.name));

  if (sizes.includes(filterType)) processedItems = processedItems.filter((item) => item.size === filterType);
  if (brands.includes(filterType)) processedItems = processedItems.filter((item) => item.brand === filterType);
  if (sections.includes(filterType)) processedItems = processedItems.filter((item) => item.section === filterType);
  if (colors.includes(filterType)) processedItems = processedItems.filter((item) => item.color === filterType);

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
        <InventoryFilter
          filterType={filterType}
          setFilterType={setFilterType}
          sections={sections}
          sizes={sizes}
          brands={brands}
          colors={colors}
        />
      </div>

      {loading ? (
        <div className="p-20 text-center text-xl font-bold text-slate-500">
         Loading...
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