import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  employeeId?: number | null;
  empCode?: string | null;
  designation?: string | null;
  department?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isEmployee: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("izeon_token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("izeon_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("izeon_token", token);
    } else {
      localStorage.removeItem("izeon_token");
    }

    if (user) {
      localStorage.setItem("izeon_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("izeon_user");
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("izeon_token");
    localStorage.removeItem("izeon_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ADMIN",
        isHR: user?.role === "HR",
        isEmployee: user?.role === "EMPLOYEE",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
