import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout"; 
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Checkout from "./pages/dashboard/Checkout";
import Inventory from "./pages/dashboard/Inventory";
import AddProduct from "./pages/AddProduct";
import Transaction from "./pages/dashboard/Transaction";
import Update from "./pages/dashboard/Update";
import Logout from "./pages/Logout";

const ProtectedRoute = ({children, allowAdminOnly = false}) => {
    const session = JSON.parse(localStorage.getItem("user_session"));

    if(!session) return <Navigate to='/signIn' replace/>
    if(allowAdminOnly && session.role !== 'admin'){
      return <Navigate to='/dashboard/checkout' replace/>
    }
    return children;
}

const PublicRoute = ({ children }) => {
  const session = JSON.parse(localStorage.getItem("user_session"));
  if (session) {
    return <Navigate to="/dashboard/checkout" replace />;
  }
  return children;
};

export default function App() {
  const hasSession = localStorage.getItem("user_session");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          hasSession ? <Navigate to="/dashboard/checkout" replace /> : <Navigate to="/signIn" replace />
        } />

        <Route path="/signUp" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/signIn" element={<PublicRoute><SignIn /></PublicRoute>} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="checkout" replace />} />
          <Route path="checkout" element={<Checkout />} />
          
          <Route path="inventory" element={
            <ProtectedRoute allowAdminOnly={false}>
              <Inventory/>
            </ProtectedRoute>
          }/>

          <Route path="transaction" element={
            <ProtectedRoute allowAdminOnly={true}>
              <Transaction/>
            </ProtectedRoute>
          }/>

          <Route path="inventory/addProduct" element={
            <ProtectedRoute allowAdminOnly={true}>
              <AddProduct />
            </ProtectedRoute>
          } />

          <Route path="inventory/update/:id" element={
            <ProtectedRoute allowAdminOnly={true}>
              <Update/>
            </ProtectedRoute>
          }/>   

          <Route path="logout" element={<Logout/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}