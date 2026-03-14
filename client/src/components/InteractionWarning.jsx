import { useEffect, useRef } from 'react';
import { AlertTriangle, XCircle, CheckCircle, ShieldAlert } from 'lucide-react';

// FIX 3: Full Tailwind class strings instead of dynamic template literals
// so Tailwind's class scanner includes them in production builds
const SEVERITY_CONFIG = {
  major: {
    icon: XCircle,
    label: 'Major Interaction',
    wrapperClass: 'bg-red-950/60 border-red-500',
    iconClass: 'text-red-400',
    headingClass: 'text-red-300',
    badgeClass: 'bg-red-500/20 text-red-300',
    overrideBtnClass: 'bg-red-600 hover:bg-red-700',
  },
  moderate: {
    icon: AlertTriangle,
    label: 'Moderate Interaction',
    wrapperClass: 'bg-yellow-950/60 border-yellow-500',
    iconClass: 'text-yellow-400',
    headingClass: 'text-yellow-300',
    badgeClass: 'bg-yellow-500/20 text-yellow-300',
    overrideBtnClass: 'bg-yellow-600 hover:bg-yellow-700',
  },
  minor: {
    icon: ShieldAlert,
    label: 'Minor Interaction',
    wrapperClass: 'bg-blue-950/60 border-blue-500',
    iconClass: 'text-blue-400',
    headingClass: 'text-blue-300',
    badgeClass: 'bg-blue-500/20 text-blue-300',
    overrideBtnClass: 'bg-blue-600 hover:bg-blue-700',
  },
};

/**
 * InteractionWarning modal
 * Props:
 *   interactions    - array of interaction objects from backend
 *   highestSeverity - "major" | "moderate" | "minor"
 *   blocked         - bool (major = true, harder override)
 *   onOverride      - called when user confirms override
 *   onCancel        - called when user cancels
 */
export default function InteractionWarning({ interactions, highestSeverity, blocked, onOverride, onCancel }) {
  const config = SEVERITY_CONFIG[highestSeverity] || SEVERITY_CONFIG.minor;
  const Icon = config.icon;
  const headingId = "interaction-warning-title";
  const descId = "interaction-warning-desc";

  // FIX 4: Focus management — trap focus inside modal on open
  const modalRef = useRef(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    modalRef.current?.focus();
    return () => previouslyFocused?.focus(); // restore focus on close
  }, []);

  return (
    // FIX 4: ARIA dialog semantics for screen readers
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`w-full max-w-lg rounded-2xl border ${config.wrapperClass} backdrop-blur-xl shadow-2xl p-6 space-y-5 outline-none`}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Icon className={`w-7 h-7 ${config.iconClass} shrink-0`} aria-hidden="true" />
          <div>
            <h2 id={headingId} className={`text-lg font-bold ${config.headingClass}`}>
              ⚠️ {config.label} Detected
            </h2>
            <p id={descId} className="text-sm text-slate-400">
              This medication may interact with your existing regimen.
            </p>
          </div>
        </div>

        {/* Interaction list */}
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-1" aria-label="Detected interactions">
          {interactions.map((interaction, idx) => (
            <li key={idx} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${config.badgeClass}`}>
                  {interaction.severity}
                </span>
                <span className="text-sm font-medium text-white">
                  {interaction.drug1} ↔ {interaction.drug2}
                </span>
              </div>
              <p className="text-sm text-slate-300">{interaction.description}</p>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {blocked && (
            <p className="text-sm text-red-300 text-center font-medium">
              Major interactions require doctor approval before proceeding.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onOverride}
              className={`px-4 py-2.5 ${config.overrideBtnClass} rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2`}
            >
              {blocked
                ? <><XCircle className="w-4 h-4" aria-hidden="true" /> Override & Add Anyway</>
                : <><CheckCircle className="w-4 h-4" aria-hidden="true" /> I Understand, Add Anyway</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}