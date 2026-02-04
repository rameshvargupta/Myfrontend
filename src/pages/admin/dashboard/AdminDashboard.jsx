import Navbar from "@/components/Navbar";
import { useState } from "react";

import OrdersPanel from "./components/OrdersPanel";
import UsersPanel from "./components/UsersPanel";
import TransactionsPanel from "./components/TransactionsPanel";
import IncomePanel from "./components/IncomePanel";
import DashboardCards from "./components/DashboardCards";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("orders");

  const renderContent = () => {
    switch (activeView) {
      case "orders":
        return <OrdersPanel />;
      case "users":
        return <UsersPanel />;
      case "transactions":
        return <TransactionsPanel />;
      case "income":
        return <IncomePanel />;
      default:
        return <OrdersPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ===== NAVBAR ===== */}
      <Navbar />

      {/* ===== DASHBOARD CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 pt-30 pb-5 space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview of your store
          </p>
        </div>

        {/* ===== TOP STATS CARDS ===== */}
        <DashboardCards setActiveView={setActiveView} />

        {/* ===== MAIN CONTENT ===== */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
