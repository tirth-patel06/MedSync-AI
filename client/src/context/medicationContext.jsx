import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MedicineContext = createContext();

export const useMedicine = () => useContext(MedicineContext);

export const MedicineProvider = ({ children }) => {
    const[localuser,setLocaluser]=useState(JSON.parse(localStorage.getItem("user")));
    
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
     try {
       
       console.log("localuser",localuser);
       const response = await axios.post('http://localhost:8080/api/medicine/add', {medication,localuser});  
       console.log('Medication added successfully:', response.data);
     }
     catch (error) {
       console.error('Error adding medication:', error);
     }
    }
    ,[medication]);


    const todayMedication=useCallback(async()=>{
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