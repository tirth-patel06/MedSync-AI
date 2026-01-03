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
    // Add each dose as a separate recurring event
    for (const dose of medicine.dosageTimes) {
      const [hour, minute] = dose.time.split(":").map(Number);
      let startDateTime = new Date(medicine.startDate);
      startDateTime.setHours(hour, minute);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 15); // default duration

      // Build recurrence rule
      let recurrence = ['RRULE:FREQ=DAILY']; // Default to daily
      
      // If specific days are selected, use weekly recurrence
      if (medicine.dosageDays && medicine.dosageDays.length > 0 && medicine.dosageDays.length < 7) {
        const dayMap = {
          'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 
          'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA', 'Sunday': 'SU'
        };
        const dayNumbers = {
          'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
          'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0
        };
        
        const byDay = medicine.dosageDays
          .map(day => dayMap[day])
          .filter(Boolean)
          .join(',');
        
        if (byDay) {
          recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`];
          
          // Adjust start date to first occurrence of selected day
          const selectedDayNumbers = medicine.dosageDays.map(day => dayNumbers[day]);
          const currentDayOfWeek = startDateTime.getDay();
          
          // Find next occurrence of one of the selected days
          let daysToAdd = 0;
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDayOfWeek + i) % 7;
            if (selectedDayNumbers.includes(checkDay)) {
              daysToAdd = i;
              break;
            }
          }
          
          // If today is already a selected day, use today; otherwise move to next occurrence
          if (!selectedDayNumbers.includes(currentDayOfWeek) && daysToAdd > 0) {
            startDateTime = new Date(startDateTime.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
            // Recalculate end time
            const newEndDateTime = new Date(startDateTime);
            newEndDateTime.setMinutes(newEndDateTime.getMinutes() + 15);
            endDateTime.setTime(newEndDateTime.getTime());
          }
        }
      }
      
      // Add end date if it exists and is not empty
      if (medicine.endDate && medicine.endDate.trim() !== '') {
        try {
          const endDate = new Date(medicine.endDate);
          const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
          recurrence = recurrence.map(rule => {
            if (rule.includes('FREQ=WEEKLY')) {
              return rule + `;UNTIL=${endDateStr}`;
            } else if (rule.includes('FREQ=DAILY')) {
              return rule + `;UNTIL=${endDateStr}`;
            }
            return rule;
          });
        } catch (dateError) {
          console.warn(`[Google Calendar] Invalid end date format: ${medicine.endDate}`);
        }
      }

      try {
        // Get user's timezone from system or use default
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        await calendar.events.insert({
          calendarId: "primary",
          resource: {
            summary: `Take ${medicine.pillName}`,
            description: medicine.pillDescription || "",
            start: { 
              dateTime: startDateTime.toISOString(),
              timeZone: userTimeZone
            },
            end: { 
              dateTime: endDateTime.toISOString(),
              timeZone: userTimeZone
            },
            recurrence: recurrence,
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: 5 }], // reminder 5 min before
            },
          },
        });
        eventCount++;
      } catch (eventError) {
        console.error(`[Google Calendar] Failed to create event for ${medicine.pillName} at ${dose.time}:`, eventError.message);
        // Collect error but continue with next dose
      }
    }
    
    if (eventCount === 0) {
      throw new Error("Failed to create any events for this medication");
    }
    
    return { success: true, eventsCreated: eventCount, medicineId: medicine._id };

  } catch (error) {
    console.error(`[Google Calendar] Sync failed for medicine ${medicine?.pillName || 'unknown'}:`, error.message);
    throw error; // Re-throw so caller knows sync failed
  }
};