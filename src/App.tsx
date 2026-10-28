import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { NewAdmissionPage } from "./pages/NewAdmissionPage";
import { StudentDetailPage } from "./pages/StudentDetailPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { AdminHRPage } from "./pages/AdminHRPage";
import { CompanySettingsPage } from "./pages/CompanySettingsPage";
import { EmployeePortalPage } from "./pages/EmployeePortalPage";

// Dynamic Home Router: If Employee -> EmployeePortalPage, If Admin/HR -> DashboardPage
const HomeRouter = () => {
  const { isEmployee } = useAuth();
  return isEmployee ? <EmployeePortalPage initialTab="ATTENDANCE" /> : <DashboardPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes for Authenticated Users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomeRouter />} />

                {/* Employee Self-Service Routes */}
                <Route
                  path="/my-attendance"
                  element={<EmployeePortalPage initialTab="ATTENDANCE" />}
                />
                <Route
                  path="/my-payslips"
                  element={<EmployeePortalPage initialTab="PAYSLIPS" />}
                />
                <Route
                  path="/my-appraisals"
                  element={<EmployeePortalPage initialTab="APPRAISALS" />}
                />

                {/* Admin & HR Admissions & Invoicing */}
                <Route element={<ProtectedRoute adminOrHrOnly={true} />}>
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/students/new" element={<NewAdmissionPage />} />
                  <Route path="/students/:id" element={<StudentDetailPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                </Route>

                {/* Strict Admin Only Routes */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/reports" element={<AdminReportsPage />} />
                  <Route path="/hr-management" element={<AdminHRPage />} />
                  <Route path="/settings" element={<CompanySettingsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
