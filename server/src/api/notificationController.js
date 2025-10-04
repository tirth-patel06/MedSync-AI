import Medication from "../models/medicineModel.js"; // your mongoose model
import Notification from "../models/todayNotifications.js"; // new model
import notifier from "node-notifier";

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

// Node desktop notification helper (for local testing)
function sendNotification(title, body) {
  notifier.notify({
    title,
    message: body,
    sound: true,
    wait: false
  });

  console.log(`[NOTIFY] ${title}: ${body}`);
}



// Main scheduler
export default async function startNotificationScheduler(user) {
  console.log("📅 Starting daily medication notification scheduler...");
  console.log("User:id", user?.user.id); 
  console.log("user",user)  
  const userId = user.user.id.toString(); 


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

          setTimeout(() => {
            sendNotification(
              "Medicine Reminder ⏰",
              `Take ${med.pillName} in ${dose.remindBefore}`
            );
          }, beforeMs - Date.now());
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

          setTimeout(() => {
            sendNotification(
              "Time to Take Medicine 💊",
              `Take ${med.pillName} now`
            );
          }, medTime.getTime() - Date.now());
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

          setTimeout(() => {
            sendNotification(
              "Missed Dose ❗",
              `Did you forget ${med.pillName}?`
            );
          }, afterMs - Date.now());
        }
      });
    });

    // 🔹 Dummy test notification after 10 seconds
    setTimeout(async () => {
      sendNotification("🔔 Test Notification", "This is a dummy test alert!");

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
