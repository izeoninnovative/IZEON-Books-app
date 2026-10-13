import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Mail,
  Calendar,
  Lock,
  User,
  Shield,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "../api/client";

export const AdminHRPage: React.FC = () => {
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchHRUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/hr-users");
      setHrUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch HR users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRUsers();
  }, []);

  const handleCreateHR = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setSubmitting(true);
      const res = await api.post("/admin/hr-users", form);
      setSuccessMsg(`HR staff account "${res.data.data.username}" created successfully!`);
      setForm({ username: "", email: "", password: "" });
      fetchHRUsers();
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to create HR account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            HR Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign and oversee HR accounts authorized to enroll students and collect fees
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHRUsers}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] font-semibold text-sm shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign New HR</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#1656a6] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-slate-900 mb-0.5">
            Administrative Access Control Policy
          </span>
          Only Admins possess credentials to create or assign HR accounts. HR personnel have
          permission to enroll students, generate GST/Non-GST invoices, and collect EMI payments,
          while financial reports and salary records remain strictly Admin-only.
        </div>
      </div>

      {/* HR Users Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading HR staff accounts...
          </div>
        ) : hrUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No HR accounts created yet. Click "Assign New HR" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role Badge</th>
                  <th className="px-6 py-3.5">Assigned On</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hrUsers.map((hr) => (
                  <tr key={hr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1656a6] border border-blue-200 flex items-center justify-center font-bold text-sm">
                          {hr.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{hr.username}</span>
                          <span className="text-[11px] text-slate-400">ID #{hr.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hr.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1656a6] border border-blue-200 uppercase">
                        {hr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(hr.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign HR Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Assign New HR Staff Account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide credentials for the HR staff member to log in
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHR} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya HR"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@izeon.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Login Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create HR Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminHRPage;
