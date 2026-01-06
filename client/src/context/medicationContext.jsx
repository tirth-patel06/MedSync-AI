import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MedicineContext = createContext();

export const useMedicine = () => useContext(MedicineContext);

export const MedicineProvider = ({ children }) => {
  const [localuser, setLocaluser] = useState(() => {
    try {
      const stored = localStorage.getItem("user"); 
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
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
     startDate: new Date().toISOString().split('T')[0],
     endDate: ""
   });


const addMedication = useCallback(async () => {
  if (!localuser?.id) return;

  return apiClient({
    url: "http://localhost:8080/api/medicine/add",
    method: "POST",
    body: {
      medication,
      localuser,
    },
    actionType: "ADD_MEDICATION",
  });
}, [medication, localuser]);

    const todayMedication=useCallback(async()=>{
      if (!localuser?.id) return [];
      try {       
        const response = await axios.post('http://localhost:8080/api/medicine/today', {localuser});  
        console.log('todays medicine fetched succesfully', response.data);
        return response.data;
      }
      catch (error) {
        console.error('Error adding medication:', error);
      }
     }
     ,[localuser]);
  
   const medicineStatus = useCallback(async (medId) => {
  if (!localuser?.id) return;

  return apiClient({
    url: "http://localhost:8080/api/medicine/status",
    method: "POST",
    body: {
      localuser,
      medId,
    },
    actionType: "UPDATE_MEDICATION_STATUS",
  });
}, [localuser]);

 
   // Fetch user's streak days
   const getStreakDays = useCallback(async () => {
    if (!localuser?.id) return 0;
    try {
      const response = await axios.post('http://localhost:8080/api/streak', { localuser });
      if (response.data && response.data.success) {
        return response.data.streakDays || 8;
      }
      return 8;
    } catch (error) {
      console.error('Error fetching streak days:', error);
      return 0;
    }
   }, [localuser]);

   return (
     <MedicineContext.Provider value={{
       medication, setMedication,
       addMedication,
       todayMedication,
       medicineStatus,
       getStreakDays
     }}>
       {children}
     </MedicineContext.Provider>
   );
 };