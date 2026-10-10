import React, { useEffect, useState } from "react";
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
import api from "../api/client";

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<"ALL" | "LUMPSUM" | "EMI">("ALL");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.includes(searchTerm);

    const matchesPlan =
      planFilter === "ALL" || student.feePlan?.planType === planFilter;

    return matchesSearch && matchesPlan;
  });

  const totalOutstanding = students.reduce(
    (acc, curr) => acc + (curr.feePlan?.balanceAmount || 0),
    0
  );
  const totalPaid = students.reduce(
    (acc, curr) => acc + (curr.feePlan?.paidAmount || 0),
    0
  );
  const emiCount = students.filter((s) => s.feePlan?.planType === "EMI").length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Directory of enrolled students, fee plans, and installment records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/students/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{students.length}</p>
          <p className="text-xs text-slate-500 mt-1">{emiCount} on Monthly EMI Plan</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fees Collected</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{totalPaid.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all verified receipts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Outstanding Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            ₹{totalOutstanding.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pending student installments</p>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(["ALL", "LUMPSUM", "EMI"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPlanFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  planFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter === "ALL" ? "All Plans" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading enrolled students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Plan & Type</th>
                  <th className="px-6 py-4">Total Fee</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((student) => {
                  const plan = student.feePlan;
                  const isEmi = plan?.planType === "EMI";
                  const isPaidOff = (plan?.balanceAmount || 0) === 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.email}</div>
                        <div className="text-[11px] text-slate-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-300">
                          {student.courseTitle || "Course #" + student.courseId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isEmi
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {plan?.planType || "N/A"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              plan?.invoiceType === "GST"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {plan?.invoiceType || "NON_GST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        ₹{(plan?.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">
                        ₹{(plan?.paidAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {isPaidOff ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid Off
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            ₹{(plan?.balanceAmount || 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/students/${student.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition"
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
