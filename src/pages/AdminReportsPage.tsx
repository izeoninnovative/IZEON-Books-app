import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  CreditCard,
  Layers,
  IndianRupee,
} from "lucide-react";
import api from "../api/client";

export const AdminReportsPage: React.FC = () => {
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all">("month");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "EXPENSES" | "SALARIES" | "REVENUE">("SUMMARY");

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
    employeeName: "",
    employeeEmail: "",
    role: "Trainer",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
    paymentMethod: "NETBANKING",
    reference: "",
    notes: "",
  });
  const [salarySubmitting, setSalarySubmitting] = useState(false);

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

  useEffect(() => {
    fetchReports();
  }, [filter]);

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

  const handleRecordSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalarySubmitting(true);
      await api.post("/admin/salaries", {
        ...salaryForm,
        amount: Number(salaryForm.amount),
        month: Number(salaryForm.month),
        year: Number(salaryForm.year),
      });
      setShowSalaryModal(false);
      setSalaryForm({
        employeeName: "",
        employeeEmail: "",
        role: "Trainer",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: "",
        paymentMethod: "NETBANKING",
        reference: "",
        notes: "",
      });
      fetchReports();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record salary");
    } finally {
      setSalarySubmitting(false);
    }
  };

  const summary = report?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTaxCollected: 0,
    totalGeneralExpenses: 0,
    totalSalariesPaid: 0,
  };

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Financial & P&L Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Profit & Loss statement, fee revenues, overheads, and staff salaries
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={() => setShowSalaryModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Staff Salary</span>
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <span className="text-xs font-semibold text-slate-400 px-3">Reporting Period:</span>
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
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
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
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue (Inflow)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Student fees collected</p>
        </div>

        {/* Expenses */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Outflow (Expenses)</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            ₹{summary.totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Overheads (₹{summary.totalGeneralExpenses.toLocaleString()}) + Salaries (₹{summary.totalSalariesPaid.toLocaleString()})
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Profit / Margin</span>
            <IndianRupee className={`w-4 h-4 ${isProfit ? "text-emerald-400" : "text-rose-400"}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
            ₹{summary.netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isProfit ? "Profitable cashflow" : "Operating at deficit"}
          </p>
        </div>

        {/* GST Collected */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">GST Collected</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">
            ₹{summary.totalTaxCollected.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Liability for tax filing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("SUMMARY")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "SUMMARY"
              ? "text-indigo-400 border-b-2 border-indigo-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          P&L Summary Breakdown
        </button>
        <button
          onClick={() => setActiveTab("EXPENSES")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "EXPENSES"
              ? "text-indigo-400 border-b-2 border-indigo-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          General Expenses ({report?.expenses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("SALARIES")}
          className={`pb-3 font-semibold transition relative cursor-pointer ${
            activeTab === "SALARIES"
              ? "text-indigo-400 border-b-2 border-indigo-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Staff Payroll ({report?.salaries?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading financial data...
        </div>
      ) : activeTab === "SUMMARY" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Cash Inflow Statement</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Fees Collected</span>
                <span className="font-semibold text-emerald-400">
                  ₹{summary.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Number of Payments Received</span>
                <span className="font-semibold text-white">
                  {report?.invoices?.length || 0}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Average Transaction</span>
                <span className="font-semibold text-white">
                  ₹
                  {report?.invoices?.length
                    ? Math.round(summary.totalRevenue / report.invoices.length).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Cash Outflow Statement</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">General Overheads & Rent</span>
                <span className="font-semibold text-rose-400">
                  ₹{summary.totalGeneralExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Trainer & Employee Salaries</span>
                <span className="font-semibold text-rose-400">
                  ₹{summary.totalSalariesPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-white">Total Outflow</span>
                <span className="font-bold text-rose-400">
                  ₹{summary.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "EXPENSES" ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.expenses && report.expenses.length > 0 ? (
                report.expenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{exp.title}</div>
                      {exp.notes && <div className="text-xs text-slate-400">{exp.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {new Date(exp.expenseDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-rose-400">
                      ₹{Number(exp.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                    No expenses recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Method & Ref</th>
                <th className="px-6 py-4 text-right">Salary Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.salaries && report.salaries.length > 0 ? (
                report.salaries.map((sal: any) => (
                  <tr key={sal.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{sal.employeeName}</div>
                      {sal.employeeEmail && (
                        <div className="text-xs text-slate-400">{sal.employeeEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">{sal.role}</td>
                    <td className="px-6 py-4 text-xs text-slate-300 font-medium">
                      Month {sal.month}/{sal.year}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <span>{sal.paymentMethod}</span>
                      {sal.reference && (
                        <span className="block text-[11px] text-slate-500 font-mono">
                          {sal.reference}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-rose-400">
                      ₹{Number(sal.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    No payroll disbursements recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight">Record Office Expense</h3>
            <p className="text-xs text-slate-400 mt-1">
              Log office operational expenditures for P&L tracking
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Rent for Oct, High-Speed Internet"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RENT">Rent</option>
                    <option value="UTILITIES">Utilities / Internet</option>
                    <option value="MARKETING">Marketing / Ads</option>
                    <option value="EQUIPMENT">Equipment & Systems</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional context or invoice ref"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  {expenseSubmitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowSalaryModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight">Record Salary Payroll</h3>
            <p className="text-xs text-slate-400 mt-1">
              Disburse & document employee or trainer monthly remuneration
            </p>

            <form onSubmit={handleRecordSalary} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={salaryForm.employeeName}
                    onChange={(e) => setSalaryForm({ ...salaryForm, employeeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Trainer"
                    value={salaryForm.role}
                    onChange={(e) => setSalaryForm({ ...salaryForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Month
                  </label>
                  <select
                    value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        Month {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Year
                  </label>
                  <input
                    type="number"
                    value={salaryForm.year}
                    onChange={(e) => setSalaryForm({ ...salaryForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={salaryForm.amount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={salaryForm.paymentMethod}
                    onChange={(e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NETBANKING">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Txn Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR12345678"
                    value={salaryForm.reference}
                    onChange={(e) => setSalaryForm({ ...salaryForm, reference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={salarySubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  {salarySubmitting ? "Processing..." : "Record Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReportsPage;
