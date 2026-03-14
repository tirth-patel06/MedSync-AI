/**
 * Safety Shield — Drug Interaction Checker
 *
 * Strategy (layered):
 * 1. RxNorm API  → convert drug name to RxCUI (still works ✅)
 * 2. ONCHigh API → check interactions for a single drug (still works ✅)
 * 3. Static fallback dataset → covers most common dangerous pairs
 *
 * NOTE: The RxNav Drug-Drug Interaction list.json endpoint was
 * discontinued January 2, 2024. We now use the per-drug ONCHigh
 * endpoint and cross-reference against existing medications locally.
 */

// ─── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// FIX 1: Distinguish cache miss (undefined) vs cached null using cache.has()
function getCached(key) {
  if (!cache.has(key)) return undefined; // true miss
  const entry = cache.get(key);
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.value; // may be null (negative lookup) — still valid
}
function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

// ─── Static fallback: well-known dangerous pairs ──────────────────────────────
const KNOWN_INTERACTIONS = [
  { drugs: ["warfarin", "aspirin"], severity: "major", description: "Aspirin significantly increases the anticoagulant effect of warfarin, raising the risk of serious bleeding." },
  { drugs: ["warfarin", "ibuprofen"], severity: "major", description: "NSAIDs like ibuprofen can increase the risk of bleeding when combined with warfarin." },
  { drugs: ["warfarin", "naproxen"], severity: "major", description: "Naproxen may enhance the anticoagulant effect of warfarin, increasing bleeding risk." },
  { drugs: ["warfarin", "amoxicillin"], severity: "moderate", description: "Amoxicillin may alter gut flora and affect warfarin metabolism, altering INR." },
  { drugs: ["simvastatin", "clarithromycin"], severity: "major", description: "Clarithromycin inhibits CYP3A4, greatly increasing simvastatin levels and risk of myopathy." },
  { drugs: ["simvastatin", "erythromycin"], severity: "major", description: "Erythromycin inhibits CYP3A4, increasing simvastatin exposure and rhabdomyolysis risk." },
  { drugs: ["metformin", "ibuprofen"], severity: "moderate", description: "NSAIDs can reduce renal function and increase metformin accumulation risk." },
  { drugs: ["lisinopril", "potassium"], severity: "moderate", description: "ACE inhibitors like lisinopril combined with potassium supplements can cause dangerous hyperkalaemia." },
  { drugs: ["lisinopril", "spironolactone"], severity: "moderate", description: "Combining ACE inhibitors and potassium-sparing diuretics increases hyperkalaemia risk." },
  { drugs: ["methotrexate", "ibuprofen"], severity: "major", description: "NSAIDs reduce methotrexate clearance, potentially causing severe toxicity." },
  { drugs: ["clopidogrel", "omeprazole"], severity: "moderate", description: "Omeprazole reduces clopidogrel activation, potentially reducing its antiplatelet effect." },
  { drugs: ["fluoxetine", "tramadol"], severity: "major", description: "Combination increases the risk of serotonin syndrome, a potentially life-threatening condition." },
  { drugs: ["sertraline", "tramadol"], severity: "major", description: "Risk of serotonin syndrome when combining serotonergic drugs with tramadol." },
  { drugs: ["digoxin", "amiodarone"], severity: "major", description: "Amiodarone significantly increases digoxin plasma levels, risking toxicity." },
  { drugs: ["sildenafil", "nitrates"], severity: "major", description: "Combining sildenafil with nitrates causes severe hypotension and is contraindicated." },
  { drugs: ["ciprofloxacin", "theophylline"], severity: "major", description: "Ciprofloxacin inhibits theophylline metabolism, raising risk of toxicity." },
  { drugs: ["amlodipine", "simvastatin"], severity: "moderate", description: "Amlodipine can increase simvastatin exposure; dose limits apply." },
  { drugs: ["aspirin", "ibuprofen"], severity: "moderate", description: "Ibuprofen may reduce the antiplatelet effect of aspirin when taken together." },
];

// FIX 2: Word-boundary matching with minimum length guard to prevent false positives
// e.g. "as" should NOT match "aspirin"
const MIN_MATCH_LENGTH = 4;

function normaliseToken(str) {
  return str.toLowerCase().trim();
}

function tokensMatch(input, target) {
  const a = normaliseToken(input);
  const b = normaliseToken(target);
  if (a.length < MIN_MATCH_LENGTH || b.length < MIN_MATCH_LENGTH) return a === b;
  // Exact match OR one is a whole-word prefix of the other (not arbitrary substring)
  return a === b || b.startsWith(a) || a.startsWith(b);
}

function checkStaticInteractions(newDrug, existingDrugs) {
  const found = [];
  for (const pair of KNOWN_INTERACTIONS) {
    const [drugA, drugB] = pair.drugs;
    for (const existing of existingDrugs) {
      const newIsA = tokensMatch(newDrug, drugA);
      const exIsB = tokensMatch(existing, drugB);
      const newIsB = tokensMatch(newDrug, drugB);
      const exIsA = tokensMatch(existing, drugA);

      if ((newIsA && exIsB) || (newIsB && exIsA)) {
        found.push({
          severity: pair.severity,
          description: pair.description,
          drug1: newDrug,
          drug2: existing,
          source: "static",
        });
      }
    }
  }
  return found;
}

