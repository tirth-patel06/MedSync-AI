import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const ReadabilityIndicator = ({
  score,
  readingLevel,
  showDetails = false,
  showRecommendations = false,
  recommendations = [],
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine color based on reading level
  const getColorClasses = () => {
    if (!readingLevel) {
      return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-200' };
    }

    const key = readingLevel.toLowerCase();
    if (key.includes('elementary') || key === 'easy' || key.includes('fairly_easy')) {
      return { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-200 text-green-800' };
    }
    if (key.includes('standard') || key.includes('high')) {
      return { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-200 text-yellow-800' };
    }
    return { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-200 text-red-800' };
  };

  const getIcon = () => {
    if (!readingLevel) return null;
    const key = readingLevel.toLowerCase();
    if (key.includes('elementary') || key === 'easy' || key.includes('fairly_easy')) {
      return <CheckCircle size={20} className="text-green-600" />;
    }
    if (key.includes('standard') || key.includes('high')) {
      return <AlertCircle size={20} className="text-yellow-600" />;
    }
    return <AlertCircle size={20} className="text-red-600" />;
  };

  const colors = getColorClasses();

  if (!score && score !== 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Indicator Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${colors.badge} cursor-help transition-shadow duration-200 hover:shadow-md`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="status"
        aria-label={`Readability level: ${readingLevel} (Grade ${Math.round(score)})`}
      >
        {getIcon()}
        <span className="text-sm font-semibold">{Math.round(score)}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 w-64 p-3 rounded-lg bg-white border border-gray-200 shadow-lg`}>
          <div className={`text-sm font-semibold ${colors.text}`}>{readingLevel || 'Unknown'}</div>
          <div className="text-xs text-gray-600 mt-1">
            Flesch-Kincaid Grade Level: {score.toFixed(1)}
          </div>
          {showDetails && (
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div>• Suitable for grades {Math.floor(score)}-{Math.ceil(score)}</div>
              <div>• Adjust vocabulary and sentence length if too complex</div>
            </div>
          )}
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className={`mt-3 p-3 rounded-lg ${colors.bg} border border-gray-200`}>
          <div className="flex items-center gap-2 mb-2">
            {getIcon()}
            <span className={`font-semibold ${colors.text}`}>{readingLevel || 'Unknown'}</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Grade Level: {Math.round(score)}</div>
            <div>Flesch Score: {score.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <div className="font-semibold">Readability Suggestions:</div>
              <ul className="list-disc list-inside space-y-1">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
