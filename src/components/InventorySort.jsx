import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { BiSortAlt2 } from "react-icons/bi"; 

export default function InventorySort({ sortType, setSortType }) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: "Default", value: "default" },
    { label: "A to Z", value: "alphabetical" },
    { label: "Price: Low to High", value: "lowToHigh" },
    { label: "Price: High to Low", value: "highToLow" },
  ];

  const handleSelect = (val) => {
    setSortType(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-48">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-2 bg-white cursor-pointer text-sm font-medium text-slate-600 shadow-sm hover:border-blue-500 transition-all w-full"
      >
        <BiSortAlt2 className="text-lg text-slate-400" />
        <span className="flex-1 text-xs truncate">
            {options.find(opt => opt.value === sortType)?.label || "Sort By"}
        </span>
        <IoIosArrowDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
      <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden min-w-full">
            <div className="p-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2 text-sm rounded transition-colors ${
                    sortType === opt.value 
                      ? "bg-blue-50 text-blue-600 font-bold" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}