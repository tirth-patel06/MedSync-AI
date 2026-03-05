import Medication from "../models/medicineModel.js";
import { addMedicineToGoogleCalendar } from "../utils/googleCalendar.js";
import startNotificationScheduler from "./notificationController.js";
import translationService from "../services/translationService.js";
import { checkDrugInteractions } from "../utils/drugInteractionChecker.js";

export const addMedication = async (req, res) => {
  try {
    const { medication, localuser } = req.body;
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
      notes,
      overrideInteractionWarning = false, // ← user explicitly chose to proceed despite warning
    } = medication;

    // ─── SAFETY SHIELD: Drug Interaction Check ───────────────────────────────
    // Fetch user's existing medications to compare against
    const existingMedications = await Medication.find({ userId: localuser.id }).select("pillName");
    const existingNames = existingMedications.map((m) => m.pillName);

    if (existingNames.length > 0 && !overrideInteractionWarning) {
      const interactionResult = await checkDrugInteractions(pillName, existingNames);

      if (!interactionResult.safe) {
        const hasMajor = interactionResult.highestSeverity === "major";

        // Major interactions: blocked by default, requires explicit override
        // Moderate/Minor: warn but allow override
        return res.status(409).json({
          success: false,
          interactionDetected: true,
          blocked: hasMajor,           // true = frontend should make override harder
          highestSeverity: interactionResult.highestSeverity,
          interactions: interactionResult.interactions,
          message: hasMajor
            ? "Major drug interaction detected. Please consult your doctor before adding this medication."
            : "Drug interaction detected. Please review and confirm to proceed.",
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // 🌐 Auto-translate pillDescription to Spanish and Hindi
    let translatedInstructions = {};
    if (pillDescription && pillDescription.trim().length > 0) {
      try {
        console.log("🌐 Translating medication instructions...");
        const translations = await translationService.translateBatch(
          [pillDescription, pillDescription],
          ["es", "hi"],
          "medication"
        );
        translatedInstructions = {
          es: translations[0] || pillDescription,
          hi: translations[1] || pillDescription,
        };
        console.log("✅ Translated instructions:", translatedInstructions);
      } catch (translationError) {
        console.error("⚠️ Translation failed, storing original only:", translationError);
        translatedInstructions = { es: pillDescription, hi: pillDescription };
      }
    }

    const sampleMedicine = new Medication({
      userId: localuser.id,
      pillName,
      pillDescription,
      originalInstructions: pillDescription || "",
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
      notes,
    });

    await sampleMedicine.save();

    // Schedule in Google Calendar
    let calendarSyncStatus;
    try {
      calendarSyncStatus = await addMedicineToGoogleCalendar(localuser.id, sampleMedicine);
    } catch (calendarError) {
      console.error(`[Add Medicine] Google Calendar sync failed:`, calendarError.message);
      try {
        await Medication.findByIdAndDelete(sampleMedicine._id);
        console.log(`[Add Medicine] Rolled back medication ${sampleMedicine._id}`);
      } catch (rollbackError) {
        console.error("[Add Medicine] Failed to roll back medication:", rollbackError);
      }
      return res.status(500).json({
        success: false,
        message: `Failed to save medication due to calendar sync error: ${calendarError.message}`,
        error: calendarError.message,
      });
    }

    // ✅ Restart notification scheduler
    startNotificationScheduler({
      user: { id: localuser.id, name: localuser.name, email: localuser.email },
    });

    return res.status(201).json({
      success: true,
      message: "Medication saved successfully",
      data: sampleMedicine,
      calendarSync: calendarSyncStatus,
    });
  } catch (error) {
    console.error("Error saving medication:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving medication",
      error: error.message,
    });
  }
};

/**
 * Standalone endpoint: check interactions without saving
 * Used by frontend for real-time preview as user types the drug name
 * POST /api/medicine/check-interactions
 */
export const checkInteractions = async (req, res) => {
  try {
    const { pillName, localuser } = req.body;

    if (!pillName?.trim()) {
      return res.status(400).json({ success: false, message: "pillName is required" });
    }

    const existingMedications = await Medication.find({ userId: localuser.id }).select("pillName");
    const existingNames = existingMedications.map((m) => m.pillName);

    if (existingNames.length === 0) {
      return res.status(200).json({ success: true, safe: true, interactions: [] });
    }

    const result = await checkDrugInteractions(pillName, existingNames);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[SafetyShield] checkInteractions error:", error);
    return res.status(500).json({ success: false, message: "Interaction check failed", error: error.message });
  }
};