import React, { useState } from "react";
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { NotificationItem } from "../context/NotificationContext";

interface ToastItemProps {
  notification: NotificationItem;
  onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ notification, onClose }) => {
  const { id, type, title, message, duration = 4000 } = notification;
  const [isExiting, setIsExiting] = useState(false);

  // Type configuration tailored to IZEON Books design theme
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-50 border-emerald-200/80",
      defaultTitle: "Success",
      progressBg: "bg-emerald-500",
    },
    error: {
      icon: AlertOctagon,
      iconColor: "text-rose-600",
      badgeBg: "bg-rose-50 border-rose-200/80",
      defaultTitle: "Error Occurred",
      progressBg: "bg-rose-500",
    },
    warn: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-50 border-amber-200/80",
      defaultTitle: "Warning",
      progressBg: "bg-amber-500",
    },
    info: {
      icon: Info,
      iconColor: "text-[#1656a6]",
      badgeBg: "bg-blue-50 border-blue-200/80",
      defaultTitle: "Notice",
      progressBg: "bg-[#1656a6]",
    },
  }[type];

  const Icon = typeConfig.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 200);
  };

  return (
    <div
      role="alert"
      className={`group relative pointer-events-auto flex items-start gap-3 w-88 max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 transition-all duration-200 overflow-hidden ${
        isExiting
          ? "opacity-0 translate-x-4 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-4"
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${typeConfig.badgeBg}`}
      >
        <Icon className={`w-5 h-5 ${typeConfig.iconColor}`} />
      </div>

      {/* Title & Message */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-none mb-1">
          {title || typeConfig.defaultTitle}
        </h4>
        <p className="text-xs font-medium text-slate-600 leading-relaxed break-words">
          {message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-Dismiss Countdown Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${typeConfig.progressBg} transition-all ease-linear`}
            style={{
              animation: `shrinkWidth ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};
