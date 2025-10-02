// controllers/notificationController.js
import Medication from "../models/medicineModel.js"; // your mongoose model
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
const Id = user.user.id.toString();  
  try {
    const today = new Date();
    const todayDay = today.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
    console.log("Today is:", todayDay);

    // Fetch medicines for the user and for today
    const todaysMeds = await Medication.find();
     const meds = await Medication.find({ userId: Id ,
      dosageDays: { $in: [todayDay] },
     });
    console.log("todays med",todaysMeds)
    console.log("meds",meds)
    // Sort by time ascending
    todaysMeds.sort((a, b) => {
      const timeA = getTimeForToday(a.dosageTimes[0].time); // assuming first time for simplicity
      const timeB = getTimeForToday(b.dosageTimes[0].time);
      return timeA - timeB;
    });

    // Schedule notifications for each medicine
    todaysMeds.forEach((med) => {
      med.dosageTimes.forEach((dose) => {
        const medTime = getTimeForToday(dose.time);

        // Before
        const beforeMs = medTime.getTime() - parseDuration(dose.remindBefore);
        if (beforeMs > Date.now()) {
          setTimeout(() => {
            sendNotification(
              "Medicine Reminder ⏰",
              `Take ${med.pillName} in ${dose.remindBefore}`
            );
          }, beforeMs - Date.now());
        }

        // On-time
        if (medTime.getTime() > Date.now()) {
          setTimeout(() => {
            sendNotification(
              "Time to Take Medicine 💊",
              `Take ${med.pillName} now`
            );
          }, medTime.getTime() - Date.now());
        }

        // After
        const afterMs = medTime.getTime() + parseDuration(dose.remindAfter);
        if (afterMs > Date.now()) {
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
    setTimeout(() => {
      sendNotification("🔔 Test Notification", "This is a dummy test alert!");
    }, 10 * 1000);

  } catch (err) {
    console.error("Error scheduling notifications:", err);
  }
}
