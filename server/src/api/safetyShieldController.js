// src/api/safetyShieldController.js
import { getRxCui, checkInteractions } from '../services/interactionService.js';
import Medication from '../models/medicineModel.js'; // existing model, we only read

/**
 * POST /api/safety-shield/check
 * Body: { drugName: string }
 * Returns: { safe: boolean, interactions: [] }
 */
export const checkSafety = async (req, res) => {
    try {
        const { drugName } = req.body;
        if (!drugName) return res.status(400).json({ success: false, message: 'drugName required' });

        // Resolve RxCUI for the new drug
        const newRxCui = await getRxCui(drugName);
        if (!newRxCui) {
            return res.status(404).json({ success: false, message: 'Unable to resolve drug name to RxCUI' });
        }

        // Fetch user's existing medications (assumes auth middleware sets req.user.id)
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthenticated' });

        const existingMeds = await Medication.find({ userId, status: { $ne: 'deleted' } }, 'name');
        const existingNames = existingMeds.map(m => m.name);
        const existingRxCuis = await Promise.all(existingNames.map(name => getRxCui(name)));
        const filteredRxCuis = existingRxCuis.filter(Boolean);

        const interactions = await checkInteractions(newRxCui, filteredRxCuis);
        if (interactions.length === 0) {
            return res.json({ success: true, safe: true, interactions: [] });
        }
        return res.json({ success: true, safe: false, interactions });
    } catch (err) {
        console.error('SafetyShield error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
