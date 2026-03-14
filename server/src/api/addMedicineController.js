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
      overrideInteractionWarning = false,
    } = medication;

    // ─── SAFETY SHIELD ────────────────────────────────────────────────────────
    const existingMedications = await Medication.find({ userId: localuser.id }).select("pillName");
    const existingNames = existingMedications.map((m) => m.pillName);

    if (existingNames.length > 0 && !overrideInteractionWarning) {
      const interactionResult = await checkDrugInteractions(pillName, existingNames);
      if (!interactionResult.safe) {
        const hasMajor = interactionResult.highestSeverity === "major";
        return res.status(409).json({
          success: false,
          interactionDetected: true,
          blocked: hasMajor,
          highestSeverity: interactionResult.highestSeverity,
          interactions: interactionResult.interactions,
          message: hasMajor
            ? "Major drug interaction detected. Please consult your doctor before adding this medication."
            : "Drug interaction detected. Please review and confirm to proceed.",
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // 🌐 Auto-translate pillDescription
    let translatedInstructions = {};
    if (pillDescription && pillDescription.trim().length > 0) {
      try {
        const translations = await translationService.translateBatch(
          [pillDescription, pillDescription],
          ["es", "hi"],
          "medication"
        );
        translatedInstructions = {
          es: translations[0] || pillDescription,
          hi: translations[1] || pillDescription,
        };
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

    let calendarSyncStatus = { synced: false };
    try {
      calendarSyncStatus = await addMedicineToGoogleCalendar(localuser.id, sampleMedicine);
    } catch (calendarError) {
      console.error(`[Add Medicine] Google Calendar sync failed:`, calendarError.message);
      try {
        await Medication.findByIdAndDelete(sampleMedicine._id);
      } catch (rollbackError) {
        console.error("[Add Medicine] Failed to roll back medication:", rollbackError);
      }
      return res.status(500).json({
        success: false,
        message: `Failed to save medication due to calendar sync error: ${calendarError.message}`,
        error: calendarError.message,
      });
    }

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
 * FIX 7 & 8: Use req.user from authMiddleware instead of trusting localuser from body
 * FIX 6: Always return full response shape including highestSeverity and source
 * POST /api/medicine/check-interactions
 */
export const checkInteractions = async (req, res) => {
  try {
    const { pillName } = req.body;

    if (!pillName?.trim()) {
      return res.status(400).json({ success: false, message: "pillName is required" });
    }

    // FIX 7 & 8: Derive user from authenticated context — never trust request body for userId
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userId = authUser.id || authUser._id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Authenticated user is missing an id" });
    }

    const existingMedications = await Medication.find({ userId }).select("pillName");
    const existingNames = existingMedications.map((m) => m.pillName);

    // FIX 6: Always return full schema even when no existing meds
    if (existingNames.length === 0) {
      return res.status(200).json({
        success: true,
        safe: true,
        interactions: [],
        highestSeverity: "none",
        source: "none",
      });
    }

    const result = await checkDrugInteractions(pillName, existingNames);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[SafetyShield] checkInteractions error:", error);
    return res.status(500).json({ success: false, message: "Interaction check failed", error: error.message });
  }
};