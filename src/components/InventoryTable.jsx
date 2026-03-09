import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getColorCode } from '../utils/colorUtils';

export default function InventoryTable({ processedItems }) {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="font-bold text-2xl text-slate-700">All Product Details</div>
          <div className="text-sm text-slate-500 font-medium">
            Showing {processedItems.length} products
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-md font-medium border-b">
                <th className="px-6 py-4 w-px whitespace-nowrap">ID</th>
                <th className="px-6 py-4 w-full">Name</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Size & Color</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">GST (%)</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Type</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Material</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Section</th>
                <th className="px-6 py-4 w-px whitespace-nowrap">Brand</th>
                <th className="px-6 py-4 text-center w-px whitespace-nowrap">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-50 last:border-none transition-colors ${
                    isAdmin ? "cursor-pointer hover:bg-slate-50" : "cursor-default"
                  }`}
                  onClick={() => isAdmin && navigate(`/dashboard/inventory/update/${item.id}`)}
                >
                  <td className="px-6 py-4 font-semibold w-px whitespace-nowrap">{item.id}</td>
                  <td className="px-6 py-4 text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 w-px whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {item.color && item.color.toLowerCase() !== 'all' && item.color.toLowerCase() !== 'n/a' ? (
                        <div 
                          className="w-4 h-4 rounded-sm border border-slate-300 shadow-sm"
                          style={{ backgroundColor: getColorCode(item.color) }}
                          title={item.color}
                        />
                      ) : null}
                      <span className="text-slate-600 font-medium">
                        {item.size && item.size.toLowerCase() !== 'all' && item.size.toLowerCase() !== 'n/a' ? item.size : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold w-px whitespace-nowrap">₹{item.price}</td>
                  <td className="px-6 py-4 text-center text-slate-800 font-semibold w-px whitespace-nowrap">
                    {item.gst || 5}% 
                  </td>
                  <td className="px-6 py-4 text-center text-slate-800 w-px whitespace-nowrap">{item.type}</td>
                  <td className="px-6 py-4 text-center text-slate-800 w-px whitespace-nowrap">{item.material}</td>
                  <td className="px-6 py-4 text-center capitalize text-slate-600 w-px whitespace-nowrap">{item.section}</td>
                  <td className="px-6 py-4 text-slate-800 w-px whitespace-nowrap">{item.brand}</td>
                  <td className="px-6 py-4 text-center w-px whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        item.stock_qty > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.stock_qty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedItems.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-400">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}