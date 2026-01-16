import { google } from "googleapis";
import User from "../models/User.js";
import Medication from "../models/medicineModel.js";

// Smart Calendar Sync - Main Controller
export const syncMedicationsToCalendar = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(`[Calendar Sync] Starting sync request for user: ${userId}`);
    
    if (!userId) {
      console.warn(`[Calendar Sync] Missing authenticated user ID`);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    console.log(`🔄 Starting smart calendar sync for user: ${userId}`);

    // Get user and check if Google Calendar is linked
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[Calendar Sync] User ${userId} not found`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.googleTokens) {
      console.warn(`[Calendar Sync] User ${userId} has no Google tokens. Calendar not linked.`);
      return res.status(400).json({ 
        success: false, 
        message: "Google Calendar not linked. Please connect your calendar first." 
      });
    }

    console.log(`[Calendar Sync] User authenticated. Fetching medications...`);

    // Get all user medications
    const medications = await Medication.find({ userId });
    console.log(`[Calendar Sync] Found ${medications.length} medications for user ${userId}`);
    
    if (medications.length === 0) {
      console.log(`[Calendar Sync] No medications to sync for user ${userId}`);
      return res.status(200).json({ 
        success: true, 
        message: "No medications found to sync",
        syncedEvents: 0
      });
    }

    // Setup Google Calendar API
    console.log(`[Calendar Sync] Setting up Google Calendar API...`);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(user.googleTokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Clear existing medication events (optional - remove old synced events)
    console.log(`[Calendar Sync] Clearing existing medication events...`);
    await clearExistingMedicationEvents(calendar, userId);

    // Smart sync all medications
    console.log(`[Calendar Sync] Starting smart sync for ${medications.length} medications...`);
    const syncResults = await smartSyncMedications(calendar, medications, userId);

    // Update user's last sync time
    await User.findByIdAndUpdate(userId, {
      lastCalendarSync: new Date(),
      calendarSyncEnabled: true
    });

    console.log(`[Calendar Sync] Sync completed successfully. Created ${syncResults.totalEvents} events`);

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${syncResults.totalEvents} medication events to Google Calendar`,
      syncedMedications: syncResults.medicationCount,
      syncedEvents: syncResults.totalEvents,
      syncDetails: syncResults.details
    });

  } catch (error) {
    console.error(`[Calendar Sync] Sync failed:`, error.message);
    console.error(`Error details:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync medications to calendar",
      error: error.message
    });
  }
};

async function smartSyncMedications(calendar, medications, userId) {
  let totalEvents = 0;
  const details = [];

  for (const medication of medications) {
    try {
      const medicationEvents = await createSmartMedicationEvents(calendar, medication);
      totalEvents += medicationEvents.length;
      
      details.push({
        pillName: medication.pillName,
        eventsCreated: medicationEvents.length,
        schedule: medication.dosageTimes.map(dt => dt.time),
        days: medication.dosageDays
      });

      console.log(`📅 Created ${medicationEvents.length} events for ${medication.pillName}`);
    } catch (error) {
      console.error(`❌ Failed to sync ${medication.pillName}:`, error);
      depillName: medication.pillName,
        tails.push({
        error: error.message,
        eventsCreated: 0
      });
    }
  }

  return {
    medicationCount: medications.length,
    totalEvents,
    details
  };
}
        
// Create smart recurring events for a medication
async function createSmartMedicationEvents(calendar, medication) {
  const events = [];
  const today = new Date();
  const syncEndDate = new Date();
  syncEndDate.setDate(today.getDate() + 30); // Sync for next 30 days

  // Convert day names to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMapping = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };

  for (const dosageTime of medication.dosageTimes) {
    // Create recurring event for each dosage time
    const [hour, minute] = dosageTime.time.split(':').map(Number);
    
    // Calculate next occurrence of each selected day
    for (const day of medication.dosageDays) {
      const dayNumber = dayMapping[day];
      const nextOccurrence = getNextDayOccurrence(today, dayNumber);
      
      if (nextOccurrence <= syncEndDate) {
        const eventDetails = createMedicationEvent(medication, dosageTime, nextOccurrence, hour, minute);
        
        try {
          const createdEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: eventDetails
          });
          events.push(createdEvent.data);
        } catch (error) {
          console.error(`Failed to create event for ${medication.pillName}:`, error);
        }
      }
    }
  }

  return events;
}

// Create a single medication event with smart details
function createMedicationEvent(medication, dosageTime, date, hour, minute) {
  const startDateTime = new Date(date);
  startDateTime.setHours(hour, minute, 0, 0);
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + 15); // 15-minute duration

  // Smart title and description
  const title = `💊 ${medication.pillName} - ${medication.dosageAmount || 'Take as prescribed'}`;
  
  const description = `
🏥 MEDICATION REMINDER

💊 Medication: ${medication.pillName}
📋 Dosage: ${medication.dosageAmount || 'As prescribed'}
🔄 Frequency: ${medication.frequency || 'As scheduled'}
📝 Notes: ${medication.pillDescription || 'No additional notes'}

⏰ Reminder Settings:
• Before: ${dosageTime.remindBefore}
• After: ${dosageTime.remindAfter}

📱 This event was synced from InsightX Health App
`.trim();

  // Convert reminder time to minutes
  const reminderMinutes = parseReminderTime(dosageTime.remindBefore);

  return {
    summary: title,
    description: description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'UTC'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: reminderMinutes },
        { method: 'email', minutes: reminderMinutes * 2 } // Email reminder earlier
      ]
    },
    colorId: '11', // Red color for medical events
    source: {
      title: 'InsightX Health App',
      url: 'http://localhost:5173/dashboard'
    },
    extendedProperties: {
      private: {
        'insightx-medication-id': medication._id.toString(),
        'insightx-sync': 'true',
        'app': 'insightx-health'
      }
    }
  };
}

// Helper function to get next occurrence of a specific day
function getNextDayOccurrence(fromDate, targetDayNumber) {
  const result = new Date(fromDate);
  const currentDay = result.getDay();
  const daysUntilTarget = (targetDayNumber - currentDay + 7) % 7;
  
  if (daysUntilTarget === 0) {
    // If it's the same day, use today if time hasn't passed, otherwise next week
    const now = new Date();
    if (result.getHours() < now.getHours() || 
        (result.getHours() === now.getHours() && result.getMinutes() <= now.getMinutes())) {
      result.setDate(result.getDate() + 7);
    }
  } else {
    result.setDate(result.getDate() + daysUntilTarget);
  }
  
  return result;
}

// Parse reminder time string to minutes
function parseReminderTime(timeStr) {
  if (!timeStr) return 15; // Default 15 minutes
  
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr);
  
  if (unit === 'm') return value;
  if (unit === 'h') return value * 60;
  return 15; // Default fallback
}

// Clear existing InsightX medication events
async function clearExistingMedicationEvents(calendar, userId) {
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      q: 'InsightX Health App', // Search for our app's events
      singleEvents: true,
      orderBy: 'startTime'
    });

    const eventsToDelete = response.data.items.filter(event => 
      event.extendedProperties?.private?.['insightx-sync'] === 'true'
    );

    console.log(`🗑️ Clearing ${eventsToDelete.length} existing medication events`);

    for (const event of eventsToDelete) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: event.id
        });
      } catch (error) {
        console.error(`Failed to delete event ${event.id}:`, error);
      }
    }

    return eventsToDelete.length;
  } catch (error) {
    console.error('Error clearing existing events:', error);
    return 0;
  }
}

// Get calendar sync status
export const getCalendarSyncStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isLinked = !!user.googleTokens;
    const lastSync = user.lastCalendarSync || null;
    const syncEnabled = user.calendarSyncEnabled || false;

    return res.status(200).json({
      success: true,
      isLinked,
      syncEnabled,
      lastSync,
      message: isLinked ? "Google Calendar is connected" : "Google Calendar not connected"
    });

  } catch (error) {
    console.error("Error checking sync status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check sync status",
      error: error.message
    });
  }
};
