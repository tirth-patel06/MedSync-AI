import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
       console.log("medication",medication);
       console.log("localuser",localuser);
       const response = await axios.post('http://localhost:8080/api/medicine/add', {medication,localuser});  
       console.log('Medication added successfully:', response.data);
     }
     catch (error) {
       console.error('Error adding medication:', error);
     }
    }
    ,[medication]);

  return (
    <MedicineContext.Provider value={{medication, setMedication,addMedication}}>
      {children}
    </MedicineContext.Provider>
  );
};