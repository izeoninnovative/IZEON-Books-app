/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Receipt,
  ArrowRight,
} from "lucide-react";
import api from "../api/client";
import { useNotification } from "../context/NotificationContext";

export const NewAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");

  // Financial Options
  const [planType, setPlanType] = useState<"LUMPSUM" | "EMI">("LUMPSUM");
  const [invoiceType, setInvoiceType] = useState<"GST" | "NON_GST">("GST");
  const [baseFee, setBaseFee] = useState<number>(25000);
  const [discountMode, setDiscountMode] = useState<"RUPEES" | "PERCENTAGE">(
    "RUPEES",
  );
  const [discountValue, setDiscountValue] = useState<number>(0);

  // EMI Options
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [emiMonths, setEmiMonths] = useState<number>(3);
  const [emiDueDay, setEmiDueDay] = useState<number>(5);

  // Payment Mode
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "UPI" | "CARD" | "NETBANKING" | "CHEQUE"
  >("UPI");
  const [transactionRef, setTransactionRef] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        const list = res.data.data || [];
        setCourses(list);
        if (list.length > 0) {
          setCourseId(list[0].id);
          setBaseFee(list[0].baseFee);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (id: number) => {
    setCourseId(id);
    const selected = courses.find((c) => c.id === id);
    if (selected) {
      setBaseFee(selected.baseFee);
    }
  };

  // Calculations
  const discountLimit = Math.max(0, baseFee);
  const normalizedDiscountValue = Math.max(0, discountValue);
  const discountAmount =
    discountMode === "PERCENTAGE"
      ? Math.round(
          ((discountLimit * Math.min(normalizedDiscountValue, 100)) / 100) *
            100,
        ) / 100
      : Math.min(normalizedDiscountValue, discountLimit);
  const taxableAmount = Math.max(0, baseFee - discountAmount);
  const isGst = invoiceType === "GST";
  const gstAmount = isGst ? Math.round(taxableAmount * 0.18 * 100) / 100 : 0;
  const cgst = isGst ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const sgst = isGst ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const totalPayable = taxableAmount + gstAmount;

  const initialPayment =
    planType === "LUMPSUM" ? totalPayable : Number(downPayment || 0);
  const remainingBalance = Math.max(0, totalPayable - initialPayment);
  const monthlyEmi =
    planType === "EMI" && emiMonths > 0
      ? Math.round((remainingBalance / emiMonths) * 100) / 100
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        dob,
        address,
        courseId: Number(courseId),
        planType,
        invoiceType,
        baseAmount: baseFee,
        discountAmount,
        downPayment: planType === "EMI" ? downPayment : totalPayable,
        emiMonths: planType === "EMI" ? emiMonths : 1,
        emiDueDayOfMonth: emiDueDay,
        paymentMethod,
        transactionRef,
      };

      const res = await api.post("/students", payload);
      if (res.data.success) {
        success(
          `Student "${payload.name}" enrolled successfully! Invoice receipt generated.`,
          "Admission Confirmed",
        );
        navigate(`/students/${res.data.data.student.id}`);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to enroll student. Please check input.";
      setError(msg);
      notifyError(msg, "Admission Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Student Admission & Fee Setup
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Enroll student, configure Lumpsum or EMI schedule, and generate GST
          invoice receipt.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column: Form Details (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Student Personal Information */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#1656a6]" />
              <span>1. Student Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Pincode"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
              />
            </div>
          </div>

          {/* 2. Course & Fee Configuration */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1656a6]" />
              <span>2. Course & Fee Setup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code}) - ₹{c.baseFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Fee (₹)
                </label>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div>
                <label
                  htmlFor="discount-value"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Scholarship / Discount (
                  {discountMode === "RUPEES" ? "₹" : "%"})
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Discount type"
                    value={discountMode}
                    onChange={(e) =>
                      setDiscountMode(e.target.value as "RUPEES" | "PERCENTAGE")
                    }
                    className="w-2/5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value="RUPEES">Rupees (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                  <input
                    id="discount-value"
                    type="number"
                    min={0}
                    max={discountMode === "PERCENTAGE" ? 100 : discountLimit}
                    step="any"
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Type *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceType("GST")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      invoiceType === "GST"
                        ? "bg-[#1656a6] text-[#F7F0E8] border-[#1656a6] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    GST (18%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType("NON_GST")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      invoiceType === "NON_GST"
                        ? "bg-[#1656a6] text-[#F7F0E8] border-[#1656a6] shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Non-GST
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Plan: Lumpsum vs EMI */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1656a6]" />
              <span>3. Payment Schedule Plan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  planType === "LUMPSUM"
                    ? "bg-blue-50/70 border-[#1656a6] text-slate-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  checked={planType === "LUMPSUM"}
                  onChange={() => setPlanType("LUMPSUM")}
                  className="hidden"
                />
                <div className="p-2 rounded-lg bg-blue-100 text-[#1656a6] shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    Lumpsum (One-Time)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pay full tuition upfront
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  planType === "EMI"
                    ? "bg-purple-50/70 border-purple-500 text-slate-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  checked={planType === "EMI"}
                  onChange={() => setPlanType("EMI")}
                  className="hidden"
                />
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">
                    Monthly EMI Plan
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Downpayment + installments
                  </p>
                </div>
              </label>
            </div>

            {planType === "EMI" && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={emiMonths}
                    onChange={(e) => setEmiMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={9}>9 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Due Date
                  </label>
                  <select
                    value={emiDueDay}
                    onChange={(e) => setEmiDueDay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  >
                    <option value={1}>1st of every month</option>
                    <option value={5}>5th of every month</option>
                    <option value={10}>10th of every month</option>
                    <option value={15}>15th of every month</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Payment Mode */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#1656a6]" />
              <span>4. Initial Payment Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="NETBANKING">Net Banking (NEFT/IMPS)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Ref / UTR #
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-12345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Bill Breakdown */}
        <div className="space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-md sticky top-20 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1656a6]" />
                <span>Invoice Breakdown</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1656a6] border border-blue-200">
                {invoiceType}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Course Base Fee:</span>
                <span className="text-slate-900 font-semibold">
                  ₹{baseFee.toLocaleString("en-IN")}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Scholarship Discount:</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span>Taxable Amount:</span>
                <span className="text-slate-900 font-semibold">
                  ₹{taxableAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {isGst && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span>CGST (9%):</span>
                    <span className="text-slate-700">
                      ₹{cgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>SGST (9%):</span>
                    <span className="text-slate-700">
                      ₹{sgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#1656a6] font-semibold">
                    <span>Total GST (18%):</span>
                    <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
                <span>Total Fee Payable:</span>
                <span className="text-[#1656a6]">
                  ₹{totalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Plan Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Today's Payment:</span>
                <span>₹{initialPayment.toLocaleString("en-IN")}</span>
              </div>

              {planType === "EMI" && (
                <>
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Remaining Balance:</span>
                    <span>₹{remainingBalance.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                    <span>Monthly EMI:</span>
                    <span className="font-bold text-slate-900">
                      {emiMonths} x ₹{monthlyEmi.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Due on {emiDueDay}th of every month
                  </p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1656a6] to-[#124587] hover:from-[#1b61bd] hover:to-[#1656a6] text-[#F7F0E8] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {loading
                  ? "Processing Admission..."
                  : "Confirm & Generate Receipt"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default NewAdmissionPage;
