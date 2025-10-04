import Medication from "../models/medicineModel.js";
export const addMedication = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const{medication,localuser}=req.body;
    console.log("medicine",medication);
    const {
      pillName,
      pillDescription,
      dosageDays,
      dosageTimes,
      dosageAmount,
      frequency,
      startDate,
      endDate,
      doctorName,
      prescriptionId,
      adherenceHistory,
      notes
    } = medication;

    const sampleMedicine = new Medication({
      userId:localuser.id,
      pillName,
      pillDescription,
      dosageDays,
      dosageTimes,
      dosageAmount,
      frequency,
      startDate,
      endDate,
      doctorName,
      prescriptionId,
      adherenceHistory,
      notes
    });
    await sampleMedicine.save();
    return res.status(201).json({
      success: true,
      message: "Medication saved successfully",
      data: sampleMedicine
    });
  } catch (error) {
    console.error("Error saving medication:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving medication",
      error: error.message
    });
  }
};
