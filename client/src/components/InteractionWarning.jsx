import { AlertTriangle, XCircle, CheckCircle, ShieldAlert } from 'lucide-react';

const SEVERITY_CONFIG = {
  major:    { color: 'red',    icon: XCircle,      label: 'Major Interaction',    bg: 'bg-red-950/60',    border: 'border-red-500',    badge: 'bg-red-500/20 text-red-300' },
  moderate: { color: 'yellow', icon: AlertTriangle, label: 'Moderate Interaction', bg: 'bg-yellow-950/60', border: 'border-yellow-500', badge: 'bg-yellow-500/20 text-yellow-300' },
  minor:    { color: 'blue',   icon: ShieldAlert,   label: 'Minor Interaction',    bg: 'bg-blue-950/60',   border: 'border-blue-500',   badge: 'bg-blue-500/20 text-blue-300' },
};

/**
 * InteractionWarning
 * Props:
 *   interactions   - array from backend
 *   highestSeverity - "major" | "moderate" | "minor"
 *   blocked        - bool (major interactions are blocked by default)
 *   onOverride     - called when user confirms override
 *   onCancel       - called when user cancels
 */
export default function InteractionWarning({ interactions, highestSeverity, blocked, onOverride, onCancel }) {
  const config = SEVERITY_CONFIG[highestSeverity] || SEVERITY_CONFIG.minor;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl border ${config.border} ${config.bg} backdrop-blur-xl shadow-2xl p-6 space-y-5`}>

        {/* Header */}
        <div className="flex items-center gap-3">
          <Icon className={`w-7 h-7 text-${config.color}-400 shrink-0`} />
          <div>
            <h2 className={`text-lg font-bold text-${config.color}-300`}>
              ⚠️ {config.label} Detected
            </h2>
            <p className="text-sm text-slate-400">
              This medication may interact with your existing regimen.
            </p>
          </div>
        </div>

        {/* Interaction list */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {interactions.map((interaction, idx) => (
            <div key={idx} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${config.badge}`}>
                  {interaction.severity}
                </span>
                <span className="text-sm font-medium text-white">
                  {interaction.drug1 || interaction.existingDrug} ↔ {interaction.drug2 || 'New medication'}
                </span>
              </div>
              <p className="text-sm text-slate-300">{interaction.description}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {blocked ? (
            <>
              <p className="text-sm text-red-300 text-center font-medium">
                Major interactions require doctor approval before proceeding.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onOverride}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Override & Add Anyway
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onOverride}
                className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                I Understand, Add Anyway
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}