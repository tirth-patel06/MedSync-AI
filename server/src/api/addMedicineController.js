import Medication from "../models/medicineModel.js";

import { addMedicineToGoogleCalendar } from "../utils/googleCalendar.js";
import startNotificationScheduler from "./notificationController.js";
import translationService from "../services/translationService.js";

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

    // 🌐 Auto-translate pillDescription to Spanish and Hindi
    let translatedInstructions = {};
    if (pillDescription && pillDescription.trim().length > 0) {
      try {
        console.log("🌐 Translating medication instructions...");
        const translations = await translationService.translateBatch(
          [pillDescription, pillDescription],
          ['es', 'hi'],
          'medication'
        );
        
        translatedInstructions = {
          es: translations[0] || pillDescription,
          hi: translations[1] || pillDescription
        };
        console.log("✅ Translated instructions:", translatedInstructions);
      } catch (translationError) {
        console.error("⚠️ Translation failed, storing original only:", translationError);
        // Fallback: store original text if translation fails
        translatedInstructions = {
          es: pillDescription,
          hi: pillDescription
        };
      }
    }
    
    const sampleMedicine = new Medication({
      userId:localuser.id,
      pillName,
      pillDescription,
      originalInstructions: pillDescription || '',
      translatedInstructions,
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
      // Roll back the saved medication to avoid inconsistent state
      try {
        await Medication.findByIdAndDelete(sampleMedicine._id);
        console.log(`[Add Medicine] Rolled back medication ${sampleMedicine._id} after calendar sync failure`);
      } catch (rollbackError) {
        console.error(
          "[Add Medicine] Failed to roll back medication after calendar sync failure:",
          rollbackError
        );
      }
      return res.status(500).json({
        success: false,
        message: `Failed to save medication due to calendar sync error: ${calendarError.message}`,
        error: calendarError.message
      });
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
