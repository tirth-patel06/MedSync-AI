import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  Clock,
  Pill,
  AlertCircle,
  Sparkles,
  Pause,
} from "lucide-react";
import { useNotification } from "../context/notificationContext.jsx";

const NotificationToast = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);

  const { snoozeNotification } = useNotification();

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Auto-hide after 8 seconds (increased for snooze options)
    const hideTimer = setTimeout(() => {
      if (!showSnoozeOptions) {
        handleClose();
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [showSnoozeOptions]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const handleSnooze = async (minutes) => {
    setIsSnoozing(true);
    try {
      const result = await snoozeNotification(notification.id, minutes);
      if (result.success) {
        console.log(`✅ Notification snoozed for ${minutes} minutes`);
        handleClose(); // Close the toast after snoozing
      } else {
        console.error("Failed to snooze:", result.message);
        // Show error feedback if needed
      }
    } catch (error) {
      console.error("Error snoozing notification:", error);
    } finally {
      setIsSnoozing(false);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "before":
        return <Clock className="w-5 h-5 text-cyan-400" />;
      case "onTime":
        return <Bell className="w-5 h-5 text-orange-400" />;
      case "after":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "test":
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Pill className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case "before":
        return "border-cyan-500/50 bg-cyan-500/10";
      case "onTime":
        return "border-orange-500/50 bg-orange-500/10";
      case "after":
        return "border-red-500/50 bg-red-500/10";
      case "test":
        return "border-purple-500/50 bg-purple-500/10";
      default:
        return "border-blue-500/50 bg-blue-500/10";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-80 max-w-sm
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        className={`
          rounded-xl border backdrop-blur-xl p-4 shadow-2xl
          ${getColorClasses()}
        `}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>

            {/* Snooze options - only show for medication reminders, not test notifications */}
            {notification.type !== "test" && !notification.isSnoozed && (
              <div className="mt-3 space-y-2">
                {!showSnoozeOptions ? (
                  <button
                    onClick={() => setShowSnoozeOptions(true)}
                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isSnoozing}
                  >
                    <Pause className="w-3 h-3" />
                    Snooze reminder
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">Snooze for:</p>
                    <div className="flex gap-2 flex-wrap">
                      {[5, 15, 30, 60].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => handleSnooze(minutes)}
                          disabled={isSnoozing}
                          className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {minutes < 60 ? `${minutes}min` : "1hr"}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowSnoozeOptions(false)}
                      className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Show if notification is currently snoozed */}
            {notification.isSnoozed && notification.snoozeUntil && (
              <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Snoozed until{" "}
                {new Date(notification.snoozeUntil).toLocaleTimeString()}
                {notification.snoozeCount && notification.maxSnoozes && (
                  <span className="text-slate-500">
                    ({notification.snoozeCount}/{notification.maxSnoozes})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications, onRemoveNotification }) => {
  // Only show the most recent 3 notifications as toasts
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="space-y-2 p-4">
        {recentNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              zIndex: 1000 - index,
              transform: `translateY(${index * 4}px)`,
            }}
          >
            <NotificationToast
              notification={notification}
              onRemove={onRemoveNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
