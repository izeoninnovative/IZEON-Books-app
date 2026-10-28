/** @format */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  Printer,
  FileText,
  Clock,
  Calculator,
  ExternalLink,
  Award,
  Sparkles,
  History,
  EllipsisVertical,
} from "lucide-react";
import api from "../api/client";
import logoImg from "../assets/interview logo.png";

export const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
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
    lateDays: 0,
    lateDeduction: 0,
    amount: 0,
    paymentMethod: "NETBANKING",
    reference: "",
    notes: "",
  });
  const [salarySubmitting, setSalarySubmitting] = useState(false);

  const [particularModal, setParticularModal] = useState(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particularModal === null) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !actionMenuRef.current?.contains(event.target)
      ) {
        setParticularModal(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [particularModal]);

  // Payslip Modal State
  const [activePayslip, setActivePayslip] = useState<any | null>(null);

  // Appraisal Modal State
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [selectedAppraisalEmployee, setSelectedAppraisalEmployee] = useState<
    any | null
  >(null);
  const [appraisalHistory, setAppraisalHistory] = useState<any[]>([]);
  const [loadingAppraisalHistory, setLoadingAppraisalHistory] = useState(false);
  const [appraisalForm, setAppraisalForm] = useState({
    newSalary: 0,
    appraisalDate: new Date().toISOString().split("T")[0],
    nextAppraisalDate: "",
    rating: "EXCELLENT",
    notes: "",
  });
  const [appraisalSubmitting, setAppraisalSubmitting] = useState(false);
  const [appraisalError, setAppraisalError] = useState<string | null>(null);
  const [appraisalFilter, setAppraisalFilter] = useState<
    "ALL" | "DUE_30" | "OVERDUE" | "APPRAISED"
  >("ALL");

  const handleOpenAppraisal = async (emp: any) => {
    setSelectedAppraisalEmployee(emp);
    setAppraisalError(null);

    // Default next appraisal date (+1 year)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextDateStr = nextYear.toISOString().split("T")[0];

    setAppraisalForm({
      newSalary: Number(emp.baseSalary) || 0,
      appraisalDate: new Date().toISOString().split("T")[0],
      nextAppraisalDate: emp.appraisalDate || nextDateStr,
      rating: "EXCELLENT",
      notes: "",
    });
    setShowAppraisalModal(true);

    try {
      setLoadingAppraisalHistory(true);
      const res = await api.get(`/admin/employees/${emp.id}/appraisals`);
      setAppraisalHistory(res.data.data || []);
    } catch (err) {
      console.error("Failed to load appraisal history:", err);
      setAppraisalHistory([]);
    } finally {
      setLoadingAppraisalHistory(false);
    }
  };

  const handleSaveAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppraisalEmployee) return;
    setAppraisalError(null);
    try {
      setAppraisalSubmitting(true);
      await api.post(
        `/admin/employees/${selectedAppraisalEmployee.id}/appraisal`,
        {
          newSalary: Number(appraisalForm.newSalary),
          appraisalDate: appraisalForm.appraisalDate,
          nextAppraisalDate: appraisalForm.nextAppraisalDate || undefined,
          rating: appraisalForm.rating,
          notes: appraisalForm.notes,
        },
      );
      setShowAppraisalModal(false);
      fetchEmployees();
      fetchReports();
    } catch (err: any) {
      setAppraisalError(
        err.response?.data?.message || "Failed to submit appraisal",
      );
    } finally {
      setAppraisalSubmitting(false);
    }
  };

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

  // Open Pay Salary Modal preselected with an Employee
  const handleOpenPaySalary = async (emp?: any) => {
    const curMonth = new Date().getMonth() + 1;
    const curYear = new Date().getFullYear();
    if (emp) {
      const base = Number(emp.baseSalary) || 0;
      setSalaryForm({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email || "",
        role: emp.role,
        month: curMonth,
        year: curYear,
        baseSalary: base,
        lopDays: 0,
        lopDeduction: 0,
        lateDays: 0,
        lateDeduction: 0,
        amount: base,
        paymentMethod: "NETBANKING",
        reference: "",
        notes: "",
      });

      // Auto-fetch precalculated LOP & Attendance late deductions from backend
      try {
        const prepRes = await api.get(
          `/admin/employees/${emp.id}/payroll-prep?month=${curMonth}&year=${curYear}`,
        );
        if (prepRes.data.data) {
          const prep = prepRes.data.data;
          setSalaryForm((prev) => ({
            ...prev,
            baseSalary: prep.baseSalary,
            lopDays: prep.lopDays,
            lopDeduction: prep.lopDeduction,
            lateDays: prep.lateDays,
            lateDeduction: prep.lateDeduction,
            amount: prep.netPayable,
          }));
        }
      } catch (err) {
        console.error("Failed to load payroll prep:", err);
      }
    } else {
      setSalaryForm({
        employeeId: 0,
        employeeName: "",
        employeeEmail: "",
        role: "Trainer",
        month: curMonth,
        year: curYear,
        baseSalary: 0,
        lopDays: 0,
        lopDeduction: 0,
        lateDays: 0,
        lateDeduction: 0,
        amount: 0,
        paymentMethod: "NETBANKING",
        reference: "",
        notes: "",
      });
    }
    setShowSalaryModal(true);
  };

  // When user selects an employee in Pay Salary modal
  const handleSelectEmployeeForSalary = async (empId: number) => {
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
        lateDays: 0,
        lateDeduction: 0,
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
        lateDays: 0,
        lateDeduction: 0,
        amount: base,
      }));

      try {
        const prepRes = await api.get(
          `/admin/employees/${emp.id}/payroll-prep?month=${salaryForm.month}&year=${salaryForm.year}`,
        );
        if (prepRes.data.data) {
          const prep = prepRes.data.data;
          setSalaryForm((prev) => ({
            ...prev,
            baseSalary: prep.baseSalary,
            lopDays: prep.lopDays,
            lopDeduction: prep.lopDeduction,
            lateDays: prep.lateDays,
            lateDeduction: prep.lateDeduction,
            amount: prep.netPayable,
          }));
        }
      } catch (err) {
        console.error("Failed to load payroll prep:", err);
      }
    }
  };

  // Recalculate net salary when Base, LOP Days/Deduction, or Late Days/Deduction changes
  const updateSalaryCalculation = (
    newBase: number,
    newLopDays: number,
    newLopDeduction: number,
    newLateDays: number = salaryForm.lateDays,
    newLateDeduction: number = salaryForm.lateDeduction,
    autoCalcDeduction: boolean = false,
  ) => {
    let finalLopDeduction = newLopDeduction;
    if (autoCalcDeduction && newBase > 0 && newLopDays > 0) {
      finalLopDeduction = Math.round((newBase / 30) * newLopDays * 100) / 100;
    }
    const finalAmount = Math.max(
      0,
      Math.round((newBase - finalLopDeduction - newLateDeduction) * 100) / 100,
    );

    setSalaryForm((prev) => ({
      ...prev,
      baseSalary: newBase,
      lopDays: newLopDays,
      lopDeduction: finalLopDeduction,
      lateDays: newLateDays,
      lateDeduction: newLateDeduction,
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
        lateDays: Number(salaryForm.lateDays),
        lateDeduction: Number(salaryForm.lateDeduction),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Financial & P&L Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Real-time Profit & Loss statement, fee revenues, overheads, and
            staff salaries
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">Record Expense</span>
          </button>

          <button
            onClick={() => handleOpenPaySalary()}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="truncate">Pay Staff Salary</span>
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200/90 p-2 sm:p-2.5 rounded-2xl shadow-2xs gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-500 px-2 sm:px-3">
          Reporting Period:
        </span>
        <div className="grid grid-cols-4 sm:flex gap-1 min-w-0">
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
              className={`px-2 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition text-center cursor-pointer truncate ${
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
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm overflow-x-auto no-scrollbar whitespace-nowrap min-w-0 pb-0.5">
        <button
          onClick={() => setActiveTab("SUMMARY")}
          className={`pb-2.5 sm:pb-3 font-semibold transition relative cursor-pointer shrink-0 ${
            activeTab === "SUMMARY"
              ? "text-[#1656a6] border-b-2 border-[#1656a6]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          P&L Summary Breakdown
        </button>
        <button
          onClick={() => setActiveTab("EXPENSES")}
          className={`pb-2.5 sm:pb-3 font-semibold transition relative cursor-pointer shrink-0 ${
            activeTab === "EXPENSES"
              ? "text-[#1656a6] border-b-2 border-[#1656a6]"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          General Expenses ({report?.expenses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("SALARIES")}
          className={`pb-2.5 sm:pb-3 font-semibold transition relative cursor-pointer shrink-0 ${
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
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left text-sm min-w-[500px]">
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
        </div>
      ) : (
        /* SALARIES & EMPLOYEES TAB CONTENT */
        <div className="space-y-4">
          {/* Sub-navigation inside Salaries */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0 pb-1 sm:pb-0">
              <button
                onClick={() => setSalarySubTab("EMPLOYEES")}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  salarySubTab === "EMPLOYEES"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Employee Directory ({employees.length})</span>
              </button>

              <button
                onClick={() => setSalarySubTab("PAYROLL_HISTORY")}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  salarySubTab === "PAYROLL_HISTORY"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Disbursements ({report?.salaries?.length || 0})</span>
              </button>

              <button
                onClick={() => setSalarySubTab("APPRAISALS")}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  salarySubTab === "APPRAISALS"
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Appraisal Tracker</span>
              </button>
            </div>

            {salarySubTab === "EMPLOYEES" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff, code, role..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUB-VIEW 1: EMPLOYEE DIRECTORY */}
          {salarySubTab === "EMPLOYEES" && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Emp-Code</th>
                      <th className="px-6 py-3.5">Emp Name</th>
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
                      filteredEmployees.map((emp, index) => {
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
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {emp.email || emp.phone || "No contact info"}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">
                                {emp.name}
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

                            <td className="px-6 py-4 text-right relative">
                              <div
                                ref={actionMenuRef}
                                className="relative inline-block text-left"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  className="p-1 hover:bg-slate-100 rounded-md transition text-slate-400 hover:text-slate-600"
                                  onClick={() =>
                                    setParticularModal(
                                      particularModal === emp.id
                                        ? null
                                        : emp.id,
                                    )
                                  }
                                >
                                  <EllipsisVertical className="w-5 h-5 bg-dark" />
                                </button>
                                {particularModal === emp.id && (
                                  <div
                                    className={`absolute right-0 z-60 flex flex-col gap-1 p-1.5 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[120px] text-left ${
                                      index >= filteredEmployees.length - 2
                                        ? "bottom-7"
                                        : "top-7"
                                    }`}
                                  >
                                    <button
                                      onClick={() => {
                                        handleOpenPaySalary(emp);
                                        setParticularModal(null);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer w-full"
                                      title="Process monthly salary"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      Pay
                                    </button>

                                    <button
                                      onClick={() => {
                                        handleOpenAppraisal(emp);
                                        setParticularModal(null);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#1656a6] text-xs font-bold border border-blue-200 transition cursor-pointer w-full"
                                      title="Review or provide appraisal"
                                    >
                                      <Award className="w-3 h-3" />
                                      Appraise
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigate("/hr-management");
                                        setParticularModal(null);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-slate-600 transition cursor-pointer w-full text-xs font-medium"
                                      title="Manage in Staff & Attendance"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      Manage
                                    </button>
                                  </div>
                                )}
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
                            : "No employees found. Visit Staff & Attendance to register employees."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: SALARY DISBURSEMENT HISTORY */}
          {salarySubTab === "PAYROLL_HISTORY" && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Staff & Code</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Month / Year</th>
                      <th className="px-6 py-3.5">Base Salary</th>
                      <th className="px-6 py-3.5">LOP Deduction</th>
                      <th className="px-6 py-3.5">Late Deduction</th>
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
                                  {Number(
                                    sal.lopDeduction || 0,
                                  ).toLocaleString()}
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

                          <td className="px-6 py-4 text-xs">
                            {Number(sal.lateDays) > 0 ||
                            Number(sal.lateDeduction) > 0 ? (
                              <div>
                                <span className="font-bold text-rose-600">
                                  -₹
                                  {Number(
                                    sal.lateDeduction || 0,
                                  ).toLocaleString()}
                                </span>
                                <span className="block text-[11px] text-slate-400 font-mono">
                                  ({sal.lateDays || 0} late day
                                  {sal.lateDays > 1 ? "s" : ""})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                0 late
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
            </div>
          )}

          {/* SUB-VIEW 3: APPRAISAL TRACKER */}
          {salarySubTab === "APPRAISALS" && (
            <div className="space-y-4">
              {/* Appraisal Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-2xs">
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

                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 shadow-2xs">
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
                    Pending past scheduled due date
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Previously Appraised
                    </span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-900 mt-2">
                    {employees.filter((e) => !!e.lastAppraisalDate).length}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Staff with recorded appraisals & increments
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1656a6]">
                      Total Staff Tracked
                    </span>
                    <Users className="w-4 h-4 text-[#1656a6]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1656a6] mt-2">
                    {employees.length}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {employees.filter((e) => !!e.appraisalDate).length} with
                    active review schedule
                  </p>
                </div>
              </div>

              {/* Appraisal Table Filter Pills */}
              <div className="flex items-center justify-between bg-white border border-slate-200/90 p-2 rounded-2xl shadow-2xs">
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "ALL", label: `All Staff (${employees.length})` },
                    {
                      id: "DUE_30",
                      label: `Due in 30 Days (${
                        employees.filter((e) => {
                          if (!e.appraisalDate) return false;
                          const diff = Math.ceil(
                            (new Date(e.appraisalDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return diff >= 0 && diff <= 30;
                        }).length
                      })`,
                    },
                    {
                      id: "OVERDUE",
                      label: `Overdue (${
                        employees.filter((e) => {
                          if (!e.appraisalDate) return false;
                          const diff = Math.ceil(
                            (new Date(e.appraisalDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          return diff < 0;
                        }).length
                      })`,
                    },
                    {
                      id: "APPRAISED",
                      label: `With History (${
                        employees.filter((e) => !!e.lastAppraisalDate).length
                      })`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAppraisalFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        appraisalFilter === tab.id
                          ? "bg-[#1656a6] text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <div className="overflow-x-auto min-w-0">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Staff & Designation</th>
                        <th className="px-6 py-3.5">Current Gross</th>
                        <th className="px-6 py-3.5">Last Appraisal Provided</th>
                        <th className="px-6 py-3.5">Next Appraisal Due</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees
                        .filter((emp) => {
                          if (appraisalFilter === "DUE_30") {
                            if (!emp.appraisalDate) return false;
                            const diff = Math.ceil(
                              (new Date(emp.appraisalDate).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                            );
                            return diff >= 0 && diff <= 30;
                          }
                          if (appraisalFilter === "OVERDUE") {
                            if (!emp.appraisalDate) return false;
                            const diff = Math.ceil(
                              (new Date(emp.appraisalDate).getTime() -
                                new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                            );
                            return diff < 0;
                          }
                          if (appraisalFilter === "APPRAISED") {
                            return !!emp.lastAppraisalDate;
                          }
                          return true;
                        })
                        .map((emp) => {
                          const appStatus = getAppraisalStatus(
                            emp.appraisalDate,
                          );
                          const hasLastAppraisal = !!emp.lastAppraisalDate;
                          const increment =
                            Number(emp.lastAppraisalIncrement) ||
                            (hasLastAppraisal && emp.lastAppraisalSalary
                              ? Math.max(
                                  0,
                                  emp.baseSalary - emp.lastAppraisalSalary,
                                )
                              : 0);

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
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {emp.role} • {emp.department || "General"}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 text-sm">
                                  ₹
                                  {Number(emp.baseSalary || 0).toLocaleString()}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Monthly Gross
                                </div>
                              </td>

                              {/* LAST APPRAISAL PROVIDED INFORMATION */}
                              <td className="px-6 py-4">
                                {hasLastAppraisal ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-slate-800">
                                        {new Date(
                                          emp.lastAppraisalDate,
                                        ).toLocaleDateString("en-IN", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                      {increment > 0 && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          +₹{increment.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                    {emp.lastAppraisalSalary !== null &&
                                      emp.lastAppraisalSalary !== undefined && (
                                        <div className="text-[11px] text-slate-400 font-mono">
                                          Prev: ₹
                                          {Number(
                                            emp.lastAppraisalSalary,
                                          ).toLocaleString()}
                                        </div>
                                      )}
                                    {emp.lastAppraisalNotes && (
                                      <div
                                        className="text-[11px] text-slate-500 italic max-w-xs truncate"
                                        title={emp.lastAppraisalNotes}
                                      >
                                        "{emp.lastAppraisalNotes}"
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      Initial Joining Salary
                                    </span>
                                    {emp.joiningDate && (
                                      <div className="text-[11px] text-slate-400 mt-0.5">
                                        Since{" "}
                                        {new Date(
                                          emp.joiningDate,
                                        ).toLocaleDateString("en-IN", {
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* NEXT APPRAISAL DUE DATE */}
                              <td className="px-6 py-4">
                                {emp.appraisalDate ? (
                                  <div>
                                    <div className="text-xs font-semibold text-slate-800">
                                      {new Date(
                                        emp.appraisalDate,
                                      ).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      Scheduled Review
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Not scheduled
                                  </span>
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
                                  onClick={() => handleOpenAppraisal(emp)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#154E98] text-white hover:bg-blue-400 text-xs font-bold  transition cursor-pointer"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  Review & Appraise
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {employees.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-12 text-center text-slate-400 text-xs"
                          >
                            No employees found to track.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPRAISAL REVIEW & INCREMENT MODAL */}
      {showAppraisalModal && selectedAppraisalEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowAppraisalModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 relative text-slate-900 my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowAppraisalModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1656a6] border border-blue-200/80">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Employee Performance Appraisal
                </h3>
                <p className="text-xs text-slate-500">
                  Review past increments, update monthly base salary, and
                  schedule next cycle
                </p>
              </div>
            </div>

            {/* Employee Card Snapshot */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1656a6] border border-blue-200/60">
                      {selectedAppraisalEmployee.empCode}
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedAppraisalEmployee.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedAppraisalEmployee.role} •{" "}
                    {selectedAppraisalEmployee.department || "General"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    Current Monthly Gross
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    ₹
                    {Number(
                      selectedAppraisalEmployee.baseSalary || 0,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Last Appraisal Details Summary */}
              {selectedAppraisalEmployee.lastAppraisalDate && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    <span className="text-slate-400">Last Appraised: </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(
                        selectedAppraisalEmployee.lastAppraisalDate,
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {selectedAppraisalEmployee.lastAppraisalSalary && (
                      <span className="text-slate-400 font-mono ml-1">
                        (Was ₹
                        {Number(
                          selectedAppraisalEmployee.lastAppraisalSalary,
                        ).toLocaleString()}
                        )
                      </span>
                    )}
                  </div>
                  {selectedAppraisalEmployee.lastAppraisalIncrement > 0 && (
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      +₹
                      {Number(
                        selectedAppraisalEmployee.lastAppraisalIncrement,
                      ).toLocaleString()}{" "}
                      hike
                    </span>
                  )}
                </div>
              )}
            </div>

            {appraisalError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{appraisalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppraisal} className="space-y-4 mt-4">
              {/* Comparison & Live Calculation Box */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1656a6] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Salary Revision Calculator
                  </span>
                  {Number(appraisalForm.newSalary) >
                    Number(selectedAppraisalEmployee.baseSalary) && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      +₹
                      {(
                        Number(appraisalForm.newSalary) -
                        Number(selectedAppraisalEmployee.baseSalary)
                      ).toLocaleString()}{" "}
                      (+
                      {(
                        ((Number(appraisalForm.newSalary) -
                          Number(selectedAppraisalEmployee.baseSalary)) /
                          (Number(selectedAppraisalEmployee.baseSalary) || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Monthly Base Salary (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={appraisalForm.newSalary}
                    onChange={(e) =>
                      setAppraisalForm({
                        ...appraisalForm,
                        newSalary: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-[#1656a6]"
                  />
                </div>

                {/* Preset Increment Buttons */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium self-center mr-1">
                    Quick Hike:
                  </span>
                  {[
                    { label: "+10%", pct: 0.1 },
                    { label: "+15%", pct: 0.15 },
                    { label: "+20%", pct: 0.2 },
                    { label: "+25%", pct: 0.25 },
                    { label: "+₹2,000", flat: 2000 },
                    { label: "+₹5,000", flat: 5000 },
                    { label: "+₹10,000", flat: 10000 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const cur =
                          Number(selectedAppraisalEmployee.baseSalary) || 0;
                        const added = preset.pct
                          ? Math.round(cur * (1 + preset.pct))
                          : cur + (preset.flat || 0);
                        setAppraisalForm({
                          ...appraisalForm,
                          newSalary: added,
                        });
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-blue-100 text-[#1656a6] border border-blue-200 rounded-lg transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appraisal Date & Next Cycle Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Appraisal Effective Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={appraisalForm.appraisalDate}
                    onChange={(e) =>
                      setAppraisalForm({
                        ...appraisalForm,
                        appraisalDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Next Appraisal Due Date
                    </label>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(
                            appraisalForm.appraisalDate || new Date(),
                          );
                          d.setMonth(d.getMonth() + 6);
                          setAppraisalForm({
                            ...appraisalForm,
                            nextAppraisalDate: d.toISOString().split("T")[0],
                          });
                        }}
                        className="text-[#1656a6] hover:underline cursor-pointer"
                      >
                        +6 Mo
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date(
                            appraisalForm.appraisalDate || new Date(),
                          );
                          d.setFullYear(d.getFullYear() + 1);
                          setAppraisalForm({
                            ...appraisalForm,
                            nextAppraisalDate: d.toISOString().split("T")[0],
                          });
                        }}
                        className="text-[#1656a6] hover:underline cursor-pointer"
                      >
                        +1 Yr
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={appraisalForm.nextAppraisalDate}
                    onChange={(e) =>
                      setAppraisalForm({
                        ...appraisalForm,
                        nextAppraisalDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              {/* Performance Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Performance Evaluation Rating
                </label>
                <select
                  value={appraisalForm.rating}
                  onChange={(e) =>
                    setAppraisalForm({
                      ...appraisalForm,
                      rating: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#1656a6]"
                >
                  <option value="OUTSTANDING">
                    🌟 OUTSTANDING (Exceeds all expectations)
                  </option>
                  <option value="EXCELLENT">
                    ✨ EXCELLENT (Consistently high performance)
                  </option>
                  <option value="GOOD">
                    👍 GOOD (Meets required standards)
                  </option>
                  <option value="SATISFACTORY">
                    📝 SATISFACTORY (Needs minor improvement)
                  </option>
                </select>
              </div>

              {/* Notes / Reason for increment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appraisal Remarks & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Annual hike based on excellent batch feedback and additional mentoring responsibilities"
                  value={appraisalForm.notes}
                  onChange={(e) =>
                    setAppraisalForm({
                      ...appraisalForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              {/* Past Appraisals History Log */}
              {loadingAppraisalHistory ? (
                <div className="pt-2 border-t border-slate-200 text-center py-2 text-xs text-slate-400">
                  Loading appraisal history...
                </div>
              ) : appraisalHistory.length > 0 ? (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Past Appraisal Records ({appraisalHistory.length})
                  </span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {appraisalHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="pt-1.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">
                            {new Date(item.appraisalDate).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-slate-400 ml-1.5 font-mono">
                            ₹{Number(item.previousSalary).toLocaleString()} → ₹
                            {Number(item.newSalary).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 font-mono text-[11px]">
                            +₹{Number(item.incrementAmount).toLocaleString()}
                            {item.incrementPercentage
                              ? ` (+${item.incrementPercentage}%)`
                              : ""}
                          </span>
                          {item.rating && (
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {item.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAppraisalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appraisalSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  {appraisalSubmitting
                    ? "Updating..."
                    : "Confirm & Save Appraisal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowExpenseModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 relative text-slate-900 my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
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
      {/* RECORD SALARY & LOP MODAL */}
      {showSalaryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowSalaryModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 relative text-slate-900 my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
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
                          salaryForm.lateDays,
                          salaryForm.lateDeduction,
                          true,
                        )
                      }
                      className="text-[11px] font-bold text-[#1656a6] hover:underline cursor-pointer"
                    >
                      Auto-Calc (30-day rate)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Monthly Base Salary (₹)
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
                          salaryForm.lateDays,
                          salaryForm.lateDeduction,
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                            salaryForm.lateDays,
                            salaryForm.lateDeduction,
                            true,
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#1656a6]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        LOP Deduct (₹)
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
                            salaryForm.lateDays,
                            salaryForm.lateDeduction,
                            false,
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-rose-600 font-mono font-bold text-sm focus:outline-none focus:border-[#1656a6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Late Arrival Deductions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Late Arrivals (Days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={salaryForm.lateDays}
                      onChange={(e) => {
                        const lDays = Number(e.target.value) || 0;
                        updateSalaryCalculation(
                          salaryForm.baseSalary,
                          salaryForm.lopDays,
                          salaryForm.lopDeduction,
                          lDays,
                          salaryForm.lateDeduction,
                          false,
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-600 mb-1 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-rose-500" />
                      Late Penalty Deduction (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={salaryForm.lateDeduction}
                      onChange={(e) => {
                        const lDed = Number(e.target.value) || 0;
                        updateSalaryCalculation(
                          salaryForm.baseSalary,
                          salaryForm.lopDays,
                          salaryForm.lopDeduction,
                          salaryForm.lateDays,
                          lDed,
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
                    {Number(salaryForm.lopDeduction).toLocaleString()} LOP - ₹
                    {Number(salaryForm.lateDeduction).toLocaleString()} Late
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setActivePayslip(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-8 relative text-slate-900 my-4 sm:my-6 max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
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
                  {(Number(activePayslip.lateDays) > 0 ||
                    Number(activePayslip.lateDeduction) > 0) && (
                    <tr>
                      <td className="py-2.5 text-rose-600">
                        Late Arrival Deduction ({activePayslip.lateDays || 0}{" "}
                        late day{activePayslip.lateDays > 1 ? "s" : ""})
                      </td>
                      <td className="py-2.5 text-right font-bold text-rose-600">
                        -₹
                        {Number(
                          activePayslip.lateDeduction || 0,
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
