import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { GiCheckMark } from "react-icons/gi"; 

export default function CheckoutFilter({
  filters,
  setFilters,
 
  sizes,
  brands,
  colors,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (category, val) => {
    setFilters((prev) => ({
      ...prev,
      [category]: val,
    }));
  };

  const resetAll = () => {
    setFilters({ size: "all", brand: "all", color: "all" });
    setIsOpen(false);
  };

  const activeCount = Object.values(filters).filter((v) => v !== "all").length;

  return (
    <div className="relative w-full md:w-80">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between bg-white cursor-pointer text-sm font-medium text-slate-600 shadow-sm hover:border-blue-500 transition-all"
      >
        <div className="flex items-center gap-2">
          <FiFilter
            className={activeCount > 0 ? "text-blue-600" : "text-slate-400"}
          />
          <span className="capitalize">
            {activeCount > 0
              ? `${activeCount} Filters Applied`
              : "All Products"}
          </span>
        </div>
        <IoIosArrowDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-100 w-full min-w-[280px]">
            <div className="max-h-96 overflow-y-auto p-1">
              <button
                onClick={resetAll}
                className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded border-b mb-1"
              >
                Reset All Filters
              </button>

            
              {/* SIZES */}
              <div className="text-[10px] font-bold text-slate-400 uppercase px-4 pt-3 pb-1 border-b">
                Sizes
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                <button
                  onClick={() => handleSelect("size", "all")}
                  className={`text-left px-4 py-1.5 text-sm rounded ${
                    filters.size === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Sizes
                </button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelect("size", s)}
                    className={`text-left px-4 py-1.5 text-sm rounded transition-colors ${
                      filters.size === s ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* COLORS */}
              <div className="px-4 py-4 border-t border-b bg-slate-50/50 my-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                  Select Color: <span className="text-blue-600">{filters.color !== "all" ? filters.color : ""}</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((colorName) => (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => handleSelect("color", colorName)}
                      title={colorName}
                      style={{ backgroundColor: colorName.toLowerCase().replace(/\s/g, "") }}
                      className={`w-6 h-6 rounded-sm flex items-center justify-center border border-slate-200 ${
                        filters.color === colorName ? "ring-2 ring-blue-500 ring-offset-1 shadow-md" : ""
                      }`}
                    >
                      {filters.color === colorName && (
                        <GiCheckMark size={12} className={colorName.toLowerCase() === "white" ? "text-black" : "text-white"} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* BRANDS */}
              <div className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-1 pb-1 border-b">
                Brands
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                <button
                  onClick={() => handleSelect("brand", "all")}
                  className={`text-left px-4 py-1.5 text-sm rounded ${
                    filters.brand === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleSelect("brand", b)}
                    className={`text-left px-4 py-1.5 text-sm rounded transition-colors ${
                      filters.brand === b ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}