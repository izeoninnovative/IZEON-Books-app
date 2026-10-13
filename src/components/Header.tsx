import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
       
        <h1 className="text-lg font-bold text-white tracking-tight">{title || "IZEON Books"}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-300">
            {user?.username}
          </span>
           <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer" title="Log out">
          <LogOut className="w-3.5 h-3.5" /> 
          <span className="hidden sm:inline">Logout</span>
        </button>
        </div>
      </div>
    </header>
  );
};
