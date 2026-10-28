import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Receipt,
  IndianRupee,
  CalendarClock,
  ArrowUpRight,
  UserPlus,
  ArrowRight,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  MapPin,
  Lock,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/interview logo.png";

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Attendance Punch State for Logged-in Staff / HR
  const [todayAttendance, setTodayAttendance] = useState<{ today: string; record: any; employee: any; policy?: any } | null>(null);
  const [punching, setPunching] = useState(false);
  const [punchMsg, setPunchMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    inTime: "",
    outTime: "",
    status: "PRESENT",
    notes: "",
  });

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get("/employee/today");
      if (res.data?.data) {
        setTodayAttendance(res.data.data);
        if (res.data.data.record) {
          setManualForm({
            inTime: res.data.data.record.inTime || "",
            outTime: res.data.data.record.outTime || "",
            status: res.data.data.record.status || "PRESENT",
            notes: res.data.data.record.notes || "",
          });
        }
      }
    } catch (err: any) {
      console.warn("Notice loading attendance:", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, invoicesRes] = await Promise.all([
          api.get("/students"),
          api.get("/payments/invoices"),
        ]);
        setStudents(studentsRes.data.data || []);
        setInvoices(invoicesRes.data.data || []);

        if (isAdmin) {
          const reportRes = await api.get("/admin/reports?filter=month");
          setReport(reportRes.data.data || null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchTodayAttendance();
  }, [isAdmin]);

  const getGpsCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS Geolocation is not supported by your browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            reject(
              new Error(
                "Location Permission Denied: You must allow browser GPS location access to clock in/out. Attendance is strictly restricted to office premises."
              )
            );
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            reject(
              new Error(
                "Unable to determine GPS coordinates. Please ensure location services are turned on on your device."
              )
            );
          } else if (err.code === err.TIMEOUT) {
            reject(new Error("Location request timed out. Please try again."));
          } else {
            reject(new Error(err.message || "Failed to retrieve GPS location"));
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  };

  const handleQuickPunch = async (type: "IN" | "OUT") => {
    try {
      setPunching(true);
      setPunchMsg(null);

      // Acquire GPS coordinates to verify office location
      const coords = await getGpsCoordinates();

      const res = await api.post("/employee/punch", {
        type,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const record = res.data.data;
      const timeStr = type === "IN" ? record.inTime : record.outTime;
      const distStr =
        record.punchDistanceMeters !== undefined && record.punchDistanceMeters !== null
          ? ` • Verified in office (${record.punchDistanceMeters}m)`
          : "";

      setPunchMsg({
        type: "success",
        text:
          type === "IN"
            ? `Clock-In registered at ${timeStr}! Status: ${record.status}${distStr}`
            : `Clock-Out registered at ${timeStr}! Total work: ${record.workHours}h${distStr}`,
      });
      await fetchTodayAttendance();
    } catch (err: any) {
      setPunchMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to record punch",
      });
    } finally {
      setPunching(false);
    }
  };

  const handleManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPunching(true);
      setPunchMsg(null);

      // Acquire GPS coordinates to verify office location
      const coords = await getGpsCoordinates();

      const res = await api.post("/employee/punch", {
        type: "MANUAL",
        inTime: manualForm.inTime || undefined,
        outTime: manualForm.outTime || undefined,
        status: manualForm.status,
        notes: manualForm.notes || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setPunchMsg({
        type: "success",
        text: `Attendance entry saved successfully (${res.data.data?.status})!`,
      });
      setShowManualModal(false);
      await fetchTodayAttendance();
    } catch (err: any) {
      setPunchMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to save attendance",
      });
    } finally {
      setPunching(false);
    }
  };

  const myInvoices = useMemo(() => invoices.filter((inv) => inv.createdById === user?.id), [invoices, user])
  const myRevenue = useMemo(() =>  myInvoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0), [myInvoices])
  const totalCompanyRevenue = useMemo(() => invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0 ), 0), [invoices] )

  const totalBalance = useMemo(
    () => students.reduce((acc, curr) => acc + (curr.feePlan?.balanceAmount || 0), 0),
    [students]
  );

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner (Royal Blue & Crimson Gradient on Clean Canvas) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1656a6] via-[#13488d] to-[#103b6f] text-[#F7F0E8] shadow-lg shadow-blue-900/15 relative overflow-hidden">
        {/* Background ambient logo watermark */}
        <div className="absolute -right-8 -bottom-8 w-52 h-52 opacity-15 pointer-events-none rounded-full overflow-hidden bg-white/20 p-2 blur-[0.5px]">
          <img src={logoImg} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-md ring-2 ring-white/30 flex items-center justify-center shrink-0 hidden sm:flex">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-[#F7F0E8]/90 border border-white/20 backdrop-blur-xs">
                IZEON Books Management
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F7F0E8] mt-2 tracking-tight">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-sm text-blue-100/80 mt-1 max-w-xl">
                Track student admissions, lumpsum & EMI fees, GST invoices, and financial reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/students/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#1656a6] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[#1656a6]" />
              <span>New Admission</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Clock-In / Clock-Out Punch Card for HR & Staff */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        {punchMsg && (
          <div
            className={`mb-4 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              punchMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {punchMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{punchMsg.text}</span>
            </div>
            <button
              onClick={() => setPunchMsg(null)}
              className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Clock, Status, Shift info */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                todayAttendance?.record?.outTime
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : todayAttendance?.record?.inTime
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>

                {todayAttendance?.record?.outTime ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                    Shift Completed
                  </span>
                ) : todayAttendance?.record?.inTime ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Clocked In • {todayAttendance.record.status}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Pending Clock-In
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-1">
                <p className="text-xs font-semibold text-slate-500">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" • "}
                  <span className="text-slate-700 font-bold">
                    Shift: {todayAttendance?.employee?.shiftInTime || "09:30"} -{" "}
                    {todayAttendance?.employee?.shiftOutTime || "18:30"}
                  </span>
                  {todayAttendance?.employee?.empCode && (
                    <span className="ml-1.5 font-mono text-slate-400">
                      ({todayAttendance.employee.empCode})
                    </span>
                  )}
                </p>

                {todayAttendance?.policy?.geofenceEnabled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1656a6] border border-blue-200">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>Office Geofence Active ({todayAttendance.policy.geofenceRadiusMeters || 50}m)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Punch Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {!todayAttendance?.record?.inTime && (
              <button
                type="button"
                disabled={punching}
                onClick={() => handleQuickPunch("IN")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {punching
                    ? "Registering..."
                    : `Punch In (${currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })})`}
                </span>
              </button>
            )}

            {todayAttendance?.record?.inTime && !todayAttendance?.record?.outTime && (
              <button
                type="button"
                disabled={punching}
                onClick={() => handleQuickPunch("OUT")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>
                  {punching
                    ? "Registering..."
                    : `Punch Out (${currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })})`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Permission / Reason Note</span>
            </button>

            <Link
              to="/my-attendance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-xs transition"
            >
              <span>My Register</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Detailed strip if already clocked in */}
        {todayAttendance?.record?.inTime && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="font-semibold text-slate-500">In Time:</span>
                <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {todayAttendance.record.inTime}
                </strong>
              </div>

              {todayAttendance.record.outTime && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold text-slate-500">Out Time:</span>
                  <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {todayAttendance.record.outTime}
                  </strong>
                </div>
              )}

              {todayAttendance.record.workHours !== null && todayAttendance.record.workHours !== undefined && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold text-slate-500">Duration:</span>
                  <strong className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {todayAttendance.record.workHours} hrs
                  </strong>
                </div>
              )}

              {todayAttendance.record.isLate && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Late by {todayAttendance.record.lateMinutes} mins
                </span>
              )}

              {todayAttendance.record.punchDistanceMeters !== null &&
                todayAttendance.record.punchDistanceMeters !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Office Verified ({todayAttendance.record.punchDistanceMeters}m)</span>
                  </span>
                )}
            </div>

            {todayAttendance.record.notes && (
              <span className="text-[11px] text-slate-500 italic max-w-sm truncate" title={todayAttendance.record.notes}>
                Note: "{todayAttendance.record.notes}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metrics Row (Crisp White Cards with Slate Accents) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 sm:gap-6`}>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1656a6] border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{students.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active admissions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? "Total Company Revenue" : "My Generated Revenue"}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">
            ₹{(isAdmin ? totalCompanyRevenue : myRevenue).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isAdmin
              ? `${invoices.length} company invoices`
              : `${myInvoices.length} invoices generated by you`}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Balances</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-3">
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming EMI dues</span>
        </div>

        {isAdmin && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Net Profit (Monthly)</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#1656a6] mt-3">
              ₹{(report?.summary?.netProfit ?? totalCompanyRevenue).toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">After office & staff costs</span>
          </div>
        )}
      </div>

      {/* Recent Admissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students Table (Clean White Card) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Enrolled Students</h3>
              <p className="text-xs text-slate-500">Latest admission records</p>
            </div>
            <Link
              to="/students"
              className="text-xs text-[#1656a6] hover:text-[#124587] flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading student records...</p>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No students enrolled yet.{" "}
              <Link to="/students/new" className="text-[#1656a6] underline font-medium">
                Add first admission
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Balance</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </td>
                      <td className="py-3 text-slate-600">{s.courseTitle}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.feePlan?.planType === "EMI"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {s.feePlan?.planType || "LUMPSUM"}
                        </span>
                      </td>
                      <td className="py-3">
                        {s.feePlan?.balanceAmount > 0 ? (
                          <span className="text-amber-600 font-bold">
                            ₹{s.feePlan.balanceAmount.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/students/${s.id}`}
                          className="inline-flex p-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-600 hover:text-[#F7F0E8] transition"
                          title="View Ledger"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Card */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-5">Common accounting & admission tasks</p>

            <div className="space-y-3">
              <Link
                to="/students/new"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition group"
              >
                <div className="p-2 rounded-lg bg-blue-100/70 text-[#1656a6] group-hover:bg-[#1656a6] group-hover:text-[#F7F0E8] transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Enroll Student</h4>
                  <p className="text-[11px] text-slate-500">Generate GST / Non-GST fees</p>
                </div>
              </Link>

              <Link
                to="/invoices"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 transition group"
              >
                <div className="p-2 rounded-lg bg-sky-100/70 text-sky-700 group-hover:bg-sky-600 group-hover:text-[#F7F0E8] transition">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Browse Invoices</h4>
                  <p className="text-[11px] text-slate-500">View or download bills</p>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  to="/reports"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 transition group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-[#F7F0E8] transition">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Financial P&L</h4>
                    <p className="text-[11px] text-slate-500">Revenue vs expenses & salaries</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom / Manual Attendance Punch Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1656a6] flex items-center justify-center border border-blue-200/80">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Log Attendance Note & Permission
                </h3>
                <p className="text-xs text-slate-500">
                  Submit official reason note or permission for late arrival/exit
                </p>
              </div>
            </div>

            <form onSubmit={handleManualPunch} className="space-y-4">
              {/* Tamper-Proof Security Badge */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block text-amber-950">
                    Tamper-Proof Live Clock & Geofence:
                  </span>
                  Exact entry & exit timings are strictly recorded from the live clock and office GPS. Manual time modification is prohibited for staff and HR.
                </div>
              </div>

              {/* Locked Timing Display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Clock-In Time</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Locked 🔒
                    </span>
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-between">
                    <span>
                      {todayAttendance?.record?.inTime ||
                        currentTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Clock-Out Time</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Locked 🔒
                    </span>
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-between">
                    <span>
                      {todayAttendance?.record?.outTime ||
                        (todayAttendance?.record?.inTime
                          ? currentTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--:--")}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Status / Request
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#1656a6]"
                >
                  <option value="PRESENT">PRESENT (Standard Entry)</option>
                  <option value="PERMISSION">PERMISSION (Approved Official / Late / Early Exit)</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Reason Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved morning 1-hour permission for client interview"
                  value={manualForm.notes}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={punching}
                  className="px-5 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {punching ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
