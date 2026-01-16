import React, { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../services/api/client";

const MedicineContext = createContext();

export const useMedicine = () => useContext(MedicineContext);

export const MedicineProvider = ({ children }) => {
  /**
   * IMPORTANT SECURITY NOTE:
   * - We do NOT trust localStorage for identity
   * - localuser is used ONLY for UI convenience
   * - Backend MUST derive user from auth (JWT/session)
   */
  const [localuser, setLocaluser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [medication, setMedication] = useState({
    pillName: "",
    pillDescription: "",
    dosageDays: [],
    dosageTimes: [],
    dosageAmount: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  /**
   * ADD MEDICATION
   * - No userId sent
   * - Backend infers user from auth
   */
  const addMedication = useCallback(async () => {
    if (!localuser) return;

    return apiClient({
      url: "/api/medicine/add",
      method: "POST",
      body: {
        medication,
      },
      actionType: "ADD_MEDICATION",
    });
  }, [medication, localuser]);

  /**
   * FETCH TODAY'S MEDICATION
   * - Auth handled by apiClient
   * - No identity in payload
   */
  const todayMedication = useCallback(async () => {
    if (!localuser) return [];

    return apiClient({
      url: "/api/medicine/today",
      method: "POST",
      body: {},
      actionType: "FETCH_TODAY_MEDICATION",
    });
  }, [localuser]);

  /**
   * UPDATE MEDICATION STATUS (OFFLINE SAFE)
   * - Stores INTENT only
   * - No userId
   * - No frontend timestamps
   */
  const medicineStatus = useCallback(
    async (medId, status) => {
      if (!localuser) return;

      return apiClient({
        url: "/api/medicine/status",
        method: "POST",
        body: {
          medId,
          status,
        },
        actionType: "UPDATE_MEDICATION_STATUS",
      });
    },
    [localuser]
  );

  /**
   * FETCH STREAK DAYS
   * - Correct nullish handling
   * - No identity in payload
   */
  const getStreakDays = useCallback(async () => {
    if (!localuser) return 0;

    const response = await apiClient({
      url: "/api/streak",
      method: "POST",
      body: {},
      actionType: "FETCH_STREAK",
    });

    return response?.streakDays ?? 0;
  }, [localuser]);

  return (
    <MedicineContext.Provider
      value={{
        medication,
        setMedication,
        addMedication,
        todayMedication,
        medicineStatus,
        getStreakDays,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
};
