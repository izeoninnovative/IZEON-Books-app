import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Receipt,
  IndianRupee,
  CalendarClock,
  ArrowUpRight,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/interview logo.png";

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, invoicesRes] = await Promise.all([
          api.get("/students"),
          api.get("/payments/invoices"),
        ]);
        setStudents(studentsRes.data.data || []);
        setInvoices(invoicesRes.data.data || []);

        if (isAdmin) {
          const reportRes = await api.get("/admin/reports?filter=month");
          setReport(reportRes.data.data || null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const totalCollected = useMemo(
    () => invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0),
    [invoices]
  );
  const totalBalance = useMemo(
    () => students.reduce((acc, curr) => acc + (curr.feePlan?.balanceAmount || 0), 0),
    [students]
  );

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner (Royal Blue & Crimson Gradient on Clean Canvas) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1656a6] via-[#13488d] to-[#103b6f] text-[#F7F0E8] shadow-lg shadow-blue-900/15 relative overflow-hidden">
        {/* Background ambient logo watermark */}
        <div className="absolute -right-8 -bottom-8 w-52 h-52 opacity-15 pointer-events-none rounded-full overflow-hidden bg-white/20 p-2 blur-[0.5px]">
          <img src={logoImg} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md ring-2 ring-white/30 flex items-center justify-center shrink-0 hidden sm:flex">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-[#F7F0E8]/90 border border-white/20 backdrop-blur-xs">
                IZEON Books Management
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F7F0E8] mt-2 tracking-tight">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
                Track student admissions, lumpsum & EMI fees, GST invoices, and financial reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/students/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#1656a6] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[#1656a6]" />
              <span>New Admission</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (Crisp White Cards with Slate Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1656a6] border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{students.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active admissions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {invoices.length} invoices generated
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Balances</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-3">
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming EMI dues</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Profit (Monthly)</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1656a6] mt-3">
            ₹{(report?.summary?.netProfit ?? totalCollected).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">After office & staff costs</span>
        </div>
      </div>

      {/* Recent Admissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students Table (Clean White Card) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Enrolled Students</h3>
              <p className="text-xs text-slate-500">Latest admission records</p>
            </div>
            <Link
              to="/students"
              className="text-xs text-[#1656a6] hover:text-[#124587] flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading student records...</p>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No students enrolled yet.{" "}
              <Link to="/students/new" className="text-[#1656a6] underline font-medium">
                Add first admission
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Balance</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </td>
                      <td className="py-3 text-slate-600">{s.courseTitle}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.feePlan?.planType === "EMI"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {s.feePlan?.planType || "LUMPSUM"}
                        </span>
                      </td>
                      <td className="py-3">
                        {s.feePlan?.balanceAmount > 0 ? (
                          <span className="text-amber-600 font-bold">
                            ₹{s.feePlan.balanceAmount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/students/${s.id}`}
                          className="inline-flex p-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-600 hover:text-[#F7F0E8] transition"
                          title="View Ledger"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Card */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-5">Common accounting & admission tasks</p>

            <div className="space-y-3">
              <Link
                to="/students/new"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition group"
              >
                <div className="p-2 rounded-lg bg-blue-100/70 text-[#1656a6] group-hover:bg-[#1656a6] group-hover:text-[#F7F0E8] transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Enroll Student</h4>
                  <p className="text-[11px] text-slate-500">Generate GST / Non-GST fees</p>
                </div>
              </Link>

              <Link
                to="/invoices"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition group"
              >
                <div className="p-2 rounded-lg bg-sky-100/70 text-sky-700 group-hover:bg-sky-600 group-hover:text-[#F7F0E8] transition">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Browse Invoices</h4>
                  <p className="text-[11px] text-slate-500">View or download bills</p>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  to="/reports"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 transition group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-[#F7F0E8] transition">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Financial P&L</h4>
                    <p className="text-[11px] text-slate-500">Revenue vs expenses & salaries</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
