import React from 'react';
import { IoIosSearch } from 'react-icons/io';

export default function InventorySearch({setSearchTerm}) {
  return (
    <div>
        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search ID or Name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
    </div>
  );
}
