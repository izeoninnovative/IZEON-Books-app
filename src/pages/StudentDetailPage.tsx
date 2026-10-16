/** @format */

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
  Edit3,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import logoImg from "../assets/interview logo.png";

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Student Modal State (Admin Only)
  const [showEditModal, setShowEditModal] = useState(false);
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
    api
      .get("/company")
      .then((res) => setCompany(res.data.data))
      .catch(console.error);
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

  const openEditStudentModal = async () => {
    if (!data?.student) return;
    const st = data.student;
    let formattedDob = st.dob || "";
    if (formattedDob.includes("T")) {
      formattedDob = formattedDob.split("T")[0];
    }
    setEditForm({
      name: st.name || "",
      email: st.email || "",
      phone: st.phone || "",
      dob: formattedDob,
      address: st.address || "",
      courseId: st.courseId,
      status: st.status || "ACTIVE",
    });
    setEditError(null);
    setShowEditModal(true);

    if (courses.length === 0) {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.data || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.student) return;

    try {
      setEditLoading(true);
      setEditError(null);
      await api.put(`/students/${data.student.id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        dob: editForm.dob,
        address: editForm.address,
        courseId: Number(editForm.courseId),
        status: editForm.status,
      });

      success("Student record updated successfully!", "Update Successful");
      setShowEditModal(false);
      fetchStudentData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update student";
      setEditError(msg);
      notifyError(msg, "Update Failed");
    } finally {
      setEditLoading(false);
    }
  };

  const openPayModal = (emi: any) => {
    setSelectedEmi(emi);
    const remaining = feePlan?.balanceAmount ?? emi.amount;
    // Suggest the exact EMI amount or whatever balance is left, whichever is smaller
    setPayAmount(Math.min(emi.amount, remaining));
    setPaymentMethod("UPI");
    setTransactionRef("");
    setPaySuccessMsg(null);
  };

  const handlePayEmi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmi) return;

    const remaining = feePlan?.balanceAmount ?? 0;
    if (remaining <= 0) {
      notifyError(
        "This student has already fully paid all course fees.",
        "Fee Already Cleared",
      );
      return;
    }

    const enteredAmount = Number(payAmount);
    if (enteredAmount <= 0) {
      notifyError(
        "Please enter a valid payment amount greater than zero.",
        "Invalid Amount",
      );
      return;
    }

    if (enteredAmount > remaining) {
      notifyError(
        `Payment cannot exceed the remaining balance of ₹${remaining.toLocaleString()}. Please enter up to ₹${remaining.toLocaleString()}.`,
        "Excess Payment Blocked",
      );
      return;
    }

    try {
      setPayLoading(true);
      const res = await api.post("/payments/pay-emi", {
        emiScheduleId: selectedEmi.id,
        amountPaid: enteredAmount,
        paymentMethod,
        transactionRef: transactionRef || undefined,
      });

      const newInv = res.data.data?.invoice?.invoiceNo;
      const isNowFullyPaid = (res.data.data?.remainingBalance ?? 0) <= 0;

      if (isNowFullyPaid) {
        setPaySuccessMsg(
          `Full fee cleared! Invoice #${newInv} generated. All remaining EMIs resolved.`,
        );
        success(
          `Full fee cleared! Invoice #${newInv} generated. All EMIs marked Paid.`,
          "Full Payment Completed",
        );
      } else {
        setPaySuccessMsg(
          `Payment recorded successfully! Invoice #${newInv} generated.`,
        );
        success(
          `Payment recorded! Invoice #${newInv} generated.`,
          "EMI Paid Successfully",
        );
      }

      setTimeout(() => {
        setSelectedEmi(null);
        fetchStudentData();
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to record payment";
      notifyError(msg, "Payment Failed");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading student ledger...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-rose-900">
          Error Loading Details
        </h3>
        <p className="text-sm text-rose-700 mt-1">
          {error || "Student not found"}
        </p>
        <Link
          to="/students"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
        </Link>
      </div>
    );
  }

  const { student, course, feePlan, emiSchedules, invoices } = data;
  const isPaidOff = (feePlan?.balanceAmount || 0) === 0;
  const percentPaid = feePlan?.totalAmount
    ? Math.min(
        100,
        Math.round((feePlan.paidAmount / feePlan.totalAmount) * 100),
      )
    : 100;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/students"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Ledger
            </h1>
            <p className="text-xs text-slate-500">Admission ID #{student.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              student.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : student.status === "COMPLETED"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {student.status}
          </span>
          {isAdmin && (
            <button
              onClick={openEditStudentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs shadow-2xs transition cursor-pointer"
              title="Edit Student Information (Admin Only)"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1656a6]" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile & Course Info (Clean White Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1656a6] border border-blue-200 flex items-center justify-center font-bold text-lg mb-4">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
            <div className="space-y-2 mt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>DOB: {new Date(student.dob).toLocaleDateString()}</span>
              </div>
              {student.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">
                Enrolled Course
              </span>
              <GraduationCap className="w-5 h-5 text-[#1656a6]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {course?.title || "N/A"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {course?.description || "Professional certification track"}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                Duration: {course?.durationMonths || 3} Months
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                Base Fee: ₹{(course?.baseFee || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Progress Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Payment Status
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isPaidOff
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isPaidOff ? "Fully Paid" : "Balance Due"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                ₹{(feePlan?.paidAmount || 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / ₹{(feePlan?.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#1656a6] h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
                <span>{percentPaid}% Cleared</span>
                <span>
                  Remaining: ₹{(feePlan?.balanceAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Plan Breakdown Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Financial Structure & Taxes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Plan Type</span>
            <span className="font-bold text-slate-900 mt-1 block">
              {feePlan?.planType} ({feePlan?.totalInstallments} Installments)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Invoice Type</span>
            <span className="font-bold text-[#1656a6] mt-1 block">
              {feePlan?.invoiceType}{" "}
              {feePlan?.invoiceType === "GST" && "(18% GST)"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Discount</span>
            <span className="font-bold text-emerald-600 mt-1 block">
              ₹{(feePlan?.discountAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">
              Tax Collected (CGST+SGST)
            </span>
            <span className="font-bold text-amber-600 mt-1 block">
              ₹{(feePlan?.gstAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* EMI Installment Schedule (If applicable) */}
      {feePlan?.planType === "EMI" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1656a6]" />
              <span>Monthly EMI Installment Schedule</span>
            </h3>
            <span className="text-xs text-slate-500">
              Configured for monthly due dates
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Installment</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Paid Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emiSchedules && emiSchedules.length > 0 ? (
                  emiSchedules.map((emi: any) => {
                    const isEffectivelyPaid =
                      emi.status === "PAID" || isPaidOff;
                    return (
                      <tr
                        key={emi.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          EMI #{emi.installmentNo}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(emi.dueDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(emi.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isEffectivelyPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {isEffectivelyPaid ? (
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
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {emi.paidDate
                            ? new Date(emi.paidDate).toLocaleDateString("en-IN")
                            : isPaidOff
                              ? "Cleared in Full"
                              : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isEffectivelyPaid ? (
                            <button
                              onClick={() => openPayModal(emi)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-semibold shadow-2xs transition cursor-pointer"
                            >
                              Collect Fee
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-400 text-xs"
                    >
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
        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#1656a6]" />
          <span>Payment Invoices & Receipts</span>
        </h3>

        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Invoice No</th>
                <th className="px-6 py-3.5">Issued At</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Amount Paid</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-[#1656a6]">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
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
                            ? "bg-blue-50 text-[#1656a6] border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {inv.paymentMethod}
                      </span>
                      {inv.transactionRef && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Ref: {inv.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{Number(inv.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedEmi(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Collect EMI Installment #{selectedEmi.installmentNo}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Due Date: {new Date(selectedEmi.dueDate).toLocaleDateString()}
            </p>

            {/* Remaining Balance Summary Pill */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                Total Pending Balance:
              </span>
              <span className="font-bold text-[#1656a6] font-mono text-sm">
                ₹{(feePlan?.balanceAmount || 0).toLocaleString()}
              </span>
            </div>

            {paySuccessMsg ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{paySuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handlePayEmi} className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Payment Amount (₹)
                    </label>
                    {/* Quick Fill Options */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPayAmount(
                            Math.min(
                              selectedEmi.amount,
                              feePlan?.balanceAmount || selectedEmi.amount,
                            ),
                          )
                        }
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        EMI (₹
                        {Math.min(
                          selectedEmi.amount,
                          feePlan?.balanceAmount || selectedEmi.amount,
                        ).toLocaleString()}
                        )
                      </button>
                      {(feePlan?.balanceAmount || 0) > selectedEmi.amount && (
                        <button
                          type="button"
                          onClick={() =>
                            setPayAmount(feePlan?.balanceAmount || 0)
                          }
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                        >
                          Pay Full Balance (₹
                          {(feePlan?.balanceAmount || 0).toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    min={1}
                    max={feePlan?.balanceAmount || selectedEmi.amount}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Cannot exceed remaining balance</span>
                    <span className="font-semibold text-slate-600">
                      Max: ₹{(feePlan?.balanceAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NETBANKING">
                      Net Banking / IMPS / NEFT
                    </option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Transaction / UTR Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI Ref # or Bank Txn ID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEmi(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={payLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] disabled:opacity-50 text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    {payLoading
                      ? "Processing..."
                      : "Confirm & Generate Invoice"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal & Print */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative my-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Payment Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div className="mt-6 space-y-6" id="printable-receipt">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 ring-1 ring-slate-200 shadow-xs flex items-center justify-center shrink-0">
                    <img
                      src={logoImg}
                      alt="IZEON"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      {company?.companyName || "IZEON INNOVATIVE"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {company?.tagline ||
                        "Academy of Computer Software Training"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[company?.address, company?.city, company?.state]
                        .filter(Boolean)
                        .join(", ") || "Tamil Nadu, India"}
                    </p>
                    {activeInvoice.invoiceType === "GST" && (
                      <p className="text-xs text-[#1656a6] font-mono mt-1 font-bold">
                        GSTIN: {company?.gstin || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-slate-900 block">
                    {activeInvoice.invoiceNo}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Date:{" "}
                    {new Date(activeInvoice.issuedAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1656a6] border border-blue-200 inline-block mt-1">
                    {activeInvoice.invoiceType === "GST"
                      ? "TAX INVOICE"
                      : "PAYMENT RECEIPT"}
                  </span>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold uppercase block mb-1">
                  Billed To (Student)
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {student.name}
                </p>
                <p className="text-slate-500">
                  {student.email} • {student.phone}
                </p>
                <p className="text-slate-500 mt-1">Course: {course?.title}</p>
              </div>

              {/* Items Breakdown */}
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
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
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">
                          Course Fee Payment
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Payment Method: {activeInvoice.paymentMethod}
                          {activeInvoice.transactionRef &&
                            ` (Ref: ${activeInvoice.transactionRef})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        ₹{Number(activeInvoice.taxableAmount).toLocaleString()}
                      </td>
                      {activeInvoice.invoiceType === "GST" && (
                        <>
                          <td className="px-4 py-3 text-right text-slate-700">
                            ₹{Number(activeInvoice.cgstAmount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700">
                            ₹{Number(activeInvoice.sgstAmount).toLocaleString()}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₹{Number(activeInvoice.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Footnote */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 italic">
                  This is a computer generated invoice and requires no physical
                  signature.
                </span>
                <div className="text-right">
                  <span className="text-slate-500 text-xs block">
                    Grand Total Paid
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{Number(activeInvoice.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal (Admin Only) */}
      {showEditModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900 my-8">
            <button
              onClick={() => setShowEditModal(false)}
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
                      <option value={student.courseId}>{course?.title || "Current Course"}</option>
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
                  onClick={() => setShowEditModal(false)}
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
export default StudentDetailPage;

