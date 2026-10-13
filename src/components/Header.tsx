import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/interview logo.png";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 border-b border-blue-900/40 bg-[#154E98] backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-xs ring-1 ring-slate-200 flex items-center justify-center lg:hidden">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#F9F0E8] tracking-tight">
            {title || "IZEON Books"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1656a6] to-[#124587] border border-blue-200 flex items-center justify-center font-bold text-xs text-[#F7F0E8] shadow-xs">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>

          <span className="hidden sm:inline text-xs font-semibold text-[#F7F0E8]">
            {user?.username}
          </span>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
