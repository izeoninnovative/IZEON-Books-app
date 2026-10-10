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

export const NewAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [discountAmount, setDiscountAmount] = useState<number>(0);

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
  const taxableAmount = Math.max(0, baseFee - discountAmount);
  const isGst = invoiceType === "GST";
  const gstAmount = isGst ? Math.round(taxableAmount * 0.18 * 100) / 100 : 0;
  const cgst = isGst ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const sgst = isGst ? Math.round((gstAmount / 2) * 100) / 100 : 0;
  const totalPayable = taxableAmount + gstAmount;

  const initialPayment = planType === "LUMPSUM" ? totalPayable : Number(downPayment || 0);
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
        navigate(`/students/${res.data.data.student.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to enroll student. Please check input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Student Admission & Fee Setup
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Enroll student, configure Lumpsum or EMI schedule, and generate GST invoice receipt.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Student Personal Information */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>1. Student Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Residential Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Pincode"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 2. Course & Fee Configuration */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>2. Course & Fee Setup</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Course *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code}) - ₹{c.baseFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Base Fee (₹)
                </label>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scholarship / Discount (₹)
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Invoice Type *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceType("GST")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      invoiceType === "GST"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    GST (18%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType("NON_GST")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      invoiceType === "NON_GST"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    Non-GST
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Plan: Lumpsum vs EMI */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>3. Payment Schedule Plan</span>
            </h3>

            <div className="flex gap-3">
              <label
                className={`flex-1 p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  planType === "LUMPSUM"
                    ? "bg-indigo-600/10 border-indigo-500 text-white"
                    : "bg-slate-800/40 border-slate-700 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  checked={planType === "LUMPSUM"}
                  onChange={() => setPlanType("LUMPSUM")}
                  className="hidden"
                />
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Lumpsum (One-Time)</p>
                  <p className="text-[11px] text-slate-400">Pay full tuition upfront</p>
                </div>
              </label>

              <label
                className={`flex-1 p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  planType === "EMI"
                    ? "bg-purple-600/10 border-purple-500 text-white"
                    : "bg-slate-800/40 border-slate-700 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  checked={planType === "EMI"}
                  onChange={() => setPlanType("EMI")}
                  className="hidden"
                />
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Monthly EMI Plan</p>
                  <p className="text-[11px] text-slate-400">Downpayment + monthly installments</p>
                </div>
              </label>
            </div>

            {planType === "EMI" && (
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={emiMonths}
                    onChange={(e) => setEmiMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={9}>9 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Due Date
                  </label>
                  <select
                    value={emiDueDay}
                    onChange={(e) => setEmiDueDay(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-indigo-400" />
              <span>4. Initial Payment Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="NETBANKING">Net Banking (NEFT/IMPS)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Ref / UTR #
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-12345678"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Bill Breakdown */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl sticky top-20 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>Invoice Breakdown</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {invoiceType}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Course Base Fee:</span>
                <span className="text-white font-medium">₹{baseFee.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Scholarship Discount:</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span>Taxable Amount:</span>
                <span className="text-white font-medium">
                  ₹{taxableAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {isGst && (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span>CGST (9%):</span>
                    <span className="text-slate-300">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>SGST (9%):</span>
                    <span className="text-slate-300">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-indigo-300 font-medium">
                    <span>Total GST (18%):</span>
                    <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                <span>Total Fee Payable:</span>
                <span className="text-indigo-400">₹{totalPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Plan Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Today's Payment:</span>
                <span>₹{initialPayment.toLocaleString("en-IN")}</span>
              </div>

              {planType === "EMI" && (
                <>
                  <div className="flex justify-between text-amber-400">
                    <span>Remaining Balance:</span>
                    <span>₹{remainingBalance.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-300 flex justify-between">
                    <span>Monthly EMI:</span>
                    <span className="font-bold text-white">
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
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Processing Admission..." : "Confirm & Generate Receipt"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
