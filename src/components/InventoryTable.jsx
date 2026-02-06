import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function InventoryTable({ processedItems }) {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("user_session"));
  const isAdmin = session?.role === "admin";

  const inStockItems = processedItems.filter(item => item.stock_qty > 0);

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="font-bold text-2xl text-slate-700">All Product Details</div>
          <div className="text-sm text-slate-500 font-medium">
          Showing {inStockItems.length} products
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-md font-medium border-b">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-center">Size</th>
                <th className="px-6 py-4 text-center">Price</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Material</th>
                <th className="px-6 py-4 text-center">Color</th>
                <th className="px-6 py-4 text-center">Section</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4 text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
           {inStockItems.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-50 last:border-none transition-colors ${
                    isAdmin ? "cursor-pointer hover:bg-slate-50" : "cursor-default"
                  }`}
                  onClick={() => isAdmin && navigate(`/dashboard/inventory/update/${item.id}`)}
                >
                  <td className="px-6 py-4 font-semibold">{item.id}</td>
                  <td className="px-6 py-4 text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                      {item.size}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">₹{item.price}</td>
                  <td className="px-6 py-4 text-center text-slate-800">{item.type}</td>
                  <td className="px-6 py-4 text-center text-slate-800">{item.material}</td>
                  <td className="px-6 py-4 text-center text-slate-800">{item.color}</td>
                  <td className="px-6 py-4 text-center capitalize text-slate-600">{item.section}</td>
                  <td className="px-6 py-4 text-slate-800">{item.brand}</td>
                  <td className="px-6 py-4 text-center">
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