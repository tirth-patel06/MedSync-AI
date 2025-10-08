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



   const addMedication=useCallback(async()=>{
    if (!localuser?.id) return;
     try {
       console.log("medication",medication);
       console.log("localuser",localuser);
       const response = await axios.post('http://localhost:8080/api/medicine/add', {medication,localuser});  
       console.log('Medication added successfully:', response.data);
     }
     catch (error) {
       console.error('Error adding medication:', error);
     }
    }
    ,[medication, localuser]);

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
  
     const medicineStatus =useCallback(async(medId)=>{
      if (!localuser?.id) return;
       try{
         const response = await axios.post('http://localhost:8080/api/medicine/status', {localuser,medId});  
        console.log('status changed sucessfully', response.data);
        return response.data;
       }
       catch(error){
         console.error('Error updating status:', error);
       }
 
     },[localuser])
   
 
 
     
 
 
   return (
     <MedicineContext.Provider value={{medication, setMedication,addMedication,todayMedication,medicineStatus}}>
       {children}
     </MedicineContext.Provider>
   );
 };