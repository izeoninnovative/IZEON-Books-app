import React, { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  Receipt,
  Award,
  FileText,
  Printer,
  X,
  TrendingUp,
  LogIn,
  LogOut,
  CheckCircle2,
  Edit3,
  MapPin,
  Lock,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export const EmployeePortalPage: React.FC<{ initialTab?: "ATTENDANCE" | "PAYSLIPS" | "APPRAISALS" }> = ({
  initialTab = "ATTENDANCE",
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "PAYSLIPS" | "APPRAISALS">(
    initialTab
  );

  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [, setLoadingProfile] = useState(true);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today Attendance Punch State
  const [todayInfo, setTodayInfo] = useState<{ today: string; record: any; employee: any } | null>(null);
  const [, setLoadingToday] = useState(false);
  const [punching, setPunching] = useState(false);
  const [punchSuccess, setPunchSuccess] = useState<string | null>(null);
  const [punchError, setPunchError] = useState<string | null>(null);

  // Manual / Custom Punch Modal State
  const [showManualPunch, setShowManualPunch] = useState(false);
  const [manualForm, setManualForm] = useState({
    inTime: "",
    outTime: "",
    status: "PRESENT",
    notes: "",
  });

  // Attendance State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Salaries State
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loadingSalaries, setLoadingSalaries] = useState(false);
  const [activePayslip, setActivePayslip] = useState<any | null>(null);

  // Appraisals State
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [loadingAppraisals, setLoadingAppraisals] = useState(false);

  // Fetch today's attendance status
  const fetchTodayAttendance = async () => {
    try {
      setLoadingToday(true);
      const res = await api.get("/employee/today");
      setTodayInfo(res.data.data);
      if (res.data.data?.record) {
        setManualForm({
          inTime: res.data.data.record.inTime || "",
          outTime: res.data.data.record.outTime || "",
          status: res.data.data.record.status || "PRESENT",
          notes: res.data.data.record.notes || "",
        });
      }
    } catch (err) {
      console.error("Failed to load today's attendance:", err);
    } finally {
      setLoadingToday(false);
    }
  };

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

  // Quick punch Clock In or Clock Out
  const handleQuickPunch = async (type: "IN" | "OUT") => {
    try {
      setPunching(true);
      setPunchError(null);
      setPunchSuccess(null);

      // Acquire GPS location
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

      setPunchSuccess(
        type === "IN"
          ? `Clock-In registered at ${timeStr}! Status: ${record.status}${distStr}`
          : `Clock-Out registered at ${timeStr}! Total work: ${record.workHours}h${distStr}`
      );
      await fetchTodayAttendance();
      await fetchAttendance(selectedMonth, selectedYear);
    } catch (err: any) {
      setPunchError(err.response?.data?.message || err.message || "Failed to record punch");
    } finally {
      setPunching(false);
    }
  };

  // Submit manual / custom attendance entry
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPunching(true);
      setPunchError(null);
      setPunchSuccess(null);

      // Acquire GPS location
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
      setPunchSuccess(`Attendance entry saved successfully (${res.data.data?.status})!`);
      setShowManualPunch(false);
      await fetchTodayAttendance();
      await fetchAttendance(selectedMonth, selectedYear);
    } catch (err: any) {
      setPunchError(err.response?.data?.message || err.message || "Failed to save attendance");
    } finally {
      setPunching(false);
    }
  };

  // Fetch employee profile
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get("/employee/me");
      setProfile(res.data.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch attendance
  const fetchAttendance = async (m: number, y: number) => {
    try {
      setLoadingAttendance(true);
      const res = await api.get(`/employee/attendance?month=${m}&year=${y}`);
      setAttendanceData(res.data.data);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch salaries
  const fetchSalaries = async () => {
    try {
      setLoadingSalaries(true);
      const res = await api.get("/employee/salaries");
      setSalaries(res.data.data || []);
    } catch (err) {
      console.error("Failed to load salaries:", err);
    } finally {
      setLoadingSalaries(false);
    }
  };

  // Fetch appraisals
  const fetchAppraisals = async () => {
    try {
      setLoadingAppraisals(true);
      const res = await api.get("/employee/appraisals");
      setAppraisals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load appraisals:", err);
    } finally {
      setLoadingAppraisals(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTodayAttendance();
    fetchAttendance(selectedMonth, selectedYear);
    fetchSalaries();
    fetchAppraisals();
  }, []);

  useEffect(() => {
    if (activeTab === "ATTENDANCE") {
      fetchAttendance(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Employee Profile Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1656a6] via-[#144888] to-[#0e3566] text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xl text-white shadow-inner shrink-0">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "EM"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/20 font-mono font-bold">
                  {profile?.empCode || user?.empCode || "EMP"}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/20 font-bold uppercase tracking-wider">
                  Active Staff
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                {profile?.name || user?.username || "Employee"}
              </h2>
              <p className="text-xs text-blue-200/80">
                {profile?.role || user?.designation || "Staff"} • {profile?.department || user?.department || "Department"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-bold">
                Assigned Shift
              </span>
              <span className="font-mono font-bold flex items-center gap-1.5 mt-0.5 text-white">
                <Clock className="w-3.5 h-3.5 text-blue-300" />
                {profile?.shiftInTime || "09:30"} - {profile?.shiftOutTime || "18:30"}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-bold">
                Monthly Remuneration
              </span>
              <span className="font-mono font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                ₹{Number(profile?.baseSalary || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0">
        <button
          type="button"
          onClick={() => setActiveTab("ATTENDANCE")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "ATTENDANCE"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>My Attendance & Timings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYSLIPS")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "PAYSLIPS"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span>Salary & Payslips</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("APPRAISALS")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === "APPRAISALS"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>My Appraisals</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & TIMINGS */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-4">
          {/* Feedback Banners */}
          {punchSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{punchSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setPunchSuccess(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {punchError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{punchError}</span>
              </div>
              <button
                type="button"
                onClick={() => setPunchError(null)}
                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Daily Attendance Clock-In / Clock-Out Punch Card */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: Live Clock & Date */}
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                    todayInfo?.record?.outTime
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : todayInfo?.record?.inTime
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  <Clock className="w-7 h-7" />
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
                    {/* Status Badge */}
                    {todayInfo?.record?.outTime ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                        Shift Completed
                      </span>
                    ) : todayInfo?.record?.inTime ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Clocked In • {todayInfo.record.status}
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
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" • "}
                      <span className="text-slate-700 font-bold">
                        Shift: {profile?.shiftInTime || "09:30"} - {profile?.shiftOutTime || "18:30"}
                      </span>
                    </p>

                    {(todayInfo as any)?.policy?.geofenceEnabled && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1656a6] border border-blue-200">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Office Geofence Active (Within {(todayInfo as any).policy.geofenceRadiusMeters || 50}m)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* When NOT punched in */}
                {!todayInfo?.record?.inTime && (
                  <button
                    type="button"
                    disabled={punching}
                    onClick={() => handleQuickPunch("IN")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {punching
                        ? "Registering..."
                        : `Punch In (${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`}
                    </span>
                  </button>
                )}

                {/* When punched IN but not OUT */}
                {todayInfo?.record?.inTime && !todayInfo?.record?.outTime && (
                  <button
                    type="button"
                    disabled={punching}
                    onClick={() => handleQuickPunch("OUT")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1656a6] hover:bg-[#124587] active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>
                      {punching
                        ? "Registering..."
                        : `Punch Out (${currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`}
                    </span>
                  </button>
                )}

                {/* Custom / Manual Entry */}
                <button
                  type="button"
                  onClick={() => setShowManualPunch(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Permission / Reason Note</span>
                </button>
              </div>
            </div>

            {/* Attendance Details Strip for Today */}
            {todayInfo?.record?.inTime && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-semibold text-slate-500">In Time:</span>
                    <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {todayInfo.record.inTime}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-semibold text-slate-500">Out Time:</span>
                    <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {todayInfo.record.outTime || "In Progress"}
                    </strong>
                  </div>

                  {todayInfo.record.workHours > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-semibold text-slate-500">Duration:</span>
                      <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        {todayInfo.record.workHours} hrs
                      </strong>
                    </div>
                  )}

                  {todayInfo.record.isLate && (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Late: {todayInfo.record.lateMinutes} mins (Deduction: ₹{todayInfo.record.lateDeduction})
                    </span>
                  )}

                  {todayInfo.record.punchDistanceMeters !== null &&
                    todayInfo.record.punchDistanceMeters !== undefined && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Office Verified ({todayInfo.record.punchDistanceMeters}m)</span>
                      </span>
                    )}
                </div>

                {todayInfo.record.notes && (
                  <span className="text-slate-500 italic max-w-xs truncate">
                    Note: "{todayInfo.record.notes}"
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Month / Year Selector Header */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#1656a6]" />
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
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
                  ].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Assigned Shift In-Time:{" "}
              <strong className="text-slate-900 font-mono">
                {profile?.shiftInTime || "09:30"}
              </strong>{" "}
              (0 grace mins)
            </span>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Present Days
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {attendanceData?.presentDays || 0}
              </span>
              <span className="text-[10px] text-slate-400">Working days attended</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Permission Days
              </span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">
                {attendanceData?.permissionDays || 0}
              </span>
              <span className="text-[10px] text-slate-400">Approved permissions</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Late Arrivals
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {attendanceData?.totalLateDays || attendanceData?.lateDays || 0}
              </span>
              <span className="text-[10px] text-slate-400">After shift in-time</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Half Days
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {attendanceData?.halfDays || 0}
              </span>
              <span className="text-[10px] text-slate-400">Half day records</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Work Hours
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {attendanceData?.totalWorkHours || 0}h
              </span>
              <span className="text-[10px] text-slate-400">Logged duration</span>
            </div>
          </div>

          {/* 3 CONSECUTIVE LATE DAYS POLICY CARD */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Company Policy: 3 Consecutive Late Days Rule
                </h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  Arriving late for <strong>3 consecutive working days</strong> results in an automatic{" "}
                  <strong>1-day salary deduction</strong> (₹
                  {Math.round(Number(profile?.baseSalary || 0) / 30).toLocaleString()} per 3 days).
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-700">
                    Current Streak:{" "}
                    <strong
                      className={`font-mono font-bold ${
                        (attendanceData?.currentConsecutiveLateDays || 0) >= 2
                          ? "text-rose-600"
                          : "text-slate-900"
                      }`}
                    >
                      {attendanceData?.currentConsecutiveLateDays || 0} / 3 day(s)
                    </strong>
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Consecutive Penalties Triggered:{" "}
                    <strong className="font-mono font-bold text-rose-600">
                      {attendanceData?.consecutivePenaltyDays || 0} day(s)
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 shrink-0 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Consecutive Late Deduction
              </span>
              <span className="text-lg font-mono font-black text-rose-600">
                -₹{Number(attendanceData?.consecutiveLateDeduction || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Timing Log Records
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {attendanceData?.records?.length || 0} entries
              </span>
            </div>

            {loadingAttendance ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading attendance logs...
              </div>
            ) : !attendanceData?.records || attendanceData.records.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No attendance logs found for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">In-Time (Entry)</th>
                      <th className="px-5 py-3">Out-Time (Exit)</th>
                      <th className="px-5 py-3">Work Hours</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Penalty</th>
                      <th className="px-5 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceData.records.map((row: any) => {
                      const isLate =
                        (row.isLate || row.status === "LATE") &&
                        row.status !== "PERMISSION";
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3 font-mono font-bold text-slate-900">
                            {row.date}
                          </td>
                          <td className="px-5 py-3 font-mono font-semibold text-slate-800">
                            {row.inTime || "-"}
                          </td>
                          <td className="px-5 py-3 font-mono text-slate-600">
                            {row.outTime || "-"}
                          </td>
                          <td className="px-5 py-3 font-mono text-slate-700">
                            {Number(row.workHours || 0)}h
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                row.status === "PERMISSION"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : isLate
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : row.status === "HALF_DAY"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : row.status === "ABSENT"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {row.status === "PERMISSION"
                                ? "Permission"
                                : isLate
                                ? "Late Arrival"
                                : row.status === "HALF_DAY"
                                ? "Half Day"
                                : row.status === "ABSENT"
                                ? "Absent"
                                : "Present"}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono">
                            {Number(row.lateDeduction) > 0 ? (
                              <span className="text-rose-600 font-bold">
                                -₹{Number(row.lateDeduction).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">₹0</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            {row.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SALARY & PAYSLIPS */}
      {activeTab === "PAYSLIPS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Disbursed Salary History & Payslips
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {salaries.length} records
              </span>
            </div>

            {loadingSalaries ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading salary history...
              </div>
            ) : salaries.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No salary disbursements recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Period</th>
                      <th className="px-5 py-3">Payment Date</th>
                      <th className="px-5 py-3">Base Salary</th>
                      <th className="px-5 py-3">LOP Days</th>
                      <th className="px-5 py-3">Late Penalty</th>
                      <th className="px-5 py-3 text-right">Net Paid</th>
                      <th className="px-5 py-3 text-center">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salaries.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {[
                            "",
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
                          ][sal.month]}{" "}
                          {sal.year}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {new Date(sal.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          ₹{Number(sal.baseSalary || sal.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {Number(sal.lopDays) > 0 ? (
                            <span className="text-rose-600 font-bold">
                              {sal.lopDays} days (-₹{Number(sal.lopDeduction).toLocaleString()})
                            </span>
                          ) : (
                            "0 days"
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {Number(sal.lateDeduction) > 0 ? (
                            <span className="text-rose-600 font-bold">
                              -₹{Number(sal.lateDeduction).toLocaleString()}
                            </span>
                          ) : (
                            "₹0"
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                          ₹{Number(sal.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setActivePayslip(sal)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1656a6] font-bold text-xs cursor-pointer transition shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: APPRAISALS */}
      {activeTab === "APPRAISALS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Appraisal & Performance Review History
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {appraisals.length} reviews
              </span>
            </div>

            {loadingAppraisals ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading appraisals...
              </div>
            ) : appraisals.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No appraisal reviews recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appraisals.map((app) => (
                  <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#1656a6] text-[10px] font-bold uppercase tracking-wider">
                          {app.rating || "EXCELLENT"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Reviewed on: {app.appraisalDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-slate-400 line-through font-mono">
                          ₹{Number(app.previousSalary).toLocaleString()}
                        </span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-lg font-black text-emerald-600 font-mono">
                          ₹{Number(app.newSalary).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          +{Number(app.incrementPercentage || 0).toFixed(1)}% (+₹{Number(app.incrementAmount || 0).toLocaleString()})
                        </span>
                      </div>
                      {app.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    {app.nextAppraisalDate && (
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          Next Review Due
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {app.nextAppraisalDate}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYSLIP MODAL */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1656a6] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Payslip</h3>
                  <p className="text-[11px] text-slate-400">
                    {[
                      "",
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
                    ][activePayslip.month]}{" "}
                    {activePayslip.year}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePayslip(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{profile?.name}</span>
                  <span className="text-[11px] text-slate-500">{profile?.empCode} • {profile?.role}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Mode</span>
                  <span className="font-bold text-slate-700">{activePayslip.paymentMethod || "NETBANKING"}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Salary</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{Number(activePayslip.baseSalary || activePayslip.amount).toLocaleString()}
                  </span>
                </div>
                {Number(activePayslip.lopDeduction) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Loss of Pay ({activePayslip.lopDays} days)</span>
                    <span className="font-mono font-bold">
                      -₹{Number(activePayslip.lopDeduction).toLocaleString()}
                    </span>
                  </div>
                )}
                {Number(activePayslip.lateDeduction) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Late Arrival Deduction (Inc. 3-day rule)</span>
                    <span className="font-mono font-bold">
                      -₹{Number(activePayslip.lateDeduction).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-slate-100 text-sm">
                  <span className="text-slate-900">Net Disbursed</span>
                  <span className="font-mono font-black text-emerald-600">
                    ₹{Number(activePayslip.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Payslip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom / Manual Attendance Punch Modal */}
      {showManualPunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1656a6] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Daily Attendance Entry
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Record your timing or request permission for today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualPunch(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
              {/* Tamper-Proof Security Notice */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block text-amber-950">
                    Tamper-Proof Live Clock & Geofence:
                  </span>
                  Exact entry & exit timings are strictly recorded from the live clock and office GPS. Manual time modification is prohibited. Use this form to register an official reason note or request permission status.
                </div>
              </div>

              {/* Locked Timing Display */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Clock In Time</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Locked 🔒
                    </span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      {todayInfo?.record?.inTime ||
                        currentTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Clock Out Time</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded">
                      Locked 🔒
                    </span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      {todayInfo?.record?.outTime ||
                        (todayInfo?.record?.inTime
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attendance Status / Request
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6] cursor-pointer"
                >
                  <option value="PRESENT">Present (Standard Shift Entry)</option>
                  <option value="PERMISSION">
                    Permission (Approved Late / Early Exit - Waives Fine)
                  </option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Selecting <strong>Permission</strong> waives late arrival penalty if authorized.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason / Remarks
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, notes: e.target.value })
                  }
                  placeholder="e.g., Client on-site meeting / Personal permission approved / WFH"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualPunch(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={punching}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{punching ? "Saving..." : "Save Entry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
