import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [localuser, setLocaluser] = useState(() => {
        return JSON.parse(localStorage.getItem("user"));
    });
    const [notifications, setNotifications] = useState([]);

    // Function to call backend for notifications
    const sendNotification = async () => {
        if (!localuser) return; // prevent call if user not logged in
        try {
            console.log("localuser in notification context:", localuser);
            const res = await axios.post(
                'http://localhost:8080/api/notification/regular-notify',
                { localuser }
            );
            if (res.data?.notifications) {
                setNotifications(res.data.notifications);
            }
        } catch (err) {
            console.error("Error in sending notification:", err.message);
        }
    };

    useEffect(() => {
        // Run once when frontend loads
        sendNotification();

        // Run every 30 minutes (1800000 ms)
        const interval = setInterval(sendNotification, 30 * 60 * 1000);

        // Cleanup when component unmounts
        return () => clearInterval(interval);
    }, [localuser]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            refreshNotifications: sendNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
