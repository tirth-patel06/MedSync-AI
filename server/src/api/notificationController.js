import Medication from "../models/medicineModel.js"; // your mongoose model
import Notification from "../models/todayNotifications.js"; // new model
import notifier from "node-notifier";

// Global timer management to prevent duplicate notifications
const activeTimers = new Map(); // userId -> Set of timer IDs

// Clear all existing timers for a user
function clearUserTimers(userId) {
  const userTimers = activeTimers.get(userId);
  if (userTimers) {
    userTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    userTimers.clear();
    console.log(`🧹 Cleared ${userTimers.size || 0} existing timers for user ${userId}`);
  }
}

// Add timer to tracking
function addUserTimer(userId, timerId) {
  if (!activeTimers.has(userId)) {
    activeTimers.set(userId, new Set());
  }
  activeTimers.get(userId).add(timerId);
}

// Helper: convert HH:mm string to Date today
function getTimeForToday(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}


// Helper: convert "15m" -> ms
function parseDuration(str) {
  if (!str) return 0;
  const unit = str.slice(-1);
  const value = parseInt(str);
  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return 0;
}

// WebSocket notification helper - sends to connected clients
function sendNotification(title, body, userId = null, type = 'general') {
  const notificationData = {
    title,
    message: body,
    type,
    timestamp: new Date().toISOString(),
    id: Date.now() + Math.random() // Simple unique ID
  };
  
  console.log(`[WEBSOCKET NOTIFY] ${title}: ${body}`);
  
  // Send to all connected clients or specific user
  if (global.io) {
    if (userId) {
      // Send to specific user's room
      global.io.to(`user-${userId}`).emit('notification', notificationData);
      console.log(`Notification sent to user ${userId}`);
    } else {
      // Send to all connected clients
      global.io.emit('notification', notificationData);
      console.log('Notification sent to all clients');
    }
  } else {
    console.warn('Socket.IO not available - notification not sent');
  }
}




