import Medication from "../models/medicineModel.js";

export const medicineStatus = async (req, res) => {
  try {
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { localuser, medId, dosageTimeIndex, status } = req.body || {};

    const allowedStatuses = ["taken", "missed", "delayed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    let userId = null;
    if (typeof localuser === 'string') userId = localuser;
    else if (localuser?.id) userId = String(localuser.id);
    else if (localuser?.user?.id) userId = String(localuser.user.id);

    if (!userId || !medId) {
      return res.status(400).json({ success: false, message: "Missing user or medication" });
    }

    const medicine = await Medication.findOne({ _id: medId, userId });
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    const now = new Date();

 if (
  typeof dosageTimeIndex === 'number' &&
  Number.isInteger(dosageTimeIndex) &&
  dosageTimeIndex >= 0 &&
  dosageTimeIndex < medicine.dosageTimes.length
) {
  const dose = medicine.dosageTimes[dosageTimeIndex];

  dose.status = status;
  dose.takenAt = status === 'taken' ? now : null;

  medicine.adherenceHistory.push({
    date: now,
    time: dose.time,
    status,
    takenAt: status === 'taken' ? now : null
  });
} else {
  // Update all dosage times
  medicine.dosageTimes.forEach((dt) => {
    dt.status = status;
    dt.takenAt = status === 'taken' ? now : null;
  });

  medicine.adherenceHistory.push({
    date: now,
    time: medicine.dosageTimes[0]?.time || '',
    status,
    takenAt: status === 'taken' ? now : null
  });
}



    await medicine.save();

    return res.json({
      success: true,
      message: "Medication status updated",
      status
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error while updating medication status" });
  }
};
