import React, { useEffect, useState } from "react";
import {
  Building2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  Mail,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import api from "../api/client";

export const CompanySettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: "IZEON INNOVATIVE",
    tagline: "Academy of Computer Software Training",
    gstin: "",
    address: "Tamil Nadu, India",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    phone: "",
    email: "",
    website: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/company");
      if (res.data.data) {
        setForm({
          companyName: res.data.data.companyName || "IZEON INNOVATIVE",
          tagline: res.data.data.tagline || "",
          gstin: res.data.data.gstin || "",
          address: res.data.data.address || "",
          city: res.data.data.city || "",
          state: res.data.data.state || "Tamil Nadu",
          pincode: res.data.data.pincode || "",
          phone: res.data.data.phone || "",
          email: res.data.data.email || "",
          website: res.data.data.website || "",
        });
      }
    } catch (err: any) {
      console.error("Failed to load company profile:", err);
      setErrorMsg("Failed to load existing company details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.put("/company", form);
      setSuccessMsg("Company & GST details saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to update company profile:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  const isGstinValid = !form.gstin || form.gstin.length === 15;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Building2 className="w-7 h-7 text-[#1656a6]" />
          <span>Company & GST Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure legal entity details, official GSTIN, registered academy address, and receipt contact information.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading company details...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Legal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1656a6] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Legal Entity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="e.g. IZEON INNOVATIVE"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tagline / Business Nature
                    </label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="e.g. Academy of Computer Software Training"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              {/* GSTIN Configuration Section */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1656a6] uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#1656a6]" />
                    Official GSTIN (Goods and Services Tax ID)
                  </h3>
                  {form.gstin && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                        isGstinValid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {form.gstin.length}/15 chars
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={15}
                    value={form.gstin}
                    onChange={(e) =>
                      setForm({ ...form, gstin: e.target.value.toUpperCase().replace(/\s/g, "") })
                    }
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-blue-300 text-slate-900 font-mono text-base tracking-widest uppercase focus:outline-none focus:border-[#1656a6]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    15-character statutory GST identification number. Appears on all Tax Invoices with 9% CGST + 9% SGST breakdown.
                  </p>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1656a6] uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Registered Office Address
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street Address / Premises
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Door No. 12, Main Road, Anna Nagar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Chennai"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State / UT
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      placeholder="e.g. 600001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              {/* Communication Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1656a6] uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Contact Details for Receipts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Official Phone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Accounts Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. billing@izeon.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="e.g. https://izeoninnovative.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1656a6] to-[#124587] hover:from-[#1b61bd] hover:to-[#1656a6] disabled:opacity-50 text-[#F7F0E8] font-bold text-sm shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Company & GST Details"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Invoice Preview (Crisp Official Card) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Receipt Header Preview
            </h3>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1656a6] border border-blue-200 mb-2 inline-block">
                  TAX INVOICE HEADER
                </span>
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  {form.companyName || "COMPANY NAME"}
                </h2>
                {form.tagline && (
                  <p className="text-xs text-slate-500 mt-0.5">{form.tagline}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {[form.address, form.city, form.state, form.pincode].filter(Boolean).join(", ")}
                </p>
                {form.gstin ? (
                  <p className="text-xs text-[#1656a6] font-mono font-bold mt-2">
                    GSTIN: {form.gstin}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 font-mono mt-2 italic">
                    (No GSTIN configured - Non-GST mode)
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {form.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{form.phone}</span>
                  </div>
                )}
                {form.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{form.email}</span>
                  </div>
                )}
                {form.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{form.website}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                All student invoices, installment receipts, and printable tax bills will automatically draw this company branding and GSTIN.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CompanySettingsPage;
