import Medication from "../models/medicineModel.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const meds = await Medication.find({ userId });

    console.log("Fetching analytics for user:", userId);
    console.log("Found meds:", meds.length);
    console.log("Fetched meds:", JSON.stringify(meds, null, 2));

    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    let analytics = {
      taken: 0,
      missed: 0,
      delayed: 0,
      pending: 0,
      byDay: {}
    };

    // Initialize byDay counts
    days.forEach(day => {
      analytics.byDay[day] = { taken:0, missed:0, delayed:0, pending:0 };
    });

    meds.forEach(med => {
      try {
        // Count planned doses
        med.dosageDays.forEach(day => {
          med.dosageTimes.forEach(dt => {
            const status = dt.status || "pending";
            analytics[status] = (analytics[status] || 0) + 1;

            const shortDay = day.slice(0,3); // "Wednesday" -> "Wed"
            if (analytics.byDay[shortDay]) {
              analytics.byDay[shortDay][status] = 
                (analytics.byDay[shortDay][status] || 0) + 1;
            }
          });
        });

        // Count actual adherence
        med.adherenceHistory.forEach(entry => {
          const dateObj = new Date(entry.date);
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          analytics[entry.status] = (analytics[entry.status] || 0) + 1;
          if (analytics.byDay[dayName]) {
            analytics.byDay[dayName][entry.status] = 
              (analytics.byDay[dayName][entry.status] || 0) + 1;
          }
        });

      } catch (err) {
        console.error("Error processing med:", med._id, err);
      }
    });

    // Send response after processing all meds
    res.json(analytics);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};