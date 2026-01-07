import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout"; 
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Checkout from "./pages/dashboard/Checkout";
import Inventory from "./pages/dashboard/Inventory";
import AddProduct from "./pages/AddProduct";
import Transaction from "./pages/dashboard/Transaction";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />

        {/* Dashboard Routes with Sidebar */}
        <Route path="/dashboard" element={<Layout />}>
        
          <Route index element={<Navigate to="checkout" replace />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/addProduct" element={<AddProduct />} />
          <Route path="transaction" element={<Transaction/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}