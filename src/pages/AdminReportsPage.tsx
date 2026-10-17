/** @format */

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  CreditCard,
  IndianRupee,
  Users,
  Calendar,
  AlertCircle,
  Edit3,
  Search,
  Printer,
  FileText,
  Building,
  Clock,
  Calculator,
  UserPlus,
} from "lucide-react";
import api from "../api/client";
import logoImg from "../assets/interview logo.png";

export const AdminReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all">(
    "month",
  );
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "SUMMARY" | "EXPENSES" | "SALARIES"
  >("SUMMARY");
  const [salarySubTab, setSalarySubTab] = useState<
    "EMPLOYEES" | "PAYROLL_HISTORY" | "APPRAISALS"
  >("EMPLOYEES");

  // Employees State
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Record Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "RENT",
    amount: "",
    notes: "",
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // Add / Edit Employee Modal State
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(
    null,
  );
  const [employeeForm, setEmployeeForm] = useState({
    empCode: "",
    name: "",
    email: "",
    phone: "",
    role: "Trainer",
    department: "Academics",
    joiningDate: new Date().toISOString().split("T")[0],
    baseSalary: "",
    appraisalDate: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    notes: "",
  });
  const [employeeSubmitting, setEmployeeSubmitting] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // Record Salary Modal State
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: 0,
    employeeName: "",
    employeeEmail: "",
    role: "Trainer",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: 0,
    lopDays: 0,
    lopDeduction: 0,
    amount: 0,
    paymentMethod: "NETBANKING",
    reference: "",
    notes: "",
  });
  const [salarySubmitting, setSalarySubmitting] = useState(false);

  // Payslip Modal State
  const [activePayslip, setActivePayslip] = useState<any | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/reports?filter=${filter}`);
      setReport(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const res = await api.get("/admin/employees");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setExpenseSubmitting(true);
      await api.post("/admin/expenses", {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      });
      setShowExpenseModal(false);
      setExpenseForm({ title: "", category: "RENT", amount: "", notes: "" });
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record expense");
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // Open modal to Add new Employee
  const handleOpenAddEmployee = () => {
    setEditingEmployeeId(null);
    setEmployeeError(null);
    setEmployeeForm({
      empCode: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
      name: "",
      email: "",
      phone: "",
      role: "Trainer",
      department: "Academics",
      joiningDate: new Date().toISOString().split("T")[0],
      baseSalary: "",
      appraisalDate: "",
      status: "ACTIVE",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      notes: "",
    });
    setShowEmployeeModal(true);
  };

  // Open modal to Edit existing Employee
  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmployeeId(emp.id);
    setEmployeeError(null);
    setEmployeeForm({
      empCode: emp.empCode || "",
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      role: emp.role || "Trainer",
      department: emp.department || "Academics",
      joiningDate: emp.joiningDate || "",
      baseSalary: String(emp.baseSalary || 0),
      appraisalDate: emp.appraisalDate || "",
      status: emp.status || "ACTIVE",
      bankName: emp.bankName || "",
      accountNumber: emp.accountNumber || "",
      ifscCode: emp.ifscCode || "",
      notes: emp.notes || "",
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmployeeError(null);
    try {
      setEmployeeSubmitting(true);
      const payload = {
        ...employeeForm,
        baseSalary: Number(employeeForm.baseSalary) || 0,
      };

      if (editingEmployeeId) {
        await api.put(`/admin/employees/${editingEmployeeId}`, payload);
      } else {
        await api.post("/admin/employees", payload);
      }

      setShowEmployeeModal(false);
      fetchEmployees();
    } catch (err: any) {
      setEmployeeError(
        err.response?.data?.message || "Failed to save employee data",
      );
    } finally {
      setEmployeeSubmitting(false);
    }
  };

  // Open Pay Salary Modal preselected with an Employee
  const handleOpenPaySalary = (emp?: any) => {
    if (emp) {
      const base = Number(emp.baseSalary) || 0;
      setSalaryForm({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email || "",
        role: emp.role,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: base,
        lopDays: 0,
        lopDeduction: 0,
        amount: base,
        paymentMethod: "NETBANKING",
        reference: "",
        notes: "",
      });
    } else {
      setSalaryForm({
        employeeId: 0,
        employeeName: "",
        employeeEmail: "",
        role: "Trainer",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: 0,
        lopDays: 0,
        lopDeduction: 0,
        amount: 0,
        paymentMethod: "NETBANKING",
        reference: "",
        notes: "",
      });
    }
    setShowSalaryModal(true);
  };

  // When user selects an employee in Pay Salary modal
  const handleSelectEmployeeForSalary = (empId: number) => {
    if (!empId) {
      setSalaryForm((prev) => ({
        ...prev,
        employeeId: 0,
        employeeName: "",
        employeeEmail: "",
        role: "Trainer",
        baseSalary: 0,
        lopDays: 0,
        lopDeduction: 0,
        amount: 0,
      }));
      return;
    }

    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      const base = Number(emp.baseSalary) || 0;
      setSalaryForm((prev) => ({
        ...prev,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email || "",
        role: emp.role,
        baseSalary: base,
        lopDays: 0,
        lopDeduction: 0,
        amount: base,
      }));
    }
  };

  // Recalculate net salary when Base, LOP Days, or LOP Deduction changes
  const updateSalaryCalculation = (
    newBase: number,
    newLopDays: number,
    newLopDeduction: number,
    autoCalcDeduction: boolean = false,
  ) => {
    let finalDeduction = newLopDeduction;
    if (autoCalcDeduction && newBase > 0 && newLopDays > 0) {
      // Standard 30 days basis calculation as suggestion
      finalDeduction = Math.round((newBase / 30) * newLopDays * 100) / 100;
    }
    const finalAmount = Math.max(
      0,
      Math.round((newBase - finalDeduction) * 100) / 100,
    );

    setSalaryForm((prev) => ({
      ...prev,
      baseSalary: newBase,
      lopDays: newLopDays,
      lopDeduction: finalDeduction,
      amount: finalAmount,
    }));
  };

  const handleRecordSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalarySubmitting(true);
      await api.post("/admin/salaries", {
        ...salaryForm,
        employeeId: salaryForm.employeeId || undefined,
        amount: Number(salaryForm.amount),
        baseSalary: Number(salaryForm.baseSalary),
        lopDays: Number(salaryForm.lopDays),
        lopDeduction: Number(salaryForm.lopDeduction),
      });
      setShowSalaryModal(false);
      fetchReports();
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record salary payment");
    } finally {
      setSalarySubmitting(false);
    }
  };

  // Helper for appraisal date status
  const getAppraisalStatus = (dateStr?: string) => {
    if (!dateStr)
      return { label: "Not Scheduled", color: "text-slate-400 bg-slate-100" };
    const appraisal = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (appraisal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        color: "text-rose-700 bg-rose-50 border border-rose-200",
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Due in ${diffDays}d`,
        color: "text-amber-700 bg-amber-50 border border-amber-200",
      };
    }
    return {
      label: new Date(dateStr).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      color: "text-slate-700 bg-slate-100",
    };
  };

  const summary = report?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    totalGeneralExpenses: 0,
    totalSalariesPaid: 0,
    netProfit: 0,
    totalTaxCollected: 0,
  };

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.empCode.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      (e.department && e.department.toLowerCase().includes(q))
    );
  });

  const totalMonthlyPayrollLiability = employees
    .filter((e) => e.status === "ACTIVE")
    .reduce((acc, curr) => acc + (curr.baseSalary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Financial & P&L Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time Profit & Loss statement, fee revenues, overheads, and
            staff salaries
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={handleOpenAddEmployee}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#1656a6]" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => handleOpenPaySalary()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Staff Salary</span>
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 p-2 rounded-2xl shadow-2xs">
        <span className="text-xs font-semibold text-slate-500 px-3">
          Reporting Period:
        </span>
        <div className="flex gap-1">
          {(
            [
              { id: "day", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "all", label: "All Time" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filter === item.id
                  ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Revenue (Inflow)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Student fees collected</p>
        </div>

        {/* Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Outflow (Expenses)
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ₹{summary.totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Overheads (₹{summary.totalGeneralExpenses.toLocaleString()}) +
            Salaries (₹{summary.totalSalariesPaid.toLocaleString()})
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Net Profit
            </span>
            <IndianRupee
              className={`w-4 h-4 ${summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            />
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              summary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            ₹{summary.netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {summary.netProfit >= 0
              ? "Net surplus after costs"
              : "Operating deficit"}
          </p>
        </div>

        {/* Staff Payroll Liability */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Monthly Payroll Liability
            </span>
            <Users className="w-4 h-4 text-[#1656a6]" />
          </div>
          <p className="text-2xl font-bold text-[#1656a6] mt-2">
            ₹{totalMonthlyPayrollLiability.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {employees.filter((e) => e.status === "ACTIVE").length} active
            registered staff
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("SUMMARY")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "SUMMARY"
              ? "text-[#1656a6] border-b-2 border-[#1656a6]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          P&L Summary Breakdown
        </button>
        <button
          onClick={() => setActiveTab("EXPENSES")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "EXPENSES"
              ? "text-[#1656a6] border-b-2 border-[#1656a6]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          General Expenses ({report?.expenses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("SALARIES")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "SALARIES"
              ? "text-[#1656a6] border-b-2 border-[#1656a6]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Staff Payroll & Employees ({employees.length})
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading financial data...
        </div>
      ) : activeTab === "SUMMARY" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cash Inflow Statement
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Fees Collected</span>
                <span className="font-bold text-emerald-600">
                  ₹{summary.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">
                  Number of Payments Received
                </span>
                <span className="font-semibold text-slate-900">
                  {report?.invoices?.length || 0}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Average Transaction</span>
                <span className="font-semibold text-slate-900">
                  ₹
                  {report?.invoices?.length
                    ? Math.round(
                        summary.totalRevenue / report.invoices.length,
                      ).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cash Outflow Statement
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">General Overheads & Rent</span>
                <span className="font-bold text-rose-600">
                  ₹{summary.totalGeneralExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">
                  Trainer & Employee Salaries
                </span>
                <span className="font-bold text-rose-600">
                  ₹{summary.totalSalariesPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-900">Total Outflow</span>
                <span className="font-bold text-rose-600">
                  ₹{summary.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "EXPENSES" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.expenses && report.expenses.length > 0 ? (
                report.expenses.map((exp: any) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-xs text-slate-400">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(exp.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      ₹{Number(exp.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 text-xs"
                  >
                    No expenses recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* SALARIES & EMPLOYEES TAB CONTENT */
        <div className="space-y-4">
          {/* Sub-navigation inside Salaries */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex gap-2">
              <button
                onClick={() => setSalarySubTab("EMPLOYEES")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  salarySubTab === "EMPLOYEES"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Employee Directory ({employees.length})</span>
              </button>

              <button
                onClick={() => setSalarySubTab("PAYROLL_HISTORY")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  salarySubTab === "PAYROLL_HISTORY"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Disbursements ({report?.salaries?.length || 0})</span>
              </button>

              <button
                onClick={() => setSalarySubTab("APPRAISALS")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  salarySubTab === "APPRAISALS"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Appraisal Tracker</span>
              </button>
            </div>

            {salarySubTab === "EMPLOYEES" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff, code, role..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#1656a6] w-48 sm:w-60"
                  />
                </div>
                <button
                  onClick={handleOpenAddEmployee}
                  className="px-3 py-1.5 bg-[#1656a6] text-[#F7F0E8] rounded-xl text-xs font-semibold hover:bg-[#124587] transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff
                </button>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: EMPLOYEE DIRECTORY */}
          {salarySubTab === "EMPLOYEES" && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Code & Staff</th>
                    <th className="px-6 py-3.5">Role & Dept</th>
                    <th className="px-6 py-3.5">Base Salary</th>
                    <th className="px-6 py-3.5">Next Appraisal</th>
                    <th className="px-6 py-3.5">Bank Info</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => {
                      const appStatus = getAppraisalStatus(emp.appraisalDate);
                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1656a6] border border-blue-200/60">
                                {emp.empCode}
                              </span>
                              <div className="font-bold text-slate-900">
                                {emp.name}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {emp.email || emp.phone || "No contact info"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-xs font-semibold text-slate-800">
                              {emp.role}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {emp.department || "General"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">
                              ₹{Number(emp.baseSalary || 0).toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Monthly Gross
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${appStatus.color}`}
                            >
                              {appStatus.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-600">
                            {emp.bankName ? (
                              <div>
                                <div className="font-semibold text-slate-800">
                                  {emp.bankName}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400">
                                  {emp.accountNumber
                                    ? `A/c: ${emp.accountNumber}`
                                    : ""}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                Not added
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                emp.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {emp.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPaySalary(emp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer"
                                title="Process monthly salary"
                              >
                                <CreditCard className="w-3 h-3" />
                                Pay
                              </button>
                              <button
                                onClick={() => handleOpenEditEmployee(emp)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                title="Edit employee profile"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        {employeesLoading
                          ? "Loading employees..."
                          : "No employees found. Click '+ Add Staff' to register your first employee."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-VIEW 2: SALARY DISBURSEMENT HISTORY */}
          {salarySubTab === "PAYROLL_HISTORY" && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Staff & Code</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Month / Year</th>
                    <th className="px-6 py-3.5">Base Salary</th>
                    <th className="px-6 py-3.5">LOP Deduction</th>
                    <th className="px-6 py-3.5 text-right">Net Paid</th>
                    <th className="px-6 py-3.5">Method & Ref</th>
                    <th className="px-6 py-3.5 text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.salaries && report.salaries.length > 0 ? (
                    report.salaries.map((sal: any) => (
                      <tr
                        key={sal.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {sal.employeeCode && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1656a6]">
                                {sal.employeeCode}
                              </span>
                            )}
                            <span className="font-semibold text-slate-900">
                              {sal.employeeName}
                            </span>
                          </div>
                          {sal.employeeEmail && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {sal.employeeEmail}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          {sal.role}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          Month {sal.month}/{sal.year}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          ₹
                          {Number(
                            sal.baseSalary || sal.amount,
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          {Number(sal.lopDays) > 0 ? (
                            <div>
                              <span className="font-bold text-rose-600">
                                -₹
                                {Number(sal.lopDeduction || 0).toLocaleString()}
                              </span>
                              <span className="block text-[11px] text-slate-400 font-mono">
                                ({sal.lopDays} LOP day
                                {sal.lopDays > 1 ? "s" : ""})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">
                              0 days
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          ₹{Number(sal.amount).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {sal.paymentMethod}
                          </span>
                          {sal.reference && (
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {sal.reference}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setActivePayslip(sal)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                            title="Generate and print payslip"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#1656a6]" />
                            Slip
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        No payroll disbursements recorded in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUB-VIEW 3: APPRAISAL TRACKER */}
          {salarySubTab === "APPRAISALS" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Appraisals in 30 Days
                    </span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-900 mt-2">
                    {
                      employees.filter((e) => {
                        if (!e.appraisalDate) return false;
                        const diff = Math.ceil(
                          (new Date(e.appraisalDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        return diff >= 0 && diff <= 30;
                      }).length
                    }
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Scheduled for performance & increment review
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                      Overdue Appraisals
                    </span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-bold text-rose-900 mt-2">
                    {
                      employees.filter((e) => {
                        if (!e.appraisalDate) return false;
                        const diff = Math.ceil(
                          (new Date(e.appraisalDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        return diff < 0;
                      }).length
                    }
                  </p>
                  <p className="text-xs text-rose-700 mt-1">
                    Pending past appraisal due date
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1656a6]">
                      Total Staff Tracked
                    </span>
                    <Users className="w-4 h-4 text-[#1656a6]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1656a6] mt-2">
                    {employees.filter((e) => !!e.appraisalDate).length} /{" "}
                    {employees.length}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Employees with appraisal schedules
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Staff Name & Code</th>
                      <th className="px-6 py-3.5">Designation</th>
                      <th className="px-6 py-3.5">Joining Date</th>
                      <th className="px-6 py-3.5">Current Salary</th>
                      <th className="px-6 py-3.5">Appraisal Due Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees
                      .filter((e) => !!e.appraisalDate)
                      .sort(
                        (a, b) =>
                          new Date(a.appraisalDate).getTime() -
                          new Date(b.appraisalDate).getTime(),
                      )
                      .map((emp) => {
                        const appStatus = getAppraisalStatus(emp.appraisalDate);
                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">
                                {emp.name}
                              </div>
                              <div className="text-xs font-mono text-[#1656a6]">
                                {emp.empCode}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-700">
                              {emp.role}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                              {emp.joiningDate
                                ? new Date(emp.joiningDate).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                              ₹{Number(emp.baseSalary || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-xs font-medium">
                              {new Date(emp.appraisalDate).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${appStatus.color}`}
                              >
                                {appStatus.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenEditEmployee(emp)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-[#1656a6] hover:bg-blue-100 text-xs font-bold border border-blue-200 transition cursor-pointer"
                              >
                                Review & Update
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {employees.filter((e) => !!e.appraisalDate).length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-slate-400 text-xs"
                        >
                          No employees have scheduled appraisal dates yet. Edit
                          an employee to set their next appraisal date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Record Office Expense
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Log office operational expenditures for P&L tracking
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Rent for Oct, High-Speed Internet"
                  value={expenseForm.title}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value="RENT">Rent</option>
                    <option value="UTILITIES">Utilities & Electricity</option>
                    <option value="MARKETING">Marketing & Ads</option>
                    <option value="EQUIPMENT">Equipment & Systems</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other Operational Cost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 15000"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional context or invoice ref"
                  value={expenseForm.notes}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {expenseSubmitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900 my-8">
            <button
              onClick={() => setShowEmployeeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {editingEmployeeId
                ? "Edit Staff Information"
                : "Register New Employee"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Store employee salary, appraisal dates, bank account, and role
              specifications
            </p>

            {employeeError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{employeeError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEmployee} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee ID / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-001"
                    value={employeeForm.empCode}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        empCode: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={employeeForm.name}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@izeon.com"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={employeeForm.phone}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Trainer, React Mentor"
                    value={employeeForm.role}
                    onChange={(e) =>
                      setEmployeeForm({ ...employeeForm, role: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Academics, Operations, Sales"
                    value={employeeForm.department}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              {/* Salary & Appraisal Section */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1656a6] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Remuneration &
                  Appraisal Configuration
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Base Salary (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 35000"
                      value={employeeForm.baseSalary}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          baseSalary: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Appraisal Date
                    </label>
                    <input
                      type="date"
                      value={employeeForm.appraisalDate}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          appraisalDate: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employment Status
                    </label>
                    <select
                      value={employeeForm.status}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          status: e.target.value as "ACTIVE" | "INACTIVE",
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1656a6]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" /> Bank
                  Transfer Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI"
                      value={employeeForm.bankName}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          bankName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 501004561234"
                      value={employeeForm.accountNumber}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={employeeForm.ifscCode}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          ifscCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internal Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Probation period until March, key skills: React, Node.js"
                  value={employeeForm.notes}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={employeeSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {employeeSubmitting
                    ? "Saving..."
                    : editingEmployeeId
                      ? "Update Employee"
                      : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SALARY & LOP MODAL */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900 my-8">
            <button
              onClick={() => setShowSalaryModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Record Salary Payroll
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Disburse monthly remuneration with automated or manual LOP (Loss
              of Pay) deductions
            </p>

            <form onSubmit={handleRecordSalary} className="space-y-4 mt-5">
              {/* Select Employee Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Staff Member
                </label>
                <select
                  value={salaryForm.employeeId}
                  onChange={(e) =>
                    handleSelectEmployeeForSalary(Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                >
                  <option value={0}>-- Manual / Guest Trainer Entry --</option>
                  {employees
                    .filter((e) => e.status === "ACTIVE")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.empCode}) - {emp.role} [₹
                        {Number(emp.baseSalary).toLocaleString()}/mo]
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Staff Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={salaryForm.employeeName}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        employeeName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Trainer"
                    value={salaryForm.role}
                    onChange={(e) =>
                      setSalaryForm({ ...salaryForm, role: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Salary Month
                  </label>
                  <select
                    value={salaryForm.month}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        month: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name} ({idx + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    value={salaryForm.year}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        year: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              {/* Remuneration & LOP Loss of Pay Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-[#1656a6]" /> Salary
                    Breakdown & Loss of Pay (LOP)
                  </span>
                  {salaryForm.baseSalary > 0 && salaryForm.lopDays > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateSalaryCalculation(
                          salaryForm.baseSalary,
                          salaryForm.lopDays,
                          salaryForm.lopDeduction,
                          true,
                        )
                      }
                      className="text-[11px] font-bold text-[#1656a6] hover:underline cursor-pointer"
                    >
                      Auto-Calc (30-day rate)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Monthly Base (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={salaryForm.baseSalary}
                      onChange={(e) =>
                        updateSalaryCalculation(
                          Number(e.target.value) || 0,
                          salaryForm.lopDays,
                          salaryForm.lopDeduction,
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      LOP Days
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={salaryForm.lopDays}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 0;
                        updateSalaryCalculation(
                          salaryForm.baseSalary,
                          days,
                          salaryForm.lopDeduction,
                          true,
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      LOP Deduction (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={salaryForm.lopDeduction}
                      onChange={(e) => {
                        const ded = Number(e.target.value) || 0;
                        updateSalaryCalculation(
                          salaryForm.baseSalary,
                          salaryForm.lopDays,
                          ded,
                          false,
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-rose-600 font-mono font-bold text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>

                {/* Net Payout Summary Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Net Amount Payable:
                    </span>
                    <div className="text-xl font-extrabold text-emerald-600">
                      ₹{Number(salaryForm.amount).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    ₹{Number(salaryForm.baseSalary).toLocaleString()} Base - ₹
                    {Number(salaryForm.lopDeduction).toLocaleString()} LOP
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Disbursement Method
                  </label>
                  <select
                    value={salaryForm.paymentMethod}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value="NETBANKING">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Txn Reference / UTR #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={salaryForm.reference}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        reference: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. October monthly stipend, 2 days personal leave"
                  value={salaryForm.notes}
                  onChange={(e) =>
                    setSalaryForm({ ...salaryForm, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={salarySubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {salarySubmitting
                    ? "Processing..."
                    : "Disburse & Record Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PAYSLIP MODAL */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-8 relative text-slate-900 my-6">
            <button
              onClick={() => setActivePayslip(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Payslip Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-xs border border-slate-200 flex items-center justify-center">
                  <img
                    src={logoImg}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                    IZEON INNOVATIVE
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Salary Voucher & Payment Acknowledgement
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-[#1656a6] border border-blue-200">
                  SLIP-{activePayslip.year}-
                  {String(activePayslip.month).padStart(2, "0")}-
                  {activePayslip.id}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Issued:{" "}
                  {new Date(activePayslip.paymentDate).toLocaleDateString(
                    "en-IN",
                  )}
                </p>
              </div>
            </div>

            {/* Employee Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">
                  Employee Name:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {activePayslip.employeeName}
                </p>
                {activePayslip.employeeCode && (
                  <p className="text-slate-500 font-mono mt-0.5">
                    ID: {activePayslip.employeeCode}
                  </p>
                )}
              </div>
              <div>
                <span className="text-slate-400 font-medium">Designation:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {activePayslip.role}
                </p>
                {activePayslip.department && (
                  <p className="text-slate-500 mt-0.5">
                    Dept: {activePayslip.department}
                  </p>
                )}
              </div>
            </div>

            {/* Pay Period & Bank Details */}
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Payroll Period:</span>
                <p className="font-semibold text-slate-800">
                  Month {activePayslip.month} / {activePayslip.year}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Payment Mode & Ref:</span>
                <p className="font-semibold text-slate-800 font-mono">
                  {activePayslip.paymentMethod}{" "}
                  {activePayslip.reference
                    ? `(${activePayslip.reference})`
                    : ""}
                </p>
              </div>
            </div>

            {/* Remuneration Breakdown Table */}
            <div className="py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">
                      Monthly Gross Salary
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹
                      {Number(
                        activePayslip.baseSalary || activePayslip.amount,
                      ).toLocaleString()}
                    </td>
                  </tr>
                  {Number(activePayslip.lopDays) > 0 && (
                    <tr>
                      <td className="py-2.5 text-rose-600">
                        Loss of Pay (LOP Deduction - {activePayslip.lopDays}{" "}
                        days)
                      </td>
                      <td className="py-2.5 text-right font-bold text-rose-600">
                        -₹
                        {Number(
                          activePayslip.lopDeduction || 0,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                    <td className="py-3 px-2 text-sm text-slate-900">
                      Net Remuneration Disbursed
                    </td>
                    <td className="py-3 px-2 text-right text-base text-emerald-700">
                      ₹{Number(activePayslip.amount).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer & Print Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-[11px] text-slate-400">
                Computer generated salary acknowledgement
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
