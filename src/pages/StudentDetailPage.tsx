import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
  Printer,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../api/client";

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pay EMI Modal State
  const [selectedEmi, setSelectedEmi] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Print Invoice Modal State
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    api.get("/company").then((res) => setCompany(res.data.data)).catch(console.error);
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/students/${id}`);
      setData(res.data.data);
    } catch (err: any) {
      console.error("Failed to fetch student details:", err);
      setError(err.response?.data?.message || "Failed to load student ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStudentData();
  }, [id]);

  const openPayModal = (emi: any) => {
    setSelectedEmi(emi);
    setPayAmount(emi.amount);
    setPaymentMethod("UPI");
    setTransactionRef("");
    setPaySuccessMsg(null);
  };

  const handlePayEmi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmi) return;

    try {
      setPayLoading(true);
      const res = await api.post("/payments/emi", {
        emiScheduleId: selectedEmi.id,
        amountPaid: Number(payAmount),
        paymentMethod,
        transactionRef: transactionRef || undefined,
      });

      const newInv = res.data.data?.invoice?.invoiceNo;
      setPaySuccessMsg(`Payment recorded successfully! Invoice #${newInv} generated.`);
      setTimeout(() => {
        setSelectedEmi(null);
        fetchStudentData();
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading student ledger...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-rose-200">Error Loading Details</h3>
        <p className="text-sm text-rose-300 mt-1">{error || "Student not found"}</p>
        <Link
          to="/students"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
        </Link>
      </div>
    );
  }

  const { student, course, feePlan, emiSchedules, invoices } = data;
  const isPaidOff = (feePlan?.balanceAmount || 0) === 0;
  const percentPaid = feePlan?.totalAmount
    ? Math.min(100, Math.round((feePlan.paidAmount / feePlan.totalAmount) * 100))
    : 100;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/students"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Ledger</h1>
            <p className="text-xs text-slate-400">Admission ID #{student.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              student.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {student.status}
          </span>
        </div>
      </div>

      {/* Profile & Course Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg mb-4">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">{student.name}</h2>
            <div className="space-y-2 mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>DOB: {new Date(student.dob).toLocaleDateString()}</span>
              </div>
              {student.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-400">Enrolled Course</span>
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">{course?.title || "N/A"}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {course?.description || "Professional certification track"}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                Duration: {course?.durationMonths || 3} Months
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                Base Fee: ₹{(course?.baseFee || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Progress Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Payment Status</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isPaidOff
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {isPaidOff ? "Fully Paid" : "Balance Due"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white">
                ₹{(feePlan?.paidAmount || 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / ₹{(feePlan?.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                <span>{percentPaid}% Cleared</span>
                <span>Remaining: ₹{(feePlan?.balanceAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Plan Breakdown Details */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Financial Structure & Taxes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block">Plan Type</span>
            <span className="font-semibold text-white mt-1 block">
              {feePlan?.planType} ({feePlan?.totalInstallments} Installments)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block">Invoice Type</span>
            <span className="font-semibold text-indigo-400 mt-1 block">
              {feePlan?.invoiceType} {feePlan?.invoiceType === "GST" && "(18% GST)"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block">Discount</span>
            <span className="font-semibold text-emerald-400 mt-1 block">
              ₹{(feePlan?.discountAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 block">Tax Collected (CGST+SGST)</span>
            <span className="font-semibold text-amber-400 mt-1 block">
              ₹{(feePlan?.gstAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* EMI Installment Schedule (If applicable) */}
      {feePlan?.planType === "EMI" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Monthly EMI Installment Schedule</span>
            </h3>
            <span className="text-xs text-slate-400">
              Configured for monthly due dates
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Installment</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {emiSchedules && emiSchedules.length > 0 ? (
                  emiSchedules.map((emi: any) => {
                    const isPaid = emi.status === "PAID";
                    return (
                      <tr key={emi.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-semibold text-white">
                          EMI #{emi.installmentNo}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(emi.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          ₹{Number(emi.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Paid
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" /> Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {emi.paidDate
                            ? new Date(emi.paidDate).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => openPayModal(emi)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Cleared</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No pending EMI schedules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices & Receipts History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          <span>Payment Invoices & Receipts</span>
        </h3>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">Issued At</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-400">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs">
                      {new Date(inv.issuedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          inv.invoiceType === "GST"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <span className="font-medium">{inv.paymentMethod}</span>
                      {inv.transactionRef && (
                        <span className="block text-[10px] text-slate-500 font-mono">
                          Ref: {inv.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      ₹{Number(inv.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No payment invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay EMI Modal */}
      {selectedEmi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedEmi(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Collect EMI Installment #{selectedEmi.installmentNo}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Due Date: {new Date(selectedEmi.dueDate).toLocaleDateString()}
            </p>

            {paySuccessMsg ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{paySuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handlePayEmi} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Installment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NETBANKING">Net Banking / IMPS / NEFT</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Transaction / UTR Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI Ref # or Bank Txn ID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEmi(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={payLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    {payLoading ? "Processing..." : "Confirm & Generate Invoice"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal & Print */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">
                Official Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div className="mt-6 space-y-6 text-slate-200" id="printable-receipt">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white uppercase">
                    {company?.companyName || "IZEON INNOVATIVE"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {company?.tagline || "Academy of Computer Software Training"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {[company?.address, company?.city, company?.state].filter(Boolean).join(", ") || "Tamil Nadu, India"}
                  </p>
                  {activeInvoice.invoiceType === "GST" && (
                    <p className="text-xs text-indigo-400 font-mono mt-1 font-bold">
                      GSTIN: {company?.gstin || "N/A"}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-white block">
                    {activeInvoice.invoiceNo}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Date: {new Date(activeInvoice.issuedAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mt-1">
                    {activeInvoice.invoiceType === "GST" ? "TAX INVOICE" : "PAYMENT RECEIPT"}
                  </span>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-500 font-semibold uppercase block mb-1">
                  Billed To (Student)
                </span>
                <p className="font-bold text-white text-sm">{student.name}</p>
                <p className="text-slate-400">{student.email} • {student.phone}</p>
                <p className="text-slate-400 mt-1">Course: {course?.title}</p>
              </div>

              {/* Items Breakdown */}
              <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Description</th>
                      <th className="px-4 py-2.5 text-right">Taxable</th>
                      {activeInvoice.invoiceType === "GST" && (
                        <>
                          <th className="px-4 py-2.5 text-right">CGST (9%)</th>
                          <th className="px-4 py-2.5 text-right">SGST (9%)</th>
                        </>
                      )}
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white block">Course Fee Payment</span>
                        <span className="text-slate-500 text-[11px]">
                          Payment Method: {activeInvoice.paymentMethod}
                          {activeInvoice.transactionRef && ` (Ref: ${activeInvoice.transactionRef})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        ₹{Number(activeInvoice.taxableAmount).toLocaleString()}
                      </td>
                      {activeInvoice.invoiceType === "GST" && (
                        <>
                          <td className="px-4 py-3 text-right text-slate-300">
                            ₹{Number(activeInvoice.cgstAmount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            ₹{Number(activeInvoice.sgstAmount).toLocaleString()}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        ₹{Number(activeInvoice.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Footnote */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 italic">
                  This is a computer generated invoice and requires no physical signature.
                </span>
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">Grand Total Paid</span>
                  <span className="text-lg font-bold text-white">
                    ₹{Number(activeInvoice.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentDetailPage;
