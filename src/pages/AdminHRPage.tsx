/** @format */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Calendar,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Clock,
  IndianRupee,
  Search,
  Filter,
  Save,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  UserCheck,
  Award,
  EllipsisVertical,
  FileSpreadsheet,
  Download,
  MapPin,
  Navigation,
  Globe,
} from "lucide-react";
import api from "../api/client";
import { exportAttendanceRegisterToExcel } from "../utils/excelExport";

export const AdminHRPage: React.FC = () => {
  const navigate = useNavigate();
  // Navigation Tabs: STAFF_DIRECTORY | ATTENDANCE | POLICY
  const [activeTab, setActiveTab] = useState<
    "STAFF_DIRECTORY" | "ATTENDANCE" | "POLICY"
  >("STAFF_DIRECTORY");

  // Staff / Employees & HR State
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Attendance Policy State (Admin Controlled)
  const [policy, setPolicy] = useState({
    expectedInTime: "09:30",
    expectedOutTime: "18:30",
    gracePeriodMinutes: 0,
    lateDeductionPerDay: 100,
    lateDeduction900: 100,
    lateDeduction930: 100,
    deductionType: "FLAT",
    geofenceEnabled: true,
    officeLatitude: 13.0827,
    officeLongitude: 80.2707,
    geofenceRadiusMeters: 50,
    officeAddress: "IZEON INNOVATIVE, Tamil Nadu",
  });
  const [policySaving, setPolicySaving] = useState(false);
  const [policySuccess, setPolicySuccess] = useState<string | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Daily Attendance State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Attendance Register Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<
    "DATE" | "MONTH" | "RANGE" | "ALL"
  >("DATE");
  const [exportStartDate, setExportStartDate] = useState(selectedDate);
  const [exportEndDate, setExportEndDate] = useState(selectedDate);
  const [exportEmployeeId, setExportEmployeeId] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Add Staff Modal State (Both HR & Employee)
  const [showAddModal, setShowAddModal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showActionModal === null) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !actionRef.current?.contains(event.target)
      ) {
        setShowActionModal(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showActionModal]);

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "HR",
    department: "Human Resources",
    joiningDate: new Date().toISOString().split("T")[0],
    baseSalary: 20000,
    appraisalDate: "",
    lastAppraisalDate: "",
    lastAppraisalSalary: 0,
    lastAppraisalNotes: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    notes: "",
    // Shift Timing Assignment
    shiftInTime: "09:30",
    shiftOutTime: "18:30",
    gracePeriodMinutes: 0,
    // Login Credentials
    createLogin: true,
    loginPassword: "",
    userRole: "EMPLOYEE" as "EMPLOYEE" | "HR" | "ADMIN",
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [editStaffForm, setEditStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "HR",
    department: "",
    joiningDate: "",
    baseSalary: 0,
    appraisalDate: "",
    lastAppraisalDate: "",
    lastAppraisalSalary: 0,
    lastAppraisalNotes: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    notes: "",
    loginPassword: "",
    shiftInTime: "09:30",
    shiftOutTime: "18:30",
    gracePeriodMinutes: 0,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Quick Single Attendance Log Modal State
  const [quickAttStaff, setQuickAttStaff] = useState<any | null>(null);
  const [quickAttForm, setQuickAttForm] = useState({
    date: new Date().toISOString().split("T")[0],
    inTime: "09:30",
    outTime: "18:30",
    status: "PRESENT",
    lateDeduction: 0,
    notes: "",
  });
  const [submittingQuickAtt, setSubmittingQuickAtt] = useState(false);

  // Fetch all staff / employees
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await api.get("/admin/employees");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch attendance policy
  const fetchPolicy = async () => {
    try {
      const res = await api.get("/admin/attendance/policy");
      if (res.data.data) {
        const d = res.data.data;
        const def = Number(d.lateDeductionPerDay) || 100;
        setPolicy({
          expectedInTime: d.expectedInTime || "09:30",
          expectedOutTime: d.expectedOutTime || "18:30",
          gracePeriodMinutes: Number(d.gracePeriodMinutes) || 0,
          lateDeductionPerDay: def,
          lateDeduction900:
            d.lateDeduction900 !== null && d.lateDeduction900 !== undefined
              ? Number(d.lateDeduction900)
              : def,
          lateDeduction930:
            d.lateDeduction930 !== null && d.lateDeduction930 !== undefined
              ? Number(d.lateDeduction930)
              : def,
          deductionType: d.deductionType || "FLAT",
          geofenceEnabled: d.geofenceEnabled !== false,
          officeLatitude:
            d.officeLatitude !== null && d.officeLatitude !== undefined
              ? Number(d.officeLatitude)
              : 13.0827,
          officeLongitude:
            d.officeLongitude !== null && d.officeLongitude !== undefined
              ? Number(d.officeLongitude)
              : 80.2707,
          geofenceRadiusMeters:
            d.geofenceRadiusMeters !== null && d.geofenceRadiusMeters !== undefined
              ? Number(d.geofenceRadiusMeters)
              : 50,
          officeAddress: d.officeAddress || "IZEON INNOVATIVE, Tamil Nadu",
        });
      }
    } catch (err) {
      console.error("Failed to fetch attendance policy:", err);
    }
  };

  // Detect Admin's Current Location to autofill Office GPS
  const handleDetectOfficeGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setDetectingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        setPolicy((prev) => ({
          ...prev,
          officeLatitude: parseFloat(pos.coords.latitude.toFixed(6)),
          officeLongitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        setDetectingGps(false);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please allow location access in your browser."
            : "Could not detect GPS position. Try again or enter manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fetch attendance records for selected date
  const fetchAttendanceForDate = async (dateStr: string) => {
    try {
      setLoadingAttendance(true);
      const res = await api.get(`/admin/attendance/date?date=${dateStr}`);
      setAttendanceList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPolicy();
  }, []);

  useEffect(() => {
    if (activeTab === "ATTENDANCE") {
      fetchAttendanceForDate(selectedDate);
    }
  }, [activeTab, selectedDate]);

  // Handle Save Policy (Admin Decision)
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaving(true);
    setPolicySuccess(null);
    try {
      await api.put("/admin/attendance/policy", {
        ...policy,
        gracePeriodMinutes: Number(policy.gracePeriodMinutes) || 0,
        lateDeduction900: Number(policy.lateDeduction900) || 0,
        lateDeduction930: Number(policy.lateDeduction930) || 0,
        lateDeductionPerDay:
          Number(policy.lateDeduction930) ||
          Number(policy.lateDeductionPerDay) ||
          100,
        geofenceEnabled: Boolean(policy.geofenceEnabled),
        officeLatitude: Number(policy.officeLatitude) || 13.0827,
        officeLongitude: Number(policy.officeLongitude) || 80.2707,
        geofenceRadiusMeters: Number(policy.geofenceRadiusMeters) || 50,
        officeAddress: policy.officeAddress || "IZEON INNOVATIVE, Tamil Nadu",
      });
      setPolicySuccess(
        "Admin attendance, shift late deduction & office geofence policy saved successfully!",
      );
      setTimeout(() => setPolicySuccess(null), 3000);
      fetchAttendanceForDate(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update policy");
    } finally {
      setPolicySaving(false);
    }
  };

  // Handle Add New Staff / HR
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffSuccess(null);
    setSubmittingStaff(true);

    try {
      await api.post("/admin/employees", {
        name: staffForm.name,
        email: staffForm.email || undefined,
        phone: staffForm.phone || undefined,
        role: staffForm.role,
        department: staffForm.department || undefined,
        joiningDate: staffForm.joiningDate || undefined,
        baseSalary: Number(staffForm.baseSalary) || 0,
        appraisalDate: staffForm.appraisalDate || undefined,
        lastAppraisalDate: staffForm.lastAppraisalDate || undefined,
        lastAppraisalSalary: Number(staffForm.lastAppraisalSalary) || undefined,
        lastAppraisalNotes: staffForm.lastAppraisalNotes || undefined,
        bankName: staffForm.bankName || undefined,
        accountNumber: staffForm.accountNumber || undefined,
        ifscCode: staffForm.ifscCode || undefined,
        notes: staffForm.notes || undefined,
        createLogin: staffForm.createLogin,
        loginPassword: staffForm.createLogin
          ? staffForm.loginPassword
          : undefined,
        userRole: staffForm.userRole,
        shiftInTime: staffForm.shiftInTime?.trim() || "09:30",
        shiftOutTime: staffForm.shiftOutTime?.trim() || "18:30",
        gracePeriodMinutes: Number(staffForm.gracePeriodMinutes) || 0,
      });

      setStaffSuccess(
        `Staff member "${staffForm.name}" created successfully in Employment!`,
      );
      fetchEmployees();
      setTimeout(() => {
        setShowAddModal(false);
        setStaffSuccess(null);
        setStaffForm({
          name: "",
          email: "",
          phone: "",
          role: "HR",
          department: "Human Resources",
          joiningDate: new Date().toISOString().split("T")[0],
          baseSalary: 20000,
          appraisalDate: "",
          lastAppraisalDate: "",
          lastAppraisalSalary: 0,
          lastAppraisalNotes: "",
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          notes: "",
          shiftInTime: "09:30",
          shiftOutTime: "18:30",
          gracePeriodMinutes: 0,
          createLogin: true,
          loginPassword: "",
          userRole: "EMPLOYEE",
        });
      }, 1500);
    } catch (err: any) {
      setStaffError(
        err.response?.data?.message || "Failed to create staff member",
      );
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (emp: any) => {
    setEditingStaff(emp);
    setEditStaffForm({
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      role: emp.role || "HR",
      department: emp.department || "",
      joiningDate: emp.joiningDate || "",
      baseSalary: Number(emp.baseSalary) || 0,
      appraisalDate: emp.appraisalDate || "",
      lastAppraisalDate: emp.lastAppraisalDate || "",
      lastAppraisalSalary: Number(emp.lastAppraisalSalary || 0),
      lastAppraisalNotes: emp.lastAppraisalNotes || "",
      status: emp.status || "ACTIVE",
      bankName: emp.bankName || "",
      accountNumber: emp.accountNumber || "",
      ifscCode: emp.ifscCode || "",
      notes: emp.notes || "",
      loginPassword: "",
      shiftInTime: emp.shiftInTime || "09:30",
      shiftOutTime: emp.shiftOutTime || "18:30",
      gracePeriodMinutes:
        emp.gracePeriodMinutes !== null && emp.gracePeriodMinutes !== undefined
          ? Number(emp.gracePeriodMinutes)
          : 0,
    });
    setEditError(null);
    setEditSuccess(null);
  };

  // Handle Update Staff
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditError(null);
    setEditSuccess(null);
    setSubmittingEdit(true);

    try {
      await api.put(`/admin/employees/${editingStaff.id}`, {
        ...editStaffForm,
        baseSalary: Number(editStaffForm.baseSalary) || 0,
        gracePeriodMinutes: Number(editStaffForm.gracePeriodMinutes) || 0,
      });

      // If password provided and user account is linked, update User account
      if (editingStaff.userId && editStaffForm.loginPassword.trim()) {
        await api.put(`/admin/hr-users/${editingStaff.userId}`, {
          password: editStaffForm.loginPassword.trim(),
        });
      }

      setEditSuccess(`Staff "${editStaffForm.name}" updated successfully!`);
      fetchEmployees();
      setTimeout(() => {
        setEditingStaff(null);
        setEditSuccess(null);
      }, 1500);
    } catch (err: any) {
      setEditError(
        err.response?.data?.message || "Failed to update staff member",
      );
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Calculate late status helper in frontend (per-employee shift aware)
  const checkLateStatus = (
    inTime: string,
    empShiftInTime?: string,
    empGraceMinutes?: number,
  ) => {
    if (!inTime) return { isLate: false, lateMinutes: 0, lateDeduction: 0 };
    const clean = inTime.trim();
    const isPM = /pm/i.test(clean);
    const isAM = /am/i.test(clean);
    const parts = clean.replace(/[^0-9:]/g, "").split(":");
    if (parts.length < 2)
      return { isLate: false, lateMinutes: 0, lateDeduction: 0 };
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    const inMins = h * 60 + m;

    const baseExpected = empShiftInTime || policy.expectedInTime || "09:30";
    const expParts = baseExpected.split(":");
    const expMins =
      parseInt(expParts[0], 10) * 60 + parseInt(expParts[1] || "0", 10);
    const grace =
      empGraceMinutes !== undefined && empGraceMinutes !== null
        ? Number(empGraceMinutes)
        : Number(policy.gracePeriodMinutes) || 0;

    const is900 =
      baseExpected.trim().startsWith("09:00") ||
      baseExpected.trim().startsWith("9:00");
    const shiftDeduction = is900
      ? Number(policy.lateDeduction900 || policy.lateDeductionPerDay || 100)
      : Number(policy.lateDeduction930 || policy.lateDeductionPerDay || 100);

    const diff = inMins - expMins;
    if (diff > grace) {
      return {
        isLate: true,
        lateMinutes: diff,
        lateDeduction: shiftDeduction,
      };
    }
    return { isLate: false, lateMinutes: 0, lateDeduction: 0 };
  };

  // Update in-memory attendance row
  const handleAttendanceChange = (empId: number, field: string, value: any) => {
    setAttendanceList((prev) =>
      prev.map((row) => {
        if (row.employeeId !== empId) return row;
        const updated = { ...row, [field]: value };

        // If inTime changed, automatically recalculate late status against THIS employee's assigned shift
        if (field === "inTime") {
          // If status is PERMISSION or OD, do not auto-overwrite with LATE
          if (row.status === "PERMISSION" || row.status === "OD") {
            return updated;
          }
          const lateInfo = checkLateStatus(
            value,
            row.shiftInTime,
            row.gracePeriodMinutes,
          );
          updated.isLate = lateInfo.isLate;
          updated.lateMinutes = lateInfo.lateMinutes;
          // Set deduction to this employee's shift default if late
          if (lateInfo.isLate) {
            updated.lateDeduction = lateInfo.lateDeduction;
            updated.status = "LATE";
          } else {
            updated.lateDeduction = 0;
            updated.status = value ? "PRESENT" : "NOT_MARKED";
          }
        }
        return updated;
      }),
    );
  };

  // Save single attendance entry
  const handleSaveSingleAttendance = async (row: any) => {
    try {
      await api.post("/admin/attendance", {
        employeeId: row.employeeId,
        date: selectedDate,
        inTime: row.inTime,
        outTime: row.outTime,
        status: row.status,
        notes: row.notes,
        isLate: row.isLate,
        lateDeduction: Number(row.lateDeduction) || 0,
      });
      setAttendanceMsg({
        type: "success",
        text: `Attendance saved for ${row.name}! Late Deduction: ₹${row.lateDeduction || 0}`,
      });
      setTimeout(() => setAttendanceMsg(null), 3000);
      fetchAttendanceForDate(selectedDate);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save attendance");
    }
  };

  // Bulk save all attendance entries
  const handleSaveAllAttendance = async () => {
    setSavingAttendance(true);
    setAttendanceMsg(null);
    try {
      const entries = attendanceList
        .filter((r) => r.inTime || r.status !== "NOT_MARKED")
        .map((r) => ({
          employeeId: r.employeeId,
          inTime: r.inTime,
          outTime: r.outTime,
          status: r.status,
          isLate: r.isLate,
          lateDeduction: Number(r.lateDeduction) || 0,
          notes: r.notes,
        }));

      await api.post("/admin/attendance/bulk", {
        date: selectedDate,
        entries,
      });

      setAttendanceMsg({
        type: "success",
        text: `All attendance records for ${selectedDate} updated successfully!`,
      });
      setTimeout(() => setAttendanceMsg(null), 3500);
      fetchAttendanceForDate(selectedDate);
      fetchEmployees();
    } catch (err: any) {
      setAttendanceMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to bulk save attendance",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  // 1-Click Fill Individual Assigned Shift Times
  const handleFillStandardTimes = (onTimeOnly = false) => {
    setAttendanceList((prev) =>
      prev.map((row) => {
        if (onTimeOnly && row.inTime) return row;
        return {
          ...row,
          inTime: row.shiftInTime || policy.expectedInTime,
          outTime: row.shiftOutTime || policy.expectedOutTime,
          status: "PRESENT",
          isLate: false,
          lateMinutes: 0,
          lateDeduction: 0,
        };
      }),
    );
  };

  // Export Attendance Register to Excel (.xlsx)
  const handleExportAttendanceExcel = async (scopeOverride?: "CURRENT_DAY") => {
    try {
      setIsExporting(true);
      setExportError(null);

      const targetScope = scopeOverride ? "DATE" : exportScope;
      let exportEntries: any[] = [];
      let filename = `Attendance_Register_${selectedDate}.xlsx`;
      let sheetName = `Register_${selectedDate}`;

      if (targetScope === "DATE") {
        const targetDate = scopeOverride ? selectedDate : exportStartDate;
        filename = `Attendance_Register_${targetDate}.xlsx`;
        sheetName = `Day_${targetDate}`;

        if (targetDate === selectedDate && attendanceList.length > 0) {
          exportEntries = attendanceList.map((row) => ({
            date: targetDate,
            empCode: row.empCode,
            employeeName: row.name,
            role: row.role,
            department: row.department,
            assignedShift: `${row.shiftInTime || "09:30"} - ${row.shiftOutTime || "18:30"}`,
            inTime: row.inTime,
            outTime: row.outTime,
            workHours: row.workHours,
            status: row.status,
            isLate: row.isLate,
            lateMinutes: row.lateMinutes,
            lateDeduction: row.lateDeduction,
            notes: row.notes,
          }));
        } else {
          const res = await api.get(
            `/admin/attendance/register?startDate=${targetDate}&endDate=${targetDate}`,
          );
          exportEntries = res.data.data || [];
        }
      } else {
        const params = new URLSearchParams();
        if (targetScope === "MONTH") {
          const currentMonth = exportStartDate.slice(0, 7);
          params.append("month", currentMonth);
          filename = `Attendance_Register_${currentMonth}.xlsx`;
          sheetName = `Month_${currentMonth}`;
        } else if (targetScope === "RANGE") {
          if (exportStartDate) params.append("startDate", exportStartDate);
          if (exportEndDate) params.append("endDate", exportEndDate);
          filename = `Attendance_Register_${exportStartDate}_to_${exportEndDate}.xlsx`;
          sheetName = `Range_${exportStartDate.slice(5)}`;
        } else if (targetScope === "ALL") {
          filename = `Attendance_Register_All_${new Date().toISOString().split("T")[0]}.xlsx`;
          sheetName = "All Attendance";
        }

        if (exportEmployeeId !== "ALL") {
          params.append("employeeId", exportEmployeeId);
          const emp = employees.find((e) => e.id === Number(exportEmployeeId));
          if (emp) {
            filename = `Attendance_${emp.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
          }
        }

        const res = await api.get(
          `/admin/attendance/register?${params.toString()}`,
        );
        exportEntries = res.data.data || [];
      }

      if (exportEmployeeId !== "ALL" && targetScope === "DATE") {
        exportEntries = exportEntries.filter(
          (e) => e.employeeId === Number(exportEmployeeId),
        );
      }

      if (exportEntries.length === 0) {
        setExportError(
          "No attendance records found for the selected criteria.",
        );
        alert(
          "No attendance records found for the selected criteria to export.",
        );
        return;
      }

      exportAttendanceRegisterToExcel(exportEntries, {
        filename,
        sheetName,
      });

      if (!scopeOverride) {
        setShowExportModal(false);
      }
    } catch (err: any) {
      console.error("Export error:", err);
      setExportError(
        err.response?.data?.message || "Failed to export attendance records.",
      );
      alert(
        "Failed to export attendance register: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email &&
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.empCode &&
        emp.empCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "HR" && emp.role?.toUpperCase() === "HR") ||
      (roleFilter === "TRAINER" && emp.role?.toUpperCase().includes("TRAIN")) ||
      (roleFilter === "OTHER" &&
        emp.role?.toUpperCase() !== "HR" &&
        !emp.role?.toUpperCase().includes("TRAIN"));

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Staff & Employment Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage HR staff and employees in one unified directory with daily
            In/Out time tracking, automated late deductions, and payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              fetchEmployees();
              if (activeTab === "ATTENDANCE")
                fetchAttendanceForDate(selectedDate);
            }}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* <button
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "ATTENDANCE"
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Today's Attendance</span>
          </button> */}

          {/* <button
            onClick={() => setActiveTab("POLICY")}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "POLICY"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Late Policy Settings</span>
          </button> */}

          <button
            onClick={() => {
              setShowAddModal(true);
              setStaffError(null);
              setStaffSuccess(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] font-bold text-xs sm:text-sm shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff / HR</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("STAFF_DIRECTORY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "STAFF_DIRECTORY"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & HR Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ATTENDANCE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "ATTENDANCE"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily In-Time & Out-Time Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab("POLICY")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "POLICY"
              ? "bg-[#1656a6] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Admin Late Deduction Policy</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Employment
            </span>
            <Users className="w-4 h-4 text-[#1656a6]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {employees.length}
          </p>
          <span className="text-[11px] text-slate-400">
            {employees.filter((e) => e.role?.toUpperCase() === "HR").length} HRs
            • {employees.filter((e) => e.role?.toUpperCase() !== "HR").length}{" "}
            Other Staff
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Shift In-Time Policy
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {policy.expectedInTime} AM
          </p>
          <span className="text-[11px] text-rose-600 font-semibold">
            Strict: No Grace Window (Arrival after {policy.expectedInTime} is
            Late)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Late Penalty per Occurrence
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            ₹{policy.lateDeductionPerDay}
          </p>
          <span className="text-[11px] text-slate-400">
            Deducted from monthly salary
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total HR Revenue
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹
            {employees
              .reduce((sum, e) => sum + (e.totalRevenueGenerated || 0), 0)
              .toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-slate-400">
            Fee admissions by HR staff
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STAFF & EMPLOYMENT DIRECTORY */}
      {/* ========================================================= */}
      {activeTab === "STAFF_DIRECTORY" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, code, role, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#1656a6] cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="HR">HR Only</option>
                <option value="TRAINER">Trainers Only</option>
                <option value="OTHER">Other Staff</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            {loadingEmployees ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading staff & HR directory...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No staff members found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Staff / Employee</th>
                      <th className="px-6 py-3.5">Designation & Dept</th>
                      <th className="px-6 py-3.5">Assigned Shift</th>
                      <th className="px-6 py-3.5">Login Access</th>
                      <th className="px-6 py-3.5">Base Salary</th>
                      <th className="px-6 py-3.5">This Month's Late Penalty</th>
                      <th className="px-6 py-3.5">HR Revenue</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1656a6] font-bold text-sm flex items-center justify-center border border-blue-100 shrink-0">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{emp.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-500 font-semibold">
                                  {emp.empCode}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 block">
                                {emp.email || "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              emp.role?.toUpperCase() === "HR"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-[#1656a6] border border-blue-200"
                            }`}
                          >
                            {emp.role}
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {emp.department || "General"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-[#1656a6] border border-blue-200 w-fit">
                              <Clock className="w-3.5 h-3.5 text-[#1656a6]" />
                              {emp.shiftInTime || "09:30"} -{" "}
                              {emp.shiftOutTime || "18:30"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold pl-0.5">
                              Strict (No Grace)
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {emp.hasLoginAccount ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                              <UserCheck className="w-3.5 h-3.5" />
                              {emp.loginRole || "HR"} Portal Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              No portal login
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 font-mono">
                            ₹
                            {Number(emp.baseSalary || 0).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            per month
                          </span>
                          {emp.lastAppraisalDate ? (
                            <span
                              className="block text-[10px] text-emerald-700 font-medium mt-0.5"
                              title={emp.lastAppraisalNotes || undefined}
                            >
                              Last hike:{" "}
                              {new Date(
                                emp.lastAppraisalDate,
                              ).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              })}
                              {emp.lastAppraisalIncrement > 0 &&
                                ` (+₹${Number(emp.lastAppraisalIncrement).toLocaleString()})`}
                            </span>
                          ) : (
                            <span className="block text-[10px] text-slate-400 italic mt-0.5">
                              Initial Salary
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {emp.currentMonthLateDays > 0 ? (
                            <div>
                              <span className="font-bold text-rose-600 block text-xs">
                                ₹{emp.currentMonthLateDeduction} deducted
                              </span>
                              <span className="text-[11px] text-amber-600 font-medium">
                                {emp.currentMonthLateDays} late arrival(s)
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> On Time
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {emp.role?.toUpperCase() === "HR" ||
                          emp.totalRevenueGenerated > 0 ? (
                            <div>
                              <span className="font-extrabold text-emerald-600 block text-xs">
                                ₹
                                {(
                                  emp.totalRevenueGenerated || 0
                                ).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {emp.invoiceCount || 0} invoice(s)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right relative">
                          <div
                            className="relative inline-block text-left"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              className="p-1 hover:bg-slate-100 rounded-md transition text-slate-400 hover:text-slate-600"
                              onClick={() =>
                                setShowActionModal(
                                  showActionModal === emp.id ? null : emp.id,
                                )
                              }
                            >
                              <EllipsisVertical className="w-5 h-5" />
                            </button>
                            {showActionModal === emp.id && (
                              <div className="absolute right-0 z-60 flex flex-col gap-1 p-1.5 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[120px] text-left">
                                <button
                                  onClick={() => {
                                    setQuickAttStaff(emp);
                                    setQuickAttForm({
                                      date: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                      inTime:
                                        emp.shiftInTime ||
                                        policy.expectedInTime,
                                      outTime:
                                        emp.shiftOutTime ||
                                        policy.expectedOutTime,
                                      status: "PRESENT",
                                      lateDeduction: 0,
                                      notes: "",
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition cursor-pointer"
                                  title="Log In/Out Time"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Log Time</span>
                                </button>

                                <button
                                  onClick={() => navigate("/reports")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1656a6] text-xs font-semibold transition cursor-pointer"
                                  title="View and Record Appraisal in Reports"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Appraisal</span>
                                </button>

                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1656a6] text-slate-700 hover:text-white text-xs font-semibold transition cursor-pointer"
                                  title="Edit Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            )}
                          </div>
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

      {/* TAB 2: DAILY IN-TIME & OUT-TIME ATTENDANCE TRACKING */}

      {activeTab === "ATTENDANCE" && (
        <div className="space-y-4">
          {/* Date Selector & Action Header */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split("T")[0]);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-2xs cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1">
                  <Calendar className="w-4 h-4 text-[#1656a6]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="font-bold text-sm text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split("T")[0]);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-2xs cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Quick Fill, Excel Export & Bulk Save */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleFillStandardTimes(true)}
                className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1656a6] text-xs font-bold hover:bg-blue-100 cursor-pointer transition"
                title="Fill regular shift times for unmarked staff"
              >
                Auto-Fill Assigned Shifts
              </button>

              <button
                type="button"
                onClick={() => handleExportAttendanceExcel("CURRENT_DAY")}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer transition shadow-2xs"
                title="Download today's register as Excel spreadsheet (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Day</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportStartDate(selectedDate);
                  setExportEndDate(selectedDate);
                  setShowExportModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer transition shadow-2xs"
                title="Export custom date range or full attendance register to Excel"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export Register...</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAllAttendance}
                disabled={savingAttendance}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white font-bold text-xs shadow-xs cursor-pointer transition"
              >
                <Save className="w-4 h-4" />
                <span>
                  {savingAttendance
                    ? "Saving All..."
                    : "Save All Daily Entries"}
                </span>
              </button>
            </div>
          </div>

          {/* Admin Policy Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">
                  Individual Shift Timings & Late Deduction Active:
                </span>
                Each staff member is assigned their own individual shift (e.g.
                09:30–18:30, 09:00–18:00). Strict attendance rule (0 grace
                minutes) — arrival after their assigned shift in-time
                automatically marks
                <span className="font-bold text-rose-700"> LATE</span> with the
                configured deduction of
                <span className="font-mono font-bold text-rose-700">
                  {" "}
                  ₹{policy.lateDeductionPerDay}
                </span>
                . You can directly modify or waive any entry below!
              </div>
            </div>
            <button
              onClick={() => setActiveTab("POLICY")}
              className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold hover:bg-amber-100 cursor-pointer shrink-0"
            >
              Configure Rule
            </button>
          </div>

          {attendanceMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                attendanceMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{attendanceMsg.text}</span>
            </div>
          )}

          {/* Daily Attendance Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            {loadingAttendance ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                <div className="w-7 h-7 border-2 border-[#1656a6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading attendance for {selectedDate}...
              </div>
            ) : attendanceList.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No active staff found to mark attendance.
              </div>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-left text-sm min-w-[750px]">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200 font-semibold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Staff</th>
                      <th className="px-5 py-3.5">In-Time (Entry)</th>
                      <th className="px-5 py-3.5">Out-Time (Exit)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Late Deduction (₹)</th>
                      <th className="px-5 py-3.5">Notes</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceList.map((row) => (
                      <tr
                        key={row.employeeId}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">
                            {row.name}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {row.empCode} • {row.role}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#1656a6] border border-blue-200 font-mono font-bold">
                              <Clock className="w-2.5 h-2.5" />
                              {row.shiftInTime || "09:30"} -{" "}
                              {row.shiftOutTime || "18:30"}
                            </span>
                          </div>
                        </td>

                        {/* In-Time input */}
                        <td className="px-5 py-3.5">
                          {row.status === "OD" ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                                <span>OD (No Timing Required)</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder={row.shiftInTime || "09:30"}
                                value={row.inTime || ""}
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    row.employeeId,
                                    "inTime",
                                    e.target.value,
                                  )
                                }
                                className={`w-28 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none ${
                                  row.isLate
                                    ? "bg-rose-50 border-rose-300 text-rose-800"
                                    : "bg-white border-slate-200 text-slate-900"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date();
                                  const timeStr = now.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                  handleAttendanceChange(
                                    row.employeeId,
                                    "inTime",
                                    timeStr,
                                  );
                                }}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 cursor-pointer"
                                title="Set current time"
                              >
                                Now
                              </button>
                            </div>
                          )}
                          {row.status !== "OD" &&
                            row.punchDistanceMeters !== undefined &&
                            row.punchDistanceMeters !== null && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-1">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>
                                  Office GPS ({Math.round(row.punchDistanceMeters)}m)
                                </span>
                              </div>
                            )}
                        </td>

                        {/* Out-Time input */}
                        <td className="px-5 py-3.5">
                          {row.status === "OD" ? (
                            <span className="text-xs text-slate-400 font-medium italic">
                              Exempt (On Duty)
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="06:30 PM"
                                value={row.outTime || ""}
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    row.employeeId,
                                    "outTime",
                                    e.target.value,
                                  )
                                }
                                className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1656a6]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date();
                                  const timeStr = now.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                                  handleAttendanceChange(
                                    row.employeeId,
                                    "outTime",
                                    timeStr,
                                  );
                                }}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 cursor-pointer"
                                title="Set current time"
                              >
                                Now
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status dropdown */}
                        <td className="px-5 py-3.5">
                          <select
                            value={row.status || "PRESENT"}
                            onChange={(e) => {
                              const s = e.target.value;
                              handleAttendanceChange(
                                row.employeeId,
                                "status",
                                s,
                              );
                              if (s === "LATE") {
                                handleAttendanceChange(
                                  row.employeeId,
                                  "isLate",
                                  true,
                                );
                                const is900Shift =
                                  row.shiftInTime?.startsWith("09:00") ||
                                  row.shiftInTime?.startsWith("9:00");
                                const shiftDeduction =
                                  row.policyLateDeduction ||
                                  (is900Shift
                                    ? policy.lateDeduction900
                                    : policy.lateDeduction930);
                                handleAttendanceChange(
                                  row.employeeId,
                                  "lateDeduction",
                                  shiftDeduction,
                                );
                              } else if (
                                s === "PRESENT" ||
                                s === "PERMISSION" ||
                                s === "OD"
                              ) {
                                handleAttendanceChange(
                                  row.employeeId,
                                  "isLate",
                                  false,
                                );
                                handleAttendanceChange(
                                  row.employeeId,
                                  "lateDeduction",
                                  0,
                                );
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                              row.status === "OD"
                                ? "bg-blue-50 text-blue-700 border-blue-300"
                                : row.status === "LATE" ||
                                (row.isLate && row.status !== "PERMISSION")
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : row.status === "PERMISSION"
                                    ? "bg-purple-50 text-purple-700 border-purple-300"
                                    : row.status === "ABSENT"
                                      ? "bg-slate-100 text-slate-600 border-slate-300"
                                      : row.status === "HALF_DAY"
                                        ? "bg-amber-50 text-amber-700 border-amber-300"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-300"
                            }`}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="OD">On Duty (OD)</option>
                            <option value="LATE">Late Arrival</option>
                            <option value="HALF_DAY">Half Day</option>
                            <option value="PERMISSION">Permission</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        </td>

                        {/* Late Deduction Cost (Admin Decides / Edits here!) */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400 font-bold">
                              ₹
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={row.lateDeduction ?? 0}
                              onChange={(e) =>
                                handleAttendanceChange(
                                  row.employeeId,
                                  "lateDeduction",
                                  Number(e.target.value) || 0,
                                )
                              }
                              className={`w-24 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold focus:outline-none ${
                                Number(row.lateDeduction) > 0
                                  ? "bg-rose-50 border-rose-300 text-rose-700 font-extrabold"
                                  : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            />
                            {Number(row.lateDeduction) > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAttendanceChange(
                                    row.employeeId,
                                    "lateDeduction",
                                    0,
                                  )
                                }
                                className="text-[10px] text-slate-400 hover:text-emerald-600 font-bold underline cursor-pointer"
                                title="Waive penalty"
                              >
                                Waive
                              </button>
                            )}
                          </div>
                          {row.isThirdConsecutiveLate && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>3rd Late! -1 Day Salary (₹{row.dailySalaryRate || row.consecutiveLateDeduction})</span>
                            </div>
                          )}
                          {!row.isThirdConsecutiveLate && row.consecutiveLateDays > 0 && (
                            <div className="mt-1 flex flex-col gap-0.5">
                              <span className="text-[10px] text-amber-700 font-medium">
                                Streak: {row.consecutiveLateDays} late ({3 - (row.consecutiveLateDays % 3)} to -1 day salary)
                              </span>
                              <span className="text-[9px] text-emerald-700 font-semibold">
                                Day {row.consecutiveLateDays % 3}: No deduction
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Notes input */}
                        <td className="px-5 py-3.5">
                          <input
                            type="text"
                            placeholder="Optional reason..."
                            value={row.notes || ""}
                            onChange={(e) =>
                              handleAttendanceChange(
                                row.employeeId,
                                "notes",
                                e.target.value,
                              )
                            }
                            className="w-32 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                          />
                        </td>

                        {/* Save single button */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSaveSingleAttendance(row)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1656a6] hover:bg-[#124587] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
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

      {/* ========================================================= */}
      {/* TAB 3: ADMIN LATE DEDUCTION POLICY SETTINGS */}
      {/* ========================================================= */}
      {activeTab === "POLICY" && (
        <div className="max-w-4xl space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#1656a6] flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Admin Attendance & Shift-Wise Late Deduction Policy
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure separate late arrival salary deductions for{" "}
                  <span className="font-semibold text-slate-700">
                    09:00 AM shift
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-slate-700">
                    09:30 AM shift
                  </span>{" "}
                  staff. The system will automatically apply the respective
                  penalty based on each employee's assigned shift.
                </p>
              </div>
            </div>

            {policySuccess && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{policySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePolicy} className="mt-6 space-y-6">
              {/* Dual Shift Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Shift 1: 09:30 AM Shift */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/90 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1656a6] text-white">
                      <Clock className="w-3.5 h-3.5" />
                      09:30 AM Shift (Standard)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      09:30 - 18:30
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        In-Time
                      </label>
                      <input
                        type="text"
                        required
                        value={policy.expectedInTime}
                        onChange={(e) =>
                          setPolicy({
                            ...policy,
                            expectedInTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Out-Time
                      </label>
                      <input
                        type="text"
                        required
                        value={policy.expectedOutTime}
                        onChange={(e) =>
                          setPolicy({
                            ...policy,
                            expectedOutTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Automatic 1-Day Salary Cut (No Config Needed)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Day 1 & Day 2: ₹0. 3rd consecutive late day automatically deducts 1 day's salary (<span className="font-mono font-semibold">Individual Base / 30</span>).
                    </p>
                  </div>
                </div>

                {/* Shift 2: 09:00 AM Shift */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/90 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white">
                      <Clock className="w-3.5 h-3.5" />
                      09:00 AM Shift (Early)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      09:00 - 18:00
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        In-Time
                      </label>
                      <input
                        type="text"
                        disabled
                        value="09:00"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Out-Time
                      </label>
                      <input
                        type="text"
                        disabled
                        value="18:00"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Automatic 1-Day Salary Cut (No Config Needed)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Day 1 & Day 2: ₹0. 3rd consecutive late day automatically deducts 1 day's salary (<span className="font-mono font-semibold">Individual Base / 30</span>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Grace Period & General Attendance Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grace Period (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={60}
                    value={policy.gracePeriodMinutes}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        gracePeriodMinutes: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Set to 0 for strict company attendance (0 mins grace)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deduction Computation Model
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">
                    CONSECUTIVE (1-Day Salary Deduction on 3rd Late Day)
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Day 1 & Day 2: ₹0 penalty. 3rd consecutive late day: 1 day salary (Base Salary / 30)
                  </span>
                </div>
              </div>

              {/* Live Rule Explanation Simulator */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 text-xs text-slate-700">
                <span className="font-bold text-[#1656a6] block text-sm">
                  ⚡ 3-Consecutive-Days Late Rule Explanation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-emerald-700 block mb-1">
                      1st Day Late (Streak 1/3)
                    </span>
                    <p className="text-slate-600">
                      Marked <span className="font-bold text-amber-700">LATE</span>. <span className="font-bold text-emerald-700">₹0 Deduction</span>. Grace allowance, streak started.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="font-bold text-amber-700 block mb-1">
                      2nd Day Late (Streak 2/3)
                    </span>
                    <p className="text-slate-600">
                      Marked <span className="font-bold text-amber-700">LATE</span>. <span className="font-bold text-emerald-700">₹0 Deduction</span>. 1 day warning before salary deduction.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-rose-200 shadow-2xs">
                    <span className="font-bold text-rose-700 block mb-1">
                      3rd Day Late (Streak 3/3)
                    </span>
                    <p className="text-slate-600">
                      Consistently late! Automatic <span className="font-bold text-rose-700">1 Full Day Salary</span> (<span className="font-mono font-semibold">Base / 30</span>) deducted.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-800 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>🔥 Automated 3-Consecutive-Days Late Penalty Rule Active</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    If any employee arrives late for <span className="font-bold text-rose-700">3 consecutive working days</span> (excluding approved Permissions), <span className="font-bold text-rose-700">1 full day of salary</span> (<span className="font-mono font-semibold">Base Salary / 30</span>) is automatically deducted in payroll prep. Coming on time or an approved Permission resets the consecutive streak back to 0.
                  </p>
                </div>
              </div>

              {/* Office Geofencing & Strict Location Enforcement Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-blue-50/40 border border-indigo-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                          Office Geofencing & Location Enforcement
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            policy.geofenceEnabled
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {policy.geofenceEnabled ? "Enforced" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Restricts attendance punch-in & punch-out strictly within the office premises. Staff and HR cannot clock in from outside.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(policy.geofenceEnabled)}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          geofenceEnabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {policy.geofenceEnabled ? "Active" : "Off"}
                    </span>
                  </label>
                </div>

                {gpsError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{gpsError}</span>
                  </div>
                )}

                {policy.geofenceEnabled && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Office Title / Physical Address
                      </label>
                      <input
                        type="text"
                        value={policy.officeAddress || ""}
                        onChange={(e) =>
                          setPolicy({
                            ...policy,
                            officeAddress: e.target.value,
                          })
                        }
                        placeholder="e.g. IZEON INNOVATIVE Head Office, Tamil Nadu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Office Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          value={policy.officeLatitude}
                          onChange={(e) =>
                            setPolicy({
                              ...policy,
                              officeLatitude: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Office Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          value={policy.officeLongitude}
                          onChange={(e) =>
                            setPolicy({
                              ...policy,
                              officeLongitude: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={handleDetectOfficeGps}
                          disabled={detectingGps}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                        >
                          <Navigation className={`w-3.5 h-3.5 ${detectingGps ? "animate-spin" : ""}`} />
                          <span>{detectingGps ? "Detecting GPS..." : "📍 Detect Office GPS"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Allowed Punch Radius (Meters)
                        </label>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {policy.geofenceRadiusMeters} meters
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {[25, 50, 75, 100, 150].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setPolicy({
                                ...policy,
                                geofenceRadiusMeters: r,
                              })
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              Number(policy.geofenceRadiusMeters) === r
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {r}m {r === 50 ? "(Strict Office - Active)" : ""}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Strict 50-meter perimeter active. Ensures staff and HR can only punch attendance when physically located within the office doors.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`https://www.google.com/maps?q=${policy.officeLatitude},${policy.officeLongitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Preview Office Location on Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={policySaving}
                  className="px-6 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] font-bold text-sm shadow-xs transition cursor-pointer"
                >
                  {policySaving
                    ? "Saving Policy..."
                    : "Save Shift Policy Decisions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW STAFF / HR */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative my-8 text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1656a6] flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Add New Staff / HR Personnel
                </h3>
                <p className="text-xs text-slate-500">
                  Adds member to the Employment Category with attendance and
                  optional login credentials
                </p>
              </div>
            </div>

            {staffError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{staffError}</span>
              </div>
            )}

            {staffSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{staffSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={staffForm.name}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="priya@izeon.com"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role / Designation *
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      setStaffForm({
                        ...staffForm,
                        role: r,
                        createLogin: true,
                        userRole: r === "HR" ? "HR" : "EMPLOYEE",
                        department:
                          r === "HR" ? "Human Resources" : staffForm.department,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6] cursor-pointer"
                  >
                    <option value="HR">HR Staff (Human Resources)</option>
                    <option value="Trainer">Software Trainer</option>
                    <option value="Academic Counselor">
                      Academic Counselor
                    </option>
                    <option value="Admin Staff">Admin Executive</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Academics / HR"
                    value={staffForm.department}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={staffForm.phone}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Base Salary (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={staffForm.baseSalary}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        baseSalary: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={staffForm.joiningDate}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        joiningDate: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              {/* Performance Appraisal Configuration */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/90 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1656a6]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Appraisal & Increment Configuration
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Appraisal Due Date
                    </label>
                    <input
                      type="date"
                      value={staffForm.appraisalDate}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          appraisalDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Appraisal Date (if applicable)
                    </label>
                    <input
                      type="date"
                      value={staffForm.lastAppraisalDate}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          lastAppraisalDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Appraisal Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 18000"
                      value={staffForm.lastAppraisalSalary || ""}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          lastAppraisalSalary: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Appraisal Notes / Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual hike based on performance"
                      value={staffForm.lastAppraisalNotes}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          lastAppraisalNotes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Shift Timings & Grace Period */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1656a6]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Assigned Shift Timings & Grace Period
                    </span>
                  </div>
                  <span className="text-[11px] text-[#1656a6] font-semibold">
                    Admin Shift Control
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setStaffForm({
                        ...staffForm,
                        shiftInTime: "09:30",
                        shiftOutTime: "18:30",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      staffForm.shiftInTime === "09:30" &&
                      staffForm.shiftOutTime === "18:30"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    09:30 - 18:30 (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStaffForm({
                        ...staffForm,
                        shiftInTime: "09:00",
                        shiftOutTime: "18:00",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      staffForm.shiftInTime === "09:00" &&
                      staffForm.shiftOutTime === "18:00"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    09:00 - 18:00 (Early)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStaffForm({
                        ...staffForm,
                        shiftInTime: "10:00",
                        shiftOutTime: "19:00",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      staffForm.shiftInTime === "10:00" &&
                      staffForm.shiftOutTime === "19:00"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    10:00 - 19:00 (General)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Shift In-Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="09:30"
                      value={staffForm.shiftInTime}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          shiftInTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Shift Out-Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="18:30"
                      value={staffForm.shiftOutTime}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          shiftOutTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>
                    Strict attendance policy: 0 mins grace window. Entry after
                    assigned shift in-time is counted as late.
                  </span>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#1656a6]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      System Login Account
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={staffForm.createLogin}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          createLogin: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#1656a6] focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Enable Portal Login
                    </span>
                  </label>
                </div>

                {staffForm.createLogin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Login Password *
                      </label>
                      <input
                        type="password"
                        required={staffForm.createLogin}
                        minLength={6}
                        placeholder="••••••••"
                        value={staffForm.loginPassword}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            loginPassword: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#1656a6]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Portal Role
                      </label>
                      <select
                        value={staffForm.userRole}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            userRole: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1656a6]"
                      >
                        <option value="EMPLOYEE">Employee (Self-Service Portal)</option>
                        <option value="HR">HR Staff (Fees & Admissions)</option>
                        <option value="ADMIN">Full Administrator</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-[#F7F0E8] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {submittingStaff
                    ? "Adding to Employment..."
                    : "Confirm & Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT STAFF DETAILS */}
      {/* ========================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative my-8 text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit Employment: {editingStaff.name} ({editingStaff.empCode})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update employment role, salary, or reset login password
            </p>

            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStaff} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.name}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editStaffForm.email}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.role}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Base Salary (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editStaffForm.baseSalary}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        baseSalary: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#1656a6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editStaffForm.status}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Performance Appraisal Configuration */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/90 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1656a6]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Appraisal & Increment Configuration
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Appraisal Due Date
                    </label>
                    <input
                      type="date"
                      value={editStaffForm.appraisalDate}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          appraisalDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Appraisal Date
                    </label>
                    <input
                      type="date"
                      value={editStaffForm.lastAppraisalDate}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          lastAppraisalDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Appraisal Base Salary (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 18000"
                      value={editStaffForm.lastAppraisalSalary || ""}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          lastAppraisalSalary: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Appraisal Notes / Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual hike based on performance"
                      value={editStaffForm.lastAppraisalNotes}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          lastAppraisalNotes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Shift Timings & Grace Period (Admin Control) */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1656a6]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Assigned Shift Timings & Grace Window
                    </span>
                  </div>
                  <span className="text-[11px] text-[#1656a6] font-semibold">
                    Change Shift Timing
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditStaffForm({
                        ...editStaffForm,
                        shiftInTime: "09:30",
                        shiftOutTime: "18:30",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      editStaffForm.shiftInTime === "09:30" &&
                      editStaffForm.shiftOutTime === "18:30"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    09:30 - 18:30 (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditStaffForm({
                        ...editStaffForm,
                        shiftInTime: "09:00",
                        shiftOutTime: "18:00",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      editStaffForm.shiftInTime === "09:00" &&
                      editStaffForm.shiftOutTime === "18:00"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    09:00 - 18:00 (Early)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditStaffForm({
                        ...editStaffForm,
                        shiftInTime: "10:00",
                        shiftOutTime: "19:00",
                        gracePeriodMinutes: 0,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      editStaffForm.shiftInTime === "10:00" &&
                      editStaffForm.shiftOutTime === "19:00"
                        ? "bg-[#1656a6] text-white border-[#1656a6]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    10:00 - 19:00 (General)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Shift In-Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="09:30"
                      value={editStaffForm.shiftInTime}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          shiftInTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Shift Out-Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="18:30"
                      value={editStaffForm.shiftOutTime}
                      onChange={(e) =>
                        setEditStaffForm({
                          ...editStaffForm,
                          shiftOutTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#1656a6]"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>
                    Strict attendance policy: 0 mins grace window. Entry after
                    assigned shift in-time is counted as late.
                  </span>
                </div>
              </div>

              {editingStaff.userId && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Reset Portal Login Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={editStaffForm.loginPassword}
                    onChange={(e) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        loginPassword: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#1656a6]"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {submittingEdit ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: QUICK TIME LOG (FROM DIRECTORY) */}
      {/* ========================================================= */}
      {quickAttStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900">
            <button
              onClick={() => setQuickAttStaff(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Log Attendance: {quickAttStaff.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record In-Time and Out-Time with late deduction check
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmittingQuickAtt(true);
                try {
                  await api.post("/admin/attendance", {
                    employeeId: quickAttStaff.id,
                    date: quickAttForm.date,
                    inTime: quickAttForm.inTime,
                    outTime: quickAttForm.outTime,
                    status: quickAttForm.status,
                    lateDeduction: Number(quickAttForm.lateDeduction) || 0,
                    notes: quickAttForm.notes,
                  });
                  setQuickAttStaff(null);
                  fetchEmployees();
                  alert(`Attendance recorded for ${quickAttStaff.name}!`);
                } catch (err: any) {
                  alert(
                    err.response?.data?.message || "Failed to log attendance",
                  );
                } finally {
                  setSubmittingQuickAtt(false);
                }
              }}
              className="space-y-4 mt-5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={quickAttForm.date}
                  onChange={(e) =>
                    setQuickAttForm({ ...quickAttForm, date: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    In-Time
                  </label>
                  <input
                    type="text"
                    placeholder={quickAttStaff?.shiftInTime || "09:30 AM"}
                    value={quickAttForm.inTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      const late = checkLateStatus(
                        val,
                        quickAttStaff?.shiftInTime,
                        quickAttStaff?.gracePeriodMinutes,
                      );
                      setQuickAttForm({
                        ...quickAttForm,
                        inTime: val,
                        status: late.isLate ? "LATE" : "PRESENT",
                        lateDeduction: late.isLate
                          ? policy.lateDeductionPerDay
                          : 0,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Out-Time
                  </label>
                  <input
                    type="text"
                    placeholder={quickAttStaff?.shiftOutTime || "06:30 PM"}
                    value={quickAttForm.outTime}
                    onChange={(e) =>
                      setQuickAttForm({
                        ...quickAttForm,
                        outTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={quickAttForm.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setQuickAttForm({
                        ...quickAttForm,
                        status: newStatus,
                        lateDeduction:
                          newStatus === "PRESENT" ||
                          newStatus === "PERMISSION" ||
                          newStatus === "OD"
                            ? 0
                            : quickAttForm.lateDeduction,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="OD">On Duty (OD)</option>
                    <option value="LATE">Late Arrival</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="PERMISSION">Permission</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                  {quickAttForm.status === "OD" && (
                    <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                      Timing not required for On Duty (OD)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Late Penalty Cost (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quickAttForm.lateDeduction}
                    onChange={(e) =>
                      setQuickAttForm({
                        ...quickAttForm,
                        lateDeduction: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickAttStaff(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuickAtt}
                  className="px-5 py-2.5 rounded-xl bg-[#1656a6] hover:bg-[#124587] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {submittingQuickAtt ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT ATTENDANCE REGISTER MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Export Attendance Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download complete registered timing records as an Excel
                    spreadsheet (.xlsx)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5">
              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Export Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope("DATE")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                      exportScope === "DATE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold">Single Day</span>
                    <span className="text-[10px] text-slate-500">
                      Selected date only
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope("MONTH")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                      exportScope === "MONTH"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold">Monthly Register</span>
                    <span className="text-[10px] text-slate-500">
                      Full month's records
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope("RANGE")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                      exportScope === "RANGE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold">Custom Date Range</span>
                    <span className="text-[10px] text-slate-500">
                      From date to date
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope("ALL")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                      exportScope === "ALL"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="block font-bold">All-Time Register</span>
                    <span className="text-[10px] text-slate-500">
                      Every registered log
                    </span>
                  </button>
                </div>
              </div>

              {/* Date Inputs depending on scope */}
              {exportScope === "DATE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              )}

              {exportScope === "MONTH" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={exportStartDate.slice(0, 7)}
                    onChange={(e) => setExportStartDate(`${e.target.value}-01`)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              )}

              {exportScope === "RANGE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Filter by Staff */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Filter by Staff Member
                </label>
                <select
                  value={exportEmployeeId}
                  onChange={(e) => setExportEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Staff Members</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empCode} • {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {exportError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}

              {/* Features summary info */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Includes all registered timing columns:</span>
                </div>
                <p className="text-emerald-800 pl-5">
                  Date, Employee ID, Name, Department, Shift Timing, In-Time,
                  Out-Time, Work Hours, Attendance Status (Present, Late,
                  Permission, Half Day, Absent), Late Deduction Penalty (₹), and
                  Notes.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAttendanceExcel()}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>
                    {isExporting
                      ? "Generating Excel..."
                      : "Download Excel (.xlsx)"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
