import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";

export default function InventoryFilter({filterType, setFilterType, sections, sizes, brands, colors}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (val) => {
    setFilterType(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-80">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between bg-white cursor-pointer text-sm font-medium text-slate-600 shadow-sm hover:border-blue-500 transition-all"
      >
        <span className="capitalize">{filterType === 'all' ? "All Products" : filterType}</span>
        <IoIosArrowDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>


      {isOpen && (
        <>
        
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-100">
            <div className="max-h-96 overflow-y-auto p-1">
              
              <button onClick={() => handleSelect("all")} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded border-b">All Products</button>

              {/* SORT */}
              <div className="text-sm font-bold text-slate-500 uppercase px-4 pt-3 pb-1 border-b">Sort By</div>
              <button onClick={() => handleSelect("alphabetical")} className="w-full text-left px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100">A to Z</button>
              <button onClick={() => handleSelect("lowToHigh")} className="w-full text-left px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100">Price: Low to High</button>
              <button onClick={() => handleSelect("highToLow")} className="w-full text-left px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100">Price: High to Low</button>

              {/* SECTIONS */}
              <div className="text-sm font-bold text-slate-500 uppercase px-4 pt-3 pb-1 border-b">Sections</div>
              <div className="grid grid-cols-2 gap-1">
              {sections.map((sec) => (
                <button key={sec} onClick={() => handleSelect(sec)} className="w-full text-left px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100">{sec}</button>
              ))}
              </div>

              {/* SIZES */}
              <div className="text-sm font-bold text-slate-500 uppercase px-4 pt-3 pb-1 border-b">Sizes</div>
              <div className="grid grid-cols-2 gap-1"> 
  {sizes.map((s) => (
    <button 
      key={s} 
      onClick={() => handleSelect(s)} 
      className={`w-full text-left px-4 py-1.5 text-sm transition-colors rounded ${
        filterType === s 
          ? "bg-blue-50 text-blue-600 font-bold" 
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
       {s}
    </button>
  ))}
  </div>

        
              <div className="px-4 py-4 border-t border-b bg-slate-50/50 my-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Select Color: <span className="text-blue-600">{filterType !== 'all' && colors.includes(filterType) ? filterType : ""}</span>
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((colorName) => (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => handleSelect(colorName)}
                      title={colorName}
                      style={{ backgroundColor: colorName.toLowerCase().replace(" ", "") }}
                      className={`w-6 h-6 aspect-square  rounded-sm transition-all transform hover:scale-110 flex items-center justify-center border border-slate-200 ${
                        filterType === colorName ? "ring-2 ring-blue-500 ring-offset-1 shadow-md" : "shadow-sm"
                      }`}
                    >
                      {filterType === colorName && (
                        <span className={colorName.toLowerCase() === "white" ? "text-black text-[10px]" : "text-white text-[10px]"}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* BRANDS */}
              <div className="text-sm font-bold  text-slate-500 uppercase px-4 pt-1 pb-1 border-b">Brands</div>

             <div className="grid grid-cols-2 gap-1">
             {brands.map((b) => (
                <button key={b} onClick={() => handleSelect(b)} className=" w-full text-left px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-100 mb-1">{b}</button>
              ))}
             </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}