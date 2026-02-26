import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [localuser, setLocaluser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      // handle cases where it's undefined, null, or "undefined"
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
      return null;
    }
  });

  const [notifications, setNotifications] = useState([]);

  // Function to call backend to trigger the scheduler (keeps existing endpoint)
  const sendNotification = useCallback(async () => {
    if (!localuser) return; // prevent call if user not logged in
    try {
      console.log("localuser in notification context:", localuser);
      await axios.post(
        "http://localhost:8080/api/notification/regular-notify",
        { localuser },
      );
    } catch (err) {
      console.error("Error in sending notification:", err?.message || err);
    }
  }, [localuser]);

  // Fetch today's stored notifications for the current user
  const fetchTodayNotifications = useCallback(async () => {
    if (!localuser) return [];
    try {
      const response = await axios.post(
        "http://localhost:8080/api/notification/today",
        { localuser },
      );

      const data =
        response.data && response.data.data ? response.data.data : [];
      setNotifications(data);
      return data;
    } catch (error) {
      console.error("Error fetching today notifications:", error);
      return [];
    }
  }, [localuser]);

  // Snooze a notification
  const snoozeNotification = useCallback(
    async (notificationId, snoozeMinutes) => {
      if (!localuser || !notificationId)
        return { success: false, message: "Missing user or notification ID" };

      try {
        const response = await axios.post(
          "http://localhost:8080/api/notification/snooze",
          {
            notificationId,
            snoozeMinutes: parseInt(snoozeMinutes),
            userId: localuser.id,
          },
        );

        if (response.data.success) {
          console.log(`✅ Notification snoozed for ${snoozeMinutes} minutes`);
          // Refresh notifications to show updated state
          fetchTodayNotifications();
        }

        return response.data;
      } catch (error) {
        console.error("Error snoozing notification:", error);
        return {
          success: false,
          message:
            error.response?.data?.message || "Failed to snooze notification",
        };
      }
    },
    [localuser, fetchTodayNotifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        sendNotification,
        fetchTodayNotifications,
        snoozeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