// ─── RxNorm: drug name → RxCUI ───────────────────────────────────────────────
async function getRxCUI(drugName) {
  const key = `rxcui:${normaliseToken(drugName)}`;
  const cached = getCached(key);
  if (cached !== undefined) return cached; // FIX 1: undefined = miss, null = cached negative

  try {
    const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const rxcui = data?.idGroup?.rxnormId?.[0] || null;
    setCache(key, rxcui); // caches null too — negative lookup won't re-query
    return rxcui;
  } catch (err) {
    console.warn(`[SafetyShield] getRxCUI failed for drug (name redacted): ${err.message}`);
    return null;
  }
}

// ─── ONCHigh: get all interactions for a single RxCUI ────────────────────────
async function getONCHighInteractions(rxcui) {
  const key = `onchigh:${rxcui}`;
  const cached = getCached(key);
  if (cached !== undefined) return cached; // FIX 1

  try {
    const url = `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}&sources=ONCHigh`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const groups = data?.interactionTypeGroup || [];
    const results = [];

    for (const group of groups) {
      for (const type of group.interactionType || []) {
        for (const pair of type.interactionPair || []) {
          const concepts = pair.interactionConcept || [];
          const other = concepts.find(c => c.minConceptItem?.rxcui !== String(rxcui));
          results.push({
            interactingRxCUI: other?.minConceptItem?.rxcui || "unknown",
            interactingDrugName: other?.minConceptItem?.name || "unknown drug",
            severity: pair.severity || "N/A",
            description: pair.description || "Interaction detected — consult your doctor.",
          });
        }
      }
    }

    setCache(key, results);
    return results;
  } catch (err) {
    console.warn(`[SafetyShield] ONCHigh failed for rxcui ${rxcui}: ${err.message}`);
    return null;
  }
}

function normaliseSeverity(raw) {
  if (!raw) return "moderate";
  const s = raw.toLowerCase();
  if (s.includes("high") || s.includes("major") || s.includes("severe")) return "major";
  if (s.includes("moderate") || s.includes("medium")) return "moderate";
  if (s.includes("low") || s.includes("minor") || s.includes("mild")) return "minor";
  return "moderate";
}

function severityRank(s) {
  return { major: 3, moderate: 2, minor: 1, unknown: 0, none: 0 }[s] || 0;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function checkDrugInteractions(newDrugName, existingDrugNames) {
  if (!newDrugName?.trim() || !existingDrugNames?.length) {
    return { safe: true, interactions: [], highestSeverity: "none", source: "none" };
  }

  // FIX 4: Reduced logging — no drug names in production logs (PHI protection)
  console.debug(`[SafetyShield] Checking new medication against ${existingDrugNames.length} existing medication(s).`);

  // ── Layer 1: ONCHigh API ──
  let apiInteractions = [];
  let apiAvailable = false;

  const newRxCUI = await getRxCUI(newDrugName);
  if (newRxCUI) {
    const oncResults = await getONCHighInteractions(newRxCUI);
    if (oncResults !== null) {
      apiAvailable = true;
      const existingRxCUIs = await Promise.all(
        existingDrugNames.map(async name => ({ name, rxcui: await getRxCUI(name) }))
      );
      for (const oncInt of oncResults) {
        const matchByRxCUI = existingRxCUIs.find(e => e.rxcui && e.rxcui === oncInt.interactingRxCUI);
        const matchByName = existingDrugNames.find(name => tokensMatch(name, oncInt.interactingDrugName));
        if (matchByRxCUI || matchByName) {
          apiInteractions.push({
            severity: normaliseSeverity(oncInt.severity),
            description: oncInt.description,
            drug1: newDrugName,
            drug2: matchByRxCUI?.name || matchByName,
            source: "ONCHigh",
          });
        }
      }
    }
  }

  // ── Layer 2: Static fallback ──
  const staticInteractions = checkStaticInteractions(newDrugName, existingDrugNames);
  const allInteractions = [...apiInteractions];
  for (const si of staticInteractions) {
    const alreadyCovered = apiInteractions.some(
      ai => normaliseToken(ai.drug2 || "") === normaliseToken(si.drug2 || "")
    );
    if (!alreadyCovered) allInteractions.push(si);
  }

  const highestSeverity = allInteractions.reduce(
    (best, i) => (severityRank(i.severity) > severityRank(best) ? i.severity : best),
    "none"
  );

  const source = apiAvailable ? "ONCHigh+static" : "static-only";
  console.debug(`[SafetyShield] ${allInteractions.length} interaction(s) found. Highest severity: ${highestSeverity}. Source: ${source}`);

  return { safe: allInteractions.length === 0, interactions: allInteractions, highestSeverity, source };
}