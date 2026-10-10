import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import api from "../api/client";

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "GST" | "NON_GST">("ALL");

  // Selected Invoice for Full Receipt Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/invoices");
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

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "ALL" || inv.invoiceType === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalCollected = invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const totalGst = invoices.reduce(
    (acc, curr) => acc + ((curr.cgstAmount || 0) + (curr.sgstAmount || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Invoices & Receipts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit trail of student fee receipts, GST compliance, and payment records
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          className="self-start sm:self-auto inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Invoices</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{invoices.length}</p>
          <p className="text-xs text-slate-500 mt-1">Issued for course enrollments & EMIs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gross Fee Inflow</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{totalCollected.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total revenue collected</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">GST Collected (18%)</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">
            ₹{Math.round(totalGst).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Split equally into CGST & SGST (9% each)</p>
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(["ALL", "GST", "NON_GST"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  typeFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter === "ALL" ? "All Types" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-400 text-xs">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/students/${inv.studentId}`}
                        className="font-semibold text-white hover:text-indigo-400 transition"
                      >
                        {inv.studentName}
                      </Link>
                      <div className="text-xs text-slate-400">{inv.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
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
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <span className="font-medium">{inv.paymentMethod}</span>
                      {inv.transactionRef && (
                        <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                          {inv.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                      ₹{Number(inv.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
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

      {/* Invoice Receipt Modal with Printable View */}
      {selectedInvoice && (
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
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="mt-6 space-y-6 text-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white">IZEON INNOVATIVE</h2>
                  <p className="text-xs text-slate-400">Academy of Computer Software Training</p>
                  <p className="text-xs text-slate-400">Tamil Nadu, India</p>
                  {selectedInvoice.invoiceType === "GST" && (
                    <p className="text-xs text-indigo-400 font-mono mt-1">
                      GSTIN: 33AAACI1234F1Z5
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-white block">
                    {selectedInvoice.invoiceNo}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Date: {new Date(selectedInvoice.issuedAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mt-1">
                    {selectedInvoice.invoiceType === "GST" ? "TAX INVOICE" : "PAYMENT RECEIPT"}
                  </span>
                </div>
              </div>

              {/* Student Info */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-slate-500 font-semibold uppercase block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-white text-sm">{selectedInvoice.studentName}</p>
                <p className="text-slate-400">{selectedInvoice.studentEmail}</p>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-950 text-slate-400 uppercase">
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
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white block">Course Fee Payment</span>
                        <span className="text-slate-500 text-[11px]">
                          Payment Method: {selectedInvoice.paymentMethod}
                          {selectedInvoice.transactionRef && ` (Ref: ${selectedInvoice.transactionRef})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        ₹{Number(selectedInvoice.taxableAmount).toLocaleString()}
                      </td>
                      {selectedInvoice.invoiceType === "GST" && (
                        <>
                          <td className="px-4 py-3 text-right text-slate-300">
                            ₹{Number(selectedInvoice.cgstAmount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            ₹{Number(selectedInvoice.sgstAmount).toLocaleString()}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-emerald-400">
                        ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 italic">
                  Thank you for learning with IZEON Innovative.
                </span>
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">Amount Paid</span>
                  <span className="text-lg font-bold text-white">
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
