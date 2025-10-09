import Medication from "../models/medicineModel.js"; // your mongoose model


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



export  const todaysMedication= async(req,res)=>{
     // Debug: log entire request body to inspect shape
     console.log("Request body for today's meds:", JSON.stringify(req.body, null, 2));
     const { localuser } = req.body || {};
     console.log("localuser in today med:", localuser);

     // Support multiple shapes: { id }, { user: { id } }, or nested objects from client
     let Id = null;
     if (!localuser) {
       console.warn("No localuser provided in request body");
     } else if (typeof localuser === 'string') {
       Id = localuser;
     } else if (localuser.id) {
       Id = String(localuser.id);
     } else if (localuser.user && localuser.user.id) {
       Id = String(localuser.user.id);
     }

    if (!Id) {
      console.error("Could not determine user id from localuser:", localuser);
      return res.status(400).json({ success: false, message: 'Missing or invalid localuser in request body' });
    }



    try{
        const today = new Date();
            const todayDay = today.toLocaleString("en-US", { weekday: "long" }); // e.g., "Monday"
            console.log("Today is:", todayDay);
        
            // Fetch medicines for the user and for today
           
             // Debug: ensure Id type
             console.log("Querying Medication with userId:", Id, "(type:", typeof Id, ") and day:", todayDay);
             const todaysMeds = await Medication.find({
               userId: Id,
               dosageDays: { $in: [todayDay] },
             });
             console.log("todays med", JSON.stringify(todaysMeds, null, 2));
                 // Sort by time ascending

    todaysMeds.sort((a, b) => {
      const timeA = getTimeForToday(a.dosageTimes[0].time); // assuming first time for simplicity
      const timeB = getTimeForToday(b.dosageTimes[0].time);
      return timeA - timeB;
    });
     return res.status(201).json({
      success: true,
      message: "todays medicine fetched successfully",
      data: todaysMeds
    });
    }
    catch(error){
        console.error("Error in fetching todays medicine",error)
    }
}






