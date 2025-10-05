import User from '../models/User.js';
import HealthProfile from '../models/HealthProfile.js';
import Medication from '../models/medicineModel.js';
import axios from 'axios';

const formatAdherenceHistory = async (allMedi, startDate, endDate) => {
    const historyLog = [];
    allMedi.forEach(med => {
        med.adherenceHistory.forEach(h=>{
            const historyDate = new Date(h.date);
            if(historyDate>=startDate && historyDate<=endDate){
                historyLog.push({
                    historyDate: historyDate.toDateString(),
                    historyTime: h.time,
                    historyStatus: h.status,
                    historyTakenAt: h.takenAt ? new Date(h.takenAt).toLocaleString() : 'N/A',
                });
            }
        });
    });

    return historyLog.sort((a, b) => new Date(a.historyDate) - new Date(b.historyDate));
}

const calculateReportMetrics = async (allMedi, startDate, endDate) => {
    let totalScheduledDoses = 0;
    let totalTakenDoses = 0;

    //call and check the condition for each medi
    const medicationPerformance = allMedi.map(med => {
        const relavantHistory = med.adherenceHistory.filter(h => {
            const historyDate = new Date(h.date);
            return historyDate >= startDate && historyDate <= endDate;
        });

        const scheduled = relavantHistory.length;
        const taken = relavantHistory.map(h => h.status === 'taken').length;
        const missed = scheduled - taken;

        totalScheduledDoses += scheduled;
        totalTakenDoses += taken;

        return{
            pillName: med.pillName,
            pillDescription: med.pillDescription || ' ',
            dosageAmount: med.dosageAmount,
            frequency: med.frequency,
            medicationAdherenceRate: scheduled>0 ? Math.round((taken / scheduled) * 100) : 100,
            missedDosesCountForPill: missed,
        }
    })

    const totalMissedDoses = totalScheduledDoses - totalTakenDoses;
    const overallAdherenceRate = totalScheduledDoses > 0 ? Math.round((totalTakenDoses / totalScheduledDoses) * 100) : 100;

    return{
        overallAdherenceRate,
        totalScheduledDoses,
        totalTakenDoses,
        totalMissedDoses,
        medications: medicationPerformance, //detailed report of each medi in the array form 
    }
}

const getUserAndHealthData = async (userId) => {
    const user = await User.findById(userId).lean();

    const profile = await HealthProfile.findOne({user: userId}).lean();

    if (!user) {
        throw new Error("User not found");
    }

    return{
        userName: user.name,
        userEmail: user.email,
        age: profile?.age || 'N/A',
        gender: profile?.gender || 'N/A',
        weight: profile?.weight ? `${profile.weight} kg` : 'N/A', //add formate
        height: profile?.height ? `${profile.height} cm` : 'N/A',
    };
}


export default generateReport = async (req, res) => {
    try{
        const userId = req.user.id;
        const { periodInDays = 30 } = req.body;     // time peeriod for which we generate the report

        const startDate = new Date();
        const endDate = new Date();
        startDate.setDate(endDate.getDate()-periodInDays);

        const allMedi = await Medication.find({userId}).lean();
        const patientInfo = await getUserAndHealthData(userId);

        const reportMatrix = await calculateReportMetrics(allMedi, startDate, endDate);
        const adherenceHistory = await formatAdherenceHistory(allMedi, startDate, endDate);

        const JsonPayload = {
            ...patientInfo,
            reportPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            generationDate: endDate.toLocaleDateString(),
            ...reportMatrix,
            adherenceHistory,
        };

        

    }catch(err){

    }
}