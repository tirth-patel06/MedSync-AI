import Medication from "../models/medicineModel.js";
import { addMedicineToGoogleCalendar } from "../utils/googleCalendar.js";
import startNotificationScheduler from "./notificationController.js";
import { parseBulkText } from "../utils/medicineParser.js";

/**
 * POST /api/medicine/bulk
 * body: { text, localuser }
 */

export const bulkAddMedicine = async (req, res) => {
  try {
    const { text, localuser } = req.body;

    // 1. Robust ID extraction (Handles both 'id' and '_id')
    const userId = localuser?.id || localuser?._id;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is missing from request. Please ensure you are logged in." 
      });
    }

    const medicines = parseBulkText(text);

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid medication data could be parsed from the text." 
      });
    }

    const success = [];
    const failed = [];

    for (const med of medicines) {
      try {
        const medicineDoc = new Medication({
          userId: userId, // Use the extracted ID
          ...med
        });

        await medicineDoc.save();

        // 2. Wrap calendar in try/catch so one calendar failure doesn't stop the whole loop
        try {
          await addMedicineToGoogleCalendar(userId, medicineDoc);
        } catch (calErr) {
          console.error(`Google Calendar error for ${med.pillName}:`, calErr.message);
        }

        success.push(medicineDoc);
      } catch (err) {
        failed.push({ med, error: err.message });
      }
    }

    // 3. Restart scheduler using the extracted ID
    startNotificationScheduler({
      user: {
        id: userId,
        name: localuser.name || "User",
        email: localuser.email
      }
    });

    res.status(201).json({
      success: true,
      successCount: success.length,
      added: success, // Helpful for frontend preview
      failed
    });

  } catch (err) {
    console.error("Bulk Controller Error:", err);
    res.status(500).json({ success: false, message: "Server error during bulk add" });
  }
};