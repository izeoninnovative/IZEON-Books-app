import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Receipt,
  BarChart3,
  UserCheck,
  Building2,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/interview logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const navLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", adminOnly: false, exact: true },
    { to: "/students", icon: Users, label: "Students", adminOnly: false, exact: true },
    { to: "/students/new", icon: UserPlus, label: "New Admission", adminOnly: false, exact: false },
    { to: "/invoices", icon: Receipt, label: "Invoices & Receipts", adminOnly: false, exact: false },
    { to: "/reports", icon: BarChart3, label: "P&L Reports", adminOnly: true, exact: false },
    { to: "/hr-management", icon: UserCheck, label: "HR Management", adminOnly: true, exact: false },
    { to: "/settings", icon: Building2, label: "Company & GST", adminOnly: true, exact: false },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Area: Seamless with the top header bar */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-blue-900/40 bg-[#154E98] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={logoImg}
                alt="IZEON Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-base text-white tracking-tight">IZEON</span>
                <span className="font-bold text-base text-blue-200 tracking-tight">Books</span>
              </div>
              <span className="block text-[10px] text-blue-100/80 font-medium tracking-wide mt-1">
                Academy Accounts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/50 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </span>
          </div>

          {navLinks
            .filter((link) => !link.adminOnly || isAdmin)
            .map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#154E98] text-white shadow-sm shadow-blue-950/15 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Bottom Profile & Sign Out Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#154E98] text-[#F7F0E8] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {user?.username}
                </p>
                <span
                  className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5 ${
                    isAdmin
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-blue-50 text-[#154E98] border border-blue-200"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
