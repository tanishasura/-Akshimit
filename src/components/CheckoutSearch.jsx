import React from 'react';
import { IoIosSearch } from 'react-icons/io';

export default function CheckoutSearch({setSearchTerm}) {
  return (
    <div className='relative'>
       <input
                  type="text"
                  placeholder="Search ID or Name..."
                  className="pl-3 pr-8 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-2.5 text-slate-600">
                  <IoIosSearch />
                </div>
    </div>
  );
}
