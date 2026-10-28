/** @format */

import * as XLSX from "xlsx";

export interface AttendanceRegisterEntry {
  attendanceId?: number;
  date: string;
  empCode: string;
  employeeName: string;
  department?: string;
  role?: string;
  assignedShift?: string;
  shiftInTime?: string;
  shiftOutTime?: string;
  inTime?: string;
  outTime?: string;
  workHours?: number | string;
  status: string;
  isLate?: boolean;
  lateMinutes?: number | string;
  lateDeduction?: number | string;
  notes?: string;
  createdAt?: string;
}

/**
 * Exports attendance register entries to an Excel (.xlsx) spreadsheet with professional formatting.
 */
export const exportAttendanceRegisterToExcel = (
  entries: AttendanceRegisterEntry[],
  options?: {
    filename?: string;
    sheetName?: string;
    reportTitle?: string;
    dateRangeLabel?: string;
  }
) => {
  const filename =
    options?.filename ||
    `Attendance_Register_${new Date().toISOString().split("T")[0]}.xlsx`;
  const sheetName = (options?.sheetName || "Attendance Register").slice(0, 31);

  // Map to human-friendly Excel rows
  const rows = entries.map((entry, index) => {
    const isLate =
      entry.status === "PERMISSION" || entry.status === "OD"
        ? `No (${entry.status === "OD" ? "On Duty" : "Permission"})`
        : entry.isLate
        ? "Yes"
        : "No";

    const formattedStatus =
      entry.status === "OD"
        ? "On Duty (OD)"
        : entry.status === "PERMISSION"
        ? "Permission"
        : entry.status === "LATE"
        ? "Late Arrival"
        : entry.status === "PRESENT"
        ? "Present"
        : entry.status === "HALF_DAY"
        ? "Half Day"
        : entry.status === "ABSENT"
        ? "Absent"
        : entry.status || "Not Marked";

    return {
      "S.No": index + 1,
      "Date": entry.date,
      "Emp ID": entry.empCode,
      "Employee Name": entry.employeeName,
      "Department": entry.department || "-",
      "Role": entry.role || "-",
      "Assigned Shift":
        entry.assignedShift ||
        (entry.shiftInTime ? `${entry.shiftInTime} - ${entry.shiftOutTime || "18:30"}` : "09:30 - 18:30"),
      "In-Time (Entry)": entry.inTime && entry.inTime.trim() ? entry.inTime : (entry.status === "OD" ? "OD" : "-"),
      "Out-Time (Exit)": entry.outTime && entry.outTime.trim() ? entry.outTime : (entry.status === "OD" ? "OD" : "-"),
      "Work Hours (Hrs)": Number(entry.workHours || (entry.status === "OD" ? 8 : 0)),
      "Attendance Status": formattedStatus,
      "Is Late?": isLate,
      "Late By (Mins)": Number(entry.lateMinutes || 0),
      "Late Penalty (₹)": Number(entry.lateDeduction || 0),
      "Notes / Reason": entry.notes || "-",
    };
  });

  // Calculate totals for KPI summary
  const totalEntries = entries.length;
  const totalPresent = entries.filter(
    (e) =>
      e.status === "PRESENT" ||
      e.status === "LATE" ||
      e.status === "PERMISSION" ||
      e.status === "OD"
  ).length;
  const totalOD = entries.filter((e) => e.status === "OD").length;
  const totalLate = entries.filter(
    (e) =>
      (e.isLate || e.status === "LATE") &&
      e.status !== "PERMISSION" &&
      e.status !== "OD"
  ).length;
  const totalPermission = entries.filter((e) => e.status === "PERMISSION").length;
  const totalDeduction = entries.reduce(
    (sum, e) => sum + (Number(e.lateDeduction) || 0),
    0
  );
  const totalHours = entries.reduce((sum, e) => sum + (Number(e.workHours) || 0), 0);

  // Add an empty row and a summary row
  if (rows.length > 0) {
    rows.push({
      "S.No": "" as any,
      "Date": "",
      "Emp ID": "",
      "Employee Name": "",
      "Department": "",
      "Role": "",
      "Assigned Shift": "",
      "In-Time (Entry)": "",
      "Out-Time (Exit)": "",
      "Work Hours (Hrs)": "" as any,
      "Attendance Status": "",
      "Is Late?": "",
      "Late By (Mins)": "" as any,
      "Late Penalty (₹)": "" as any,
      "Notes / Reason": "",
    });

    rows.push({
      "S.No": "" as any,
      "Date": "SUMMARY TOTALS",
      "Emp ID": `Total Logs: ${totalEntries}`,
      "Employee Name": `Present: ${totalPresent} (OD: ${totalOD}) | Perm: ${totalPermission}`,
      "Department": "",
      "Role": "",
      "Assigned Shift": "",
      "In-Time (Entry)": "",
      "Out-Time (Exit)": "Total Hours:",
      "Work Hours (Hrs)": Math.round(totalHours * 10) / 10,
      "Attendance Status": `Total Late: ${totalLate}`,
      "Is Late?": "",
      "Late By (Mins)": "" as any,
      "Late Penalty (₹)": totalDeduction,
      "Notes / Reason": `Total Penalty: ₹${totalDeduction.toLocaleString()}`,
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set proportional column widths for comfortable reading in Excel
  worksheet["!cols"] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Date
    { wch: 14 }, // Emp ID
    { wch: 24 }, // Employee Name
    { wch: 18 }, // Department
    { wch: 16 }, // Role
    { wch: 18 }, // Assigned Shift
    { wch: 16 }, // In-Time
    { wch: 16 }, // Out-Time
    { wch: 16 }, // Work Hours
    { wch: 18 }, // Status
    { wch: 12 }, // Is Late
    { wch: 15 }, // Late By (Mins)
    { wch: 16 }, // Late Penalty
    { wch: 28 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write and trigger browser download
  XLSX.writeFile(workbook, filename);
};
