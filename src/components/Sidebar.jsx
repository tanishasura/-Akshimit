import React from "react";
import { TiShoppingCart } from "react-icons/ti";
import { CgNotes } from "react-icons/cg";
import { Link, NavLink } from "react-router-dom";
import { GrTransaction } from "react-icons/gr";

export default function Sidebar({ isCollapsed }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 h-20 flex items-center border-b border-slate-700">
        <span className="text-2xl font-bold truncate">
          {isCollapsed ? "A" : "Akshmit"}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/dashboard/checkout"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg transition-all ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
            }`
          }
        >
          <span className="text-xl shrink-0"><TiShoppingCart /></span>
          {!isCollapsed && <span className="ml-3 font-medium">Checkout</span>}
        </NavLink>

        <NavLink
          to="/dashboard/inventory"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg transition-all ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
            }`
          }
        >
          <span className="text-xl shrink-0"><CgNotes /></span>
          {!isCollapsed && <span className="ml-3 font-medium text-nowrap">Inventory Details</span>}
        </NavLink>
        <NavLink
          to="/dashboard/transaction"
          className={({ isActive }) =>
            `flex items-center p-3 rounded-lg transition-all ${
              isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
            }`
          }
        >
          <span className="text-xl shrink-0"><GrTransaction /></span>
          {!isCollapsed && <span className="ml-3 font-medium text-nowrap">Transaction</span>}
        </NavLink>
      </nav>
    </div>
  );
}