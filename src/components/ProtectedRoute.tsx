import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  adminOrHrOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly = false,
  adminOrHrOnly = false,
}) => {
  const { isAuthenticated, isAdmin, isHR } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (adminOrHrOnly && !isAdmin && !isHR) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
