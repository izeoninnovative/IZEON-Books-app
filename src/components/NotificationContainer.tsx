import React from "react";
import { useNotification } from "../context/NotificationContext";
import { ToastItem } from "./ToastItem";

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <aside
      aria-label="Notification alerts"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none items-end max-w-sm w-full"
    >
      {notifications.map((item) => (
        <ToastItem
          key={item.id}
          notification={item}
          onClose={removeNotification}
        />
      ))}
    </aside>
  );
};
