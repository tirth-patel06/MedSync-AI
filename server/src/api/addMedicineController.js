import Medication from "../models/medicineModel.js";

import { addMedicineToGoogleCalendar } from "../utils/googleCalendar.js";
import startNotificationScheduler from "./notificationController.js";

export const addMedication = async (req, res) => {
  try {
    const{medication,localuser}=req.body;
    const {
      pillName,
      pillDescription,
      dosageDays,
      dosageTimes,
      dosageAmount,
      frequency,
      startDate,
      endDate,
      doctorName,
      prescriptionId,
      adherenceHistory,
      notes
    } = medication;

    
    const sampleMedicine = new Medication({
      userId:localuser.id,
      pillName,
      pillDescription,
      dosageDays,
      dosageTimes,
      dosageAmount,
      frequency,
      startDate,
      endDate,
      doctorName,
      prescriptionId,
      adherenceHistory,
      notes
    });
    
    await sampleMedicine.save();

    // Schedule in Google Calendar
    let calendarSyncStatus;
    try {
      calendarSyncStatus = await addMedicineToGoogleCalendar(localuser.id, sampleMedicine);
    } catch (calendarError) {
      console.error(`[Add Medicine] Google Calendar sync failed:`, calendarError.message);
      calendarSyncStatus = {
        success: false,
        message: `Calendar sync failed: ${calendarError.message}`,
        error: calendarError.message
      };
    }
    
    // ✅ Restart notification scheduler with updated medications
    startNotificationScheduler({ user: { id: localuser.id, name: localuser.name, email: localuser.email } });
    
    return res.status(201).json({
      success: true,
      message: "Medication saved successfully",
      data: sampleMedicine,
      calendarSync: calendarSyncStatus
    });

  } catch (error) {
    console.error("Error saving medication:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving medication",
      error: error.message
    });
  }
};
