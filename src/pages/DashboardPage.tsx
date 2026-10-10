import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Receipt,
  IndianRupee,
  CalendarClock,
  ArrowUpRight,
  UserPlus,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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

  const totalCollected = invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const totalBalance = students.reduce(
    (acc, curr) => acc + (curr.feePlan?.balanceAmount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900/80 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              IZEON Books Management
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Welcome back, {user?.username}!
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track student admissions, lumpsum & EMI fees, GST invoices, and financial reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/students/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Students</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{students.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active admissions</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {invoices.length} invoices generated
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Balances</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-3">
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Upcoming EMI dues</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Profit (Monthly)</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-sky-400 mt-3">
            ₹{(report?.summary?.netProfit ?? totalCollected).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">After office & staff costs</span>
        </div>
      </div>

      {/* Recent Admissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students Table */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Enrolled Students</h3>
              <p className="text-xs text-slate-400">Latest admission records</p>
            </div>
            <Link
              to="/students"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 py-6 text-center">Loading student records...</p>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No students enrolled yet.{" "}
              <Link to="/students/new" className="text-indigo-400 underline">
                Add first admission
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Balance</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3">
                        <p className="font-semibold text-white">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.email}</p>
                      </td>
                      <td className="py-3 text-slate-300">{s.courseTitle}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.feePlan?.planType === "EMI"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {s.feePlan?.planType || "LUMPSUM"}
                        </span>
                      </td>
                      <td className="py-3">
                        {s.feePlan?.balanceAmount > 0 ? (
                          <span className="text-amber-400 font-semibold">
                            ₹{s.feePlan.balanceAmount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/students/${s.id}`}
                          className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-5">Common accounting & admission tasks</p>

            <div className="space-y-3">
              <Link
                to="/students/new"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/50 hover:bg-indigo-600/10 border border-slate-700/50 hover:border-indigo-500/30 transition group"
              >
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Enroll Student</h4>
                  <p className="text-[11px] text-slate-400">Generate GST / Non-GST fees</p>
                </div>
              </Link>

              <Link
                to="/invoices"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/50 hover:bg-sky-600/10 border border-slate-700/50 hover:border-sky-500/30 transition group"
              >
                <div className="p-2 rounded-lg bg-sky-600/20 text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Browse Invoices</h4>
                  <p className="text-[11px] text-slate-400">View or download bills</p>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  to="/reports"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/50 hover:bg-emerald-600/10 border border-slate-700/50 hover:border-emerald-500/30 transition group"
                >
                  <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Financial P&L</h4>
                    <p className="text-[11px] text-slate-400">Revenue vs expenses & salaries</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>IZEON Books • Enterprise Accounting</span>
          </div>
        </div>
      </div>
    </div>
  );
};
