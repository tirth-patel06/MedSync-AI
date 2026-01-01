import { google } from "googleapis";
import User from "../models/User.js";

export const addMedicineToGoogleCalendar = async (userId, medicine) => {
  try {
    if (!userId) {
      console.warn("[Google Calendar] No userId provided for calendar sync");
      throw new Error("User ID is required for Google Calendar sync");
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[Google Calendar] User ${userId} not found in database`);
      throw new Error(`User ${userId} not found`);
    }

    if (!user?.googleTokens) {
      console.warn(`[Google Calendar] User ${userId} has no Google tokens stored. Please reconnect Google Calendar.`);
      throw new Error("Google Calendar not connected. Please authenticate first.");
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.googleTokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    let eventCount = 0;
    // Add each dose as a separate event
    for (const dose of medicine.dosageTimes) {
      const [hour, minute] = dose.time.split(":").map(Number);
      const startDateTime = new Date(medicine.startDate);
      startDateTime.setHours(hour, minute);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 15); // default duration

      try {
        const event = await calendar.events.insert({
          calendarId: "primary",
          resource: {
            summary: `Take ${medicine.pillName}`,
            description: medicine.pillDescription || "",
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: 5 }], // reminder 5 min before
            },
          },
        });
        eventCount++;
      } catch (eventError) {
        console.error(`[Google Calendar] Failed to create event for ${medicine.pillName} at ${dose.time}:`, eventError.message);
        throw eventError;
      }
    }
    return { success: true, eventsCreated: eventCount, medicineId: medicine._id };

  } catch (error) {
    console.error(`[Google Calendar] Sync failed for medicine ${medicine?.pillName || 'unknown'}:`, error.message);
    throw error; // Re-throw so caller knows sync failed
  }
};