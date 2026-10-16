/** @format */

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  Search,
  Filter,
  FileText,
  Printer,
  X,
  IndianRupee,
  RefreshCw,
  Building2,
  Mail,
} from "lucide-react";
import api, { invalidateApiCache } from "../api/client";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/interview logo.png";

export const InvoicesPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "GST" | "NON_GST">(
    "ALL",
  );

  // Selected Invoice for Full Receipt Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [emailingInvoiceId, setEmailingInvoiceId] = useState<number | null>(
    null,
  );
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    api
      .get("/company")
      .then((res) => setCompany(res.data.data))
      .catch(console.error);
  }, []);

  const fetchInvoices = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) {
        invalidateApiCache("/payments/invoices");
      }
      const res = await api.get("/payments/invoices", {
        bypassCache: forceRefresh,
      } as any);
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleEmailInvoice = async (invoice: any) => {
    if (!invoice.studentEmail || invoice.studentEmail === "N/A") {
      setEmailMessage({
        type: "error",
        text: "This invoice has no student email address.",
      });
      return;
    }
    if (
      !window.confirm(
        `Send invoice ${invoice.invoiceNo} as a PDF to ${invoice.studentEmail}?`,
      )
    ) {
      return;
    }

    setEmailingInvoiceId(invoice.id);
    setEmailMessage(null);
    try {
      const response = await api.post(`/payments/invoices/${invoice.id}/email`);
      setEmailMessage({
        type: "success",
        text:
          response.data.message ||
          `Invoice PDF sent to ${invoice.studentEmail}`,
      });
    } catch (err: any) {
      console.error(`Failed to email invoice ${invoice.invoiceNo}:`, err);
      setEmailMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          `Failed to send invoice PDF to ${invoice.studentEmail}. Please try again.`,
      });
    } finally {
      setEmailingInvoiceId(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        !term ||
        inv.invoiceNo?.toLowerCase().includes(term) ||
        inv.studentName?.toLowerCase().includes(term) ||
        inv.studentEmail?.toLowerCase().includes(term);

      const matchesType =
        typeFilter === "ALL" || inv.invoiceType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [invoices, searchTerm, typeFilter]);

  const { totalCollected, totalGst, myCollected, myGst, myInvoicesCount } =
    useMemo(() => {
      let collected = 0;
      let gst = 0;
      let myColl = 0;
      let myGstVal = 0;
      let myCount = 0;
      for (let i = 0; i < invoices.length; i++) {
        const inv = invoices[i];
        if (inv.amountPaid) collected += inv.amountPaid;
        gst += (inv.cgstAmount || 0) + (inv.sgstAmount || 0);

        if (inv.createdById === user?.id) {
          myCount++;
          if (inv.amountPaid) myColl += inv.amountPaid;
          myGstVal += (inv.cgstAmount || 0) + (inv.sgstAmount || 0);
        }
      }
      return {
        totalCollected: collected,
        totalGst: gst,
        myCollected: myColl,
        myGst: myGstVal,
        myInvoicesCount: myCount,
      };
    }, [invoices, user]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Invoices & Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete audit trail of student fee receipts, GST compliance, and
            payment records
          </p>
        </div>
        <button
          onClick={() => fetchInvoices(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? "Total Invoices" : "My Invoices"}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1656a6]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {isAdmin ? invoices.length : myInvoicesCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? "Issued for course enrollments & EMIs"
              : "Generated by your account"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? "Gross Fee Inflow" : "My Fee Collections"}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{(isAdmin ? totalCollected : myCollected).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? "Total revenue collected"
              : "Total revenue collected by you"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? "GST Collected (18%)" : "GST in My Collections"}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1656a6]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1656a6] mt-2">
            ₹{Math.round(isAdmin ? totalGst : myGst).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Split equally into CGST & SGST (9% each)
          </p>
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
            placeholder="Search by invoice number, student name, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1656a6] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            {(["ALL", "GST", "NON_GST"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  typeFilter === filter
                    ? "bg-[#1656a6] text-[#F7F0E8] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {filter === "ALL" ? "All Types" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {emailMessage && (
        <div
          role={emailMessage.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            emailMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {emailMessage.text}
        </div>
      )}

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice No</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Collected By</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-[#1656a6] text-xs">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/students/${inv.studentId}`}
                        className="font-semibold text-slate-900 hover:text-[#1656a6] transition"
                      >
                        {inv.studentName}
                      </Link>
                      <div className="text-xs text-slate-400">
                        {inv.studentEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(inv.issuedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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
                        <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          {inv.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {inv.createdByName &&
                      inv.createdByName.toLowerCase() !== "admin" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {inv.createdByName}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              inv.createdByRole === "HR"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-[#1656a6] border border-blue-200"
                            }`}
                          >
                            {inv.createdByRole || "ADMIN"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1656a6] border border-blue-200">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      ₹{Number(inv.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEmailInvoice(inv)}
                        disabled={
                          !inv.studentEmail ||
                          inv.studentEmail === "N/A" ||
                          emailingInvoiceId !== null
                        }
                        title={`Email PDF to ${inv.studentEmail || "student"}`}
                        aria-label={`Email invoice ${inv.invoiceNo} to ${inv.studentEmail || "student"}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition cursor-pointer"
                      >
                        {emailingInvoiceId === inv.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-[#F7F0E8] text-xs font-semibold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal with Clean Printable View */}
      {selectedInvoice && (
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
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="mt-6 space-y-6">
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
                    {selectedInvoice.invoiceType === "GST" && (
                      <p className="text-xs text-[#1656a6] font-mono mt-1 font-bold">
                        GSTIN: {company?.gstin || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-slate-900 block">
                    {selectedInvoice.invoiceNo}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Date:{" "}
                    {new Date(selectedInvoice.issuedAt).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1656a6] border border-blue-200 inline-block mt-1">
                    {selectedInvoice.invoiceType === "GST"
                      ? "TAX INVOICE"
                      : "PAYMENT RECEIPT"}
                  </span>
                </div>
              </div>

              {/* Student Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold uppercase block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedInvoice.studentName}
                </p>
                <p className="text-slate-500">{selectedInvoice.studentEmail}</p>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Description</th>
                      <th className="px-4 py-2.5 text-right">Taxable</th>
                      {selectedInvoice.invoiceType === "GST" && (
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
                          Payment Method: {selectedInvoice.paymentMethod}
                          {selectedInvoice.transactionRef &&
                            ` (Ref: ${selectedInvoice.transactionRef})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        ₹
                        {Number(selectedInvoice.taxableAmount).toLocaleString()}
                      </td>
                      {selectedInvoice.invoiceType === "GST" && (
                        <>
                          <td className="px-4 py-3 text-right text-slate-700">
                            ₹
                            {Number(
                              selectedInvoice.cgstAmount,
                            ).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-700">
                            ₹
                            {Number(
                              selectedInvoice.sgstAmount,
                            ).toLocaleString()}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 italic">
                  Thank you for learning with IZEON Innovative.
                </span>
                <div className="text-right">
                  <span className="text-slate-500 text-xs block">
                    Amount Paid
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
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
export default InvoicesPage;
