import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import logoImg from "../assets/interview logo.png";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("admin@izeon.com");
  const [password, setPassword] = useState("izeon@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        success(`Welcome back, ${res.data.data.user.username}!`, "Signed In");
        navigate("/");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(msg);
      notifyError(msg, "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1656a6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#8a252d]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4 group">
            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl ring-2 ring-slate-200 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoImg}
                alt="IZEON Books Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#8a252d] ring-4 ring-slate-50"
              title="IZEON Academy"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            <span>IZEON</span>
            <span className="text-[#1656a6]">Books</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institute Fees, Invoicing & Financial Accounting
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-[#8a252d]" /> Admin & HR
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@izeon.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6] focus:ring-1 focus:ring-[#1656a6] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6] focus:ring-1 focus:ring-[#1656a6] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1656a6] to-[#124587] hover:from-[#1b61bd] hover:to-[#1656a6] text-[#F7F0E8] font-semibold text-sm shadow-md shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Default Admin: <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono">admin@izeon.com</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