// Main scheduler
export default async function startNotificationScheduler(user) {
  console.log("📅 Starting daily medication notification scheduler...");
  console.log("User:id", user?.user.id); 
  console.log("user",user)  
  const userId = user.user.id.toString(); 

  // 🧹 Clear any existing timers for this user to prevent duplicates
  clearUserTimers(userId);
  console.log(`🔄 Restarting scheduler for user ${userId} - existing timers cleared`);

  try {
    const today = new Date();
    const todayDay = today.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
    const todayDate = today.toISOString().split("T")[0]; // e.g., "2025-10-04"
    console.log("Today is:", todayDay);

    // Fetch medicines for the user and for today
    const todaysMeds = await Medication.find({
      userId: userId,
      dosageDays: { $in: [todayDay] },
    });

    console.log("todays med", todaysMeds);

    // Sort by time ascending
    todaysMeds.sort((a, b) => {
      const timeA = getTimeForToday(a.dosageTimes[0].time); // assuming first time for simplicity
      const timeB = getTimeForToday(b.dosageTimes[0].time);
      return timeA - timeB;
    });

    // Schedule notifications for each medicine
    todaysMeds.forEach((med) => {
      med.dosageTimes.forEach(async (dose) => {
        const medTime = getTimeForToday(dose.time);

        // BEFORE reminder
        const beforeMs = medTime.getTime() - parseDuration(dose.remindBefore);
        if (beforeMs > Date.now()) {
          // 💾 Save to DB


          await Notification.findOneAndUpdate(
            { userId, date: todayDate },
            {
              $setOnInsert: { dayName: todayDay },
              $push: {
                notifications: {
                  title: "Medicine Reminder ⏰",
                  message: `Take ${med.pillName} in ${dose.remindBefore}`,
                  type: "before",
                  medicineId: med._id,
                  medicineName: med.pillName,
                  time: new Date(beforeMs),
                },
              },
            },
            { upsert: true, new: true }
          );

          const timerId = setTimeout(() => {
            sendNotification(
              "Medicine Reminder ⏰",
              `Take ${med.pillName} in ${dose.remindBefore}`,
              userId,
              "before"
            );
          }, beforeMs - Date.now());
          
          // Track the timer
          addUserTimer(userId, timerId);
          console.log(`⏰ Scheduled BEFORE reminder for ${med.pillName} at ${new Date(beforeMs).toLocaleTimeString()}`);
        }


  
        // ON-TIME reminder
        if (medTime.getTime() > Date.now()) {
          await Notification.findOneAndUpdate(
            { userId, date: todayDate },
            {
              $setOnInsert: { dayName: todayDay },
              $push: {
                notifications: {
                  title: "Time to Take Medicine 💊",
                  message: `Take ${med.pillName} now`,
                  type: "onTime",
                  medicineId: med._id,
                  medicineName: med.pillName,
                  time: medTime,
                },
              },
            },
            { upsert: true, new: true }
          );

          const timerId = setTimeout(() => {
            sendNotification(
              "Time to Take Medicine 💊",
              `Take ${med.pillName} now`,
              userId,
              "onTime"
            );

          }, medTime.getTime() - Date.now());
          
          // Track the timer
          addUserTimer(userId, timerId);
          console.log(`💊 Scheduled ON-TIME reminder for ${med.pillName} at ${medTime.toLocaleTimeString()}`);
        }

        // AFTER reminder
        const afterMs = medTime.getTime() + parseDuration(dose.remindAfter);
        if (afterMs > Date.now()) {
          await Notification.findOneAndUpdate(
            { userId, date: todayDate },
            {
              $setOnInsert: { dayName: todayDay },
              $push: {
                notifications: {
                  title: "Missed Dose ❗",
                  message: `Did you forget ${med.pillName}?`,
                  type: "after",
                  medicineId: med._id,
                  medicineName: med.pillName,
                  time: new Date(afterMs),
                },
              },
            },
            { upsert: true, new: true }
          );

          const timerId = setTimeout(() => {
            sendNotification(
              "Missed Dose ❗",
              `Did you forget ${med.pillName}?`,
              userId,
              "after"
            );
          }, afterMs - Date.now());
          
          // Track the timer
          addUserTimer(userId, timerId);
          console.log(`❗ Scheduled AFTER reminder for ${med.pillName} at ${new Date(afterMs).toLocaleTimeString()}`);
        }
      });
    });

    // 🔹 Dummy test notification after 10 seconds
    const testTimerId = setTimeout(async () => {
      sendNotification("🔔 Test Notification", "This is a dummy test alert!", userId, "test");

      await Notification.findOneAndUpdate(
        { userId, date: todayDate },
        {
          $setOnInsert: { dayName: todayDay },
          $push: {
            notifications: {
              title: "🔔 Test Notification",
              message: "This is a dummy test alert!",
              type: "test",
              time: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );
    }, 10 * 1000);
    
    // Track the test timer
    addUserTimer(userId, testTimerId);
    console.log(`🧪 Scheduled TEST notification in 10 seconds`);

    // Summary log
    const userTimers = activeTimers.get(userId);
    console.log(`✅ Total ${userTimers ? userTimers.size : 0} notifications scheduled for user ${userId}`);

  } catch (err) {
    console.error("Error scheduling notifications:", err);
  }
}

// Retrieve today's notification messages for a given userId
export async function getTodaysNotifications(userOrId) {
  try {
    // normalize input to userId string
    let userId = null;
    if (!userOrId) return [];
    if (typeof userOrId === 'string') userId = userOrId;
    else if (userOrId.id) userId = String(userOrId.id);
    else if (userOrId.user && userOrId.user.id) userId = String(userOrId.user.id);
    if (!userId) return [];

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    const doc = await Notification.findOne({ userId, date: todayDate }).lean();
    if (!doc) return [];
    // return the notifications array (each has title, message, time, etc.)
    return doc.notifications || [];
  } catch (err) {
    console.error('Error in getTodaysNotifications:', err);
    return [];
  }
}

// Express handler: expects { localuser } or { userId } in req.body
export async function getTodaysNotificationsHandler(req, res) {
  try {
    console.log('getTodaysNotificationsHandler body:', JSON.stringify(req.body));
    const { localuser, userId } = req.body || {};
    const data = await getTodaysNotifications(localuser || userId);
    return res.status(200).json({ success: true, message: 'Today notifications fetched', data });
  } catch (err) {
    console.error('Error in getTodaysNotificationsHandler:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
