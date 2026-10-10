import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes for Authenticated Users (Admin & HR) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/new" element={<NewAdmissionPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />

              {/* Strict Admin Only Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/reports" element={<AdminReportsPage />} />
                <Route path="/hr-management" element={<AdminHRPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
