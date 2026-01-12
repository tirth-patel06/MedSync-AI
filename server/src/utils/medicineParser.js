// utils/medicineParser.js

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const DEFAULT_REMINDER = {
  remindBefore: "15m",
  remindAfter: "30m",
  status: "pending",
  takenAt: null
};

export const parseBulkText = (text) => {
  /**
   * Input example:
   * Paracetamol 500mg morning night
   * Aspirin 75mg once daily
   */

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const results = [];
  const failed = [];

  lines.forEach((line) => {
    const pillName = extractPillName(line);
    const dosageTimes = extractTimes(line);

    if (!pillName) {
      failed.push({ line, error: "Pill name not found" });
      return;
    }

    if (!dosageTimes || dosageTimes.length === 0) {
      failed.push({ line, error: "No dosage time detected" });
      return;
    }

    const startDate = new Date();
    const endDate = extractEndDate(line, startDate);

    if (isNaN(startDate) || isNaN(endDate)) {
      failed.push({ line, error: "Invalid date detected" });
      return;
    }

    results.push({
      pillName,
      pillDescription: line,
      dosageAmount: extractDosage(line),
      dosageDays: ALL_DAYS,
      dosageTimes,
      frequency: buildFrequency(dosageTimes.length),
      startDate,
      endDate
    });
  });

  return { success: results, failed };
};

/* ---------------- helpers ---------------- */

const extractPillName = (line) => {
  return line
    .replace(/(\d+\s?(mg|ml|mcg|iu|g))/i, "")
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .trim();
};

const extractDosage = (line) => {
  const match = line.match(/(\d+\s?(mg|ml|mcg))/i);
  return match ? match[0] : "1 dose";
};

const extractTimes = (line) => {
  const times = [];
  const lower = line.toLowerCase();

  if (lower.includes("morning"))
    times.push({ time: "08:00", ...DEFAULT_REMINDER });

  if (lower.includes("afternoon"))
    times.push({ time: "13:00", ...DEFAULT_REMINDER });

  if (lower.includes("evening"))
    times.push({ time: "18:00", ...DEFAULT_REMINDER });

  if (lower.includes("night"))
    times.push({ time: "20:00", ...DEFAULT_REMINDER });

  // once daily / fallback
  if (times.length === 0) {
    return [{ time: "09:00", ...DEFAULT_REMINDER }];
  }

  return times;
};

const buildFrequency = (timesCount) => {
  if (timesCount === 1) return "1 time a day";
  return `${timesCount} times a day`;
};

const extractEndDate = (line, startDate) => {
  const lower = line.toLowerCase();

  const dayMatch = lower.match(/for (\d+) day/);
  if (dayMatch) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + Number(dayMatch[1]));
    return d;
  }

  const weekMatch = lower.match(/for (\d+) week/);
  if (weekMatch) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + Number(weekMatch[1]) * 7);
    return d;
  }

  const monthMatch = lower.match(/for (\d+) month/);
  if (monthMatch) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + Number(monthMatch[1]));
    return d;
  }

  // default → 30 days
  const d = new Date(startDate);
  d.setDate(d.getDate() + 30);
  return d;
};
