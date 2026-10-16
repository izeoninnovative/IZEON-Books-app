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
  Edit3,
  X,
  AlertCircle,
} from "lucide-react";
import api, { invalidateApiCache } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const StudentsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<"ALL" | "LUMPSUM" | "EMI">("ALL");

  // Admin Quick-Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    courseId: 0,
    status: "ACTIVE" as "ACTIVE" | "COMPLETED" | "DROPPED",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const openEditModal = async (student: any) => {
    let formattedDob = student.dob || "";
    if (formattedDob.includes("T")) {
      formattedDob = formattedDob.split("T")[0];
    }
    setEditingStudent(student);
    setEditForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      dob: formattedDob,
      address: student.address || "",
      courseId: student.courseId,
      status: student.status || "ACTIVE",
    });
    setEditError(null);

    if (courses.length === 0) {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setEditLoading(true);
      setEditError(null);
      await api.put(`/students/${editingStudent.id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        dob: editForm.dob,
        address: editForm.address,
        courseId: Number(editForm.courseId),
        status: editForm.status,
      });

      setEditingStudent(null);
      fetchStudents(true);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update student details");
    } finally {
      setEditLoading(false);
    }
  };


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
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <button
                              onClick={() => openEditModal(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition cursor-pointer"
                              title="Edit Student Information (Admin Only)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                          <Link
                            to={`/students/${student.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition"
                          >
                            <span>Ledger</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Student Modal (Admin Only) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900 my-8">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Edit Student Information
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1656a6] border border-blue-200">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Modify personal records, enrollment status, or enrolled course
            </p>

            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStudent} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enrolled Course
                  </label>
                  <select
                    value={editForm.courseId}
                    onChange={(e) => setEditForm({ ...editForm, courseId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code})
                      </option>
                    ))}
                    {courses.length === 0 && (
                      <option value={editingStudent.courseId}>{editingStudent.courseTitle || "Current Course"}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enrollment Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value as "ACTIVE" | "COMPLETED" | "DROPPED" })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value="ACTIVE">ACTIVE (In Progress)</option>
                    <option value="COMPLETED">COMPLETED (Graduated)</option>
                    <option value="DROPPED">DROPPED (Discontinued)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street address, city, state, postal code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {editLoading ? "Updating..." : "Save Student Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentsPage;

