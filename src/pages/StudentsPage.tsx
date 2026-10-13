import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  UserPlus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import api, { invalidateApiCache } from "../api/client";

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<"ALL" | "LUMPSUM" | "EMI">("ALL");

  const fetchStudents = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) {
        invalidateApiCache("/students");
      }
      const res = await api.get("/students", { bypassCache: forceRefresh } as any);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Memoize search/filter operations to avoid lag on re-renders
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !term ||
        student.name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.phone?.includes(term);

      const matchesPlan =
        planFilter === "ALL" || student.feePlan?.planType === planFilter;

      return matchesSearch && matchesPlan;
    });
  }, [students, searchTerm, planFilter]);

  // Memoize financial KPI calculations
  const { totalOutstanding, totalPaid, emiCount } = useMemo(() => {
    let outstanding = 0;
    let paid = 0;
    let emi = 0;

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      if (s.feePlan?.balanceAmount) outstanding += s.feePlan.balanceAmount;
      if (s.feePlan?.paidAmount) paid += s.feePlan.paidAmount;
      if (s.feePlan?.planType === "EMI") emi++;
    }

    return { totalOutstanding: outstanding, totalPaid: paid, emiCount: emi };
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Admissions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage course registrations, payment terms, and fee ledgers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStudents(true)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/students/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] font-semibold text-sm shadow-sm transition hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards (Clean White Surfaces) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1656a6]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{students.length}</p>
          <p className="text-xs text-slate-400 mt-1">{emiCount} on Monthly EMI Plan</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fees Collected</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{totalPaid.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Across all verified receipts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Outstanding Balance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            ₹{totalOutstanding.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Pending student installments</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1656a6] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            {(["ALL", "LUMPSUM", "EMI"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPlanFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  planFilter === filter
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {filter === "ALL" ? "All Plans" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table (Clean White Card) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading enrolled students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Plan & Type</th>
                  <th className="px-6 py-3.5">Total Fee</th>
                  <th className="px-6 py-3.5">Paid</th>
                  <th className="px-6 py-3.5">Balance</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const plan = student.feePlan;
                  const isEmi = plan?.planType === "EMI";
                  const isPaidOff = (plan?.balanceAmount || 0) === 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.email}</div>
                        <div className="text-[11px] text-slate-400">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-700">
                          {student.courseTitle || "Course #" + student.courseId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isEmi
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {plan?.planType || "N/A"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              plan?.invoiceType === "GST"
                                ? "bg-blue-50 text-[#1656a6] border border-blue-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {plan?.invoiceType || "NON_GST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ₹{(plan?.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-semibold">
                        ₹{(plan?.paidAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {isPaidOff ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid Off
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">
                            ₹{(plan?.balanceAmount || 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/students/${student.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition"
                        >
                          <span>Ledger</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentsPage;
