import Medication from "../models/medicineModel.js";

export const medicineStatus = async (req, res) => {
  try {
   
    console.log("Request body for medicineStatus:", JSON.stringify(req.body, null, 2));

    const { localuser, medId, dosageTimeIndex } = req.body || {};
 
     


//did this bifurcation bcz local user format is diff in diff parts....
//it handles all the formats
    let userId = null;
    if (!localuser) {
      console.warn("medicineStatus: missing localuser in body");
    } else if (typeof localuser === 'string') {
      userId = localuser;
    } else if (localuser.id) {
      userId = String(localuser.id);
    } else if (localuser.user && localuser.user.id) {
      userId = String(localuser.user.id);
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing or invalid localuser" });
    }

    if (!medId) {
      return res.status(400).json({ success: false, message: "Missing medId" });
    }

    
    // Find the medicine document belonging to this user
    const medicine = await Medication.findOne({ _id: medId, userId: userId });
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found for this user" });
    }

    // If dosageTimeIndex is provided, update that specific dose; otherwise mark all dosageTimes as taken
    const now = new Date();
    if (typeof dosageTimeIndex === 'number' && medicine.dosageTimes[dosageTimeIndex]) {
      medicine.dosageTimes[dosageTimeIndex].status = 'taken';
      medicine.dosageTimes[dosageTimeIndex].takenAt = now;

      // push adherence history for that specific dose
      medicine.adherenceHistory.push({
        date: now,
        time: medicine.dosageTimes[dosageTimeIndex].time,
        status: 'taken',
        takenAt: now
      });
    } else {
      // Mark all as taken
      medicine.dosageTimes.forEach((dt) => {
        dt.status = 'taken';
        dt.takenAt = now;
      });
      // push a generic adherence entry for today
      medicine.adherenceHistory.push({
        date: now,
        time: medicine.dosageTimes[0]?.time || '',
        status: 'taken',
        takenAt: now
      });
    }

    await medicine.save();

    return res.status(200).json({ success: true, message: 'Medicine status updated', data: medicine });
  } catch (error) {
    console.error('Error updating medicine status:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating medicine status', error: error.message });
  }
};



