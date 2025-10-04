import { createContext, useContext, useState, useEffect,useCallback } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {

    const [localuser, setLocaluser] = useState(() => {
        return JSON.parse(localStorage.getItem("user"));
    });

    const [notifications, setNotifications] = useState([]);

        // Function to call backend to trigger the scheduler (keeps existing endpoint)
        const sendNotification = useCallback(async () => {
                if (!localuser) return; // prevent call if user not logged in
                try {
                        console.log("localuser in notification context:", localuser);
                        await axios.post('http://localhost:8080/api/notification/regular-notify', { localuser });
                } catch (err) {
                        console.error("Error in sending notification:", err?.message || err);
                }
        }, [localuser]);

        // Fetch today's stored notifications for the current user
        const fetchTodayNotifications = useCallback(async () => {
            if (!localuser) return [];
            try {
                const response = await axios.post('http://localhost:8080/api/notification/today', { localuser });
              
                const data = response.data && response.data.data ? response.data.data : [];
                setNotifications(data);
                return data;
            } catch (error) {
                console.error('Error fetching today notifications:', error);
                return [];
            }
        }, [localuser]);




  
    return (
        <NotificationContext.Provider value={{
            notifications,
            sendNotification,
            fetchTodayNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
