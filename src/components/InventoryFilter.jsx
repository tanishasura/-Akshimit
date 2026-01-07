import React from 'react';

export default function InventoryFilter({filterType, setFilterType, sections, sizes, brands}) {
  return (
    <div>
       <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer text-sm font-medium text-slate-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Products</option>

            <optgroup label="Sort By">
              <option value="alphabetical">A to Z</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </optgroup>

            <optgroup label="Sections">
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section: {sec}
                </option>
              ))}
            </optgroup>

            <optgroup label="Sizes">
              {sizes.map((s) => (
                <option key={s} value={s}>
                  Size: {s}
                </option>
              ))}
            </optgroup>

            <optgroup label="Brands">
              {brands.map((b) => (
                <option key={b} value={b}>
                  Brand: {b}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
    </div>
  );
}
