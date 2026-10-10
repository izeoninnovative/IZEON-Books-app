import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Overview Dashboard";
    if (pathname === "/students") return "Student Directory";
    if (pathname === "/students/new") return "New Student Admission";
    if (pathname.startsWith("/students/")) return "Student Profile & Ledger";
    if (pathname === "/invoices") return "Invoices & Receipts";
    if (pathname === "/reports") return "P&L Financial Reports";
    if (pathname === "/hr-management") return "HR Staff Management";
    if (pathname === "/settings") return "Company & GST Settings";
    return "IZEON Books";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
