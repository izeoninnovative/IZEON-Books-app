/** @format */

import React, { createContext, useCallback, useContext, useState } from "react";
import { NotificationContainer } from "../components/NotificationContainer";

export type NotificationType = "success" | "error" | "info" | "warn";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (item: Omit<NotificationItem, "id">) => void;
  removeNotification: (item: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warn: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    (item: Omit<NotificationItem, "id">) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substring(2, 5);

      const duration = item.duration ?? 4000;

      const newNotification: NotificationItem = {
        ...item,
        id,
        duration,
      };

      setNotifications((prev) => [...prev, newNotification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification],
  );

  const success = useCallback(
    (message: string, title?: string) =>
      showNotification({ type: "success", message, title }),
    [showNotification],
  );
  const error = useCallback(
    (message: string, title?: string) =>
      showNotification({ type: "error", message, title }),
    [showNotification],
  );
  const warn = useCallback(
    (message: string, title?: string) =>
      showNotification({ type: "warn", message, title }),
    [showNotification],
  );
  const info = useCallback(
    (message: string, title?: string) =>
      showNotification({ type: "info", message, title }),
    [showNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
        success,
        error,
        warn,
        info,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// custom hooks
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "usenotification must be used within a notification provider",
    );
  }
  return context;
};
