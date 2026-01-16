// src/services/interactionService.js
import axios from 'axios';
import NodeCache from 'node-cache';

// Cache for 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

const RXNAV_BASE = 'https://rxnav.nlm.nih.gov/REST';

/**
 * Resolve a drug name (or synonym) to its RxNorm Concept Unique Identifier (RxCUI).
 * Returns a string RxCUI or null if not found.
 */
export async function getRxCui(drugName) {
    const cacheKey = `rxcui:${drugName.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        const resp = await axios.get(`${RXNAV_BASE}/rxcui.json`, {
            params: { name: drugName }
        });
        const id = resp.data.idGroup?.rxnormId?.[0] || null;
        cache.set(cacheKey, id);
        return id;
    } catch (err) {
        console.error('RxNav name lookup error:', err.message);
        return null;
    }
}

/**
 * Check interactions between a new drug RxCUI and an array of existing RxCUIs.
 * Returns an array of interaction objects (empty if none).
 */
export async function checkInteractions(newRxCui, existingRxCuis) {
    if (!newRxCui || !existingRxCuis?.length) return [];

    const cacheKey = `interact:${newRxCui}:${existingRxCuis.sort().join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        const ids = [newRxCui, ...existingRxCuis].join('+');
        const resp = await axios.get(`${RXNAV_BASE}/interaction/list.json`, {
            params: { rxcuis: ids }
        });
        const interactionTypeGroup = resp.data.fullInteractionTypeGroup?.[0]?.fullInteractionType || [];
        const interactions = interactionTypeGroup.map(it => ({
            drugA: it.interactionPair?.[0]?.interactionConcept?.[0]?.sourceConceptItem?.name,
            drugB: it.interactionPair?.[0]?.interactionConcept?.[1]?.sourceConceptItem?.name,
            severity: it.severity,
            description: it.interactionPair?.[0]?.description
        }));
        cache.set(cacheKey, interactions);
        return interactions;
    } catch (err) {
        console.error('RxNav interaction lookup error:', err.message);
        return [];
    }
}
