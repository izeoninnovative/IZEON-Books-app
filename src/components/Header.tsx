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
    <header className="h-16 shrink-0 border-b border-blue-900/40 bg-[#154E98] backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-1.5 sm:p-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 active:bg-white/20 lg:hidden cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-xs ring-1 ring-slate-200 flex items-center justify-center shrink-0 lg:hidden">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-sm sm:text-lg font-bold text-[#F9F0E8] tracking-tight truncate">
            {title || "IZEON Books"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* User Avatar */}
          <div className="relative shrink-0">
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-500/20 border border-rose-300/30 transition-all cursor-pointer shadow-2xs"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
