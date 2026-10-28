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
    if (pathname === "/hr-management") return "Staff & Attendance Management";
    if (pathname === "/settings") return "Company & GST Settings";
    if (pathname === "/my-attendance") return "My Attendance & Timings";
    if (pathname === "/my-payslips") return "My Salary & Payslips";
    if (pathname === "/my-appraisals") return "My Appraisals";
    return "IZEON Books";
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      {/* Sidebar: Locked in place, does not scroll with page */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content wrapper: Header is fixed, only main content area scrolls */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl w-full mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
