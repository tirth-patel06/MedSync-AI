import React from 'react';
import { Globe, Eye } from 'lucide-react';

export const TranslationBadge = ({
  originalLanguage = 'en',
  currentLanguage = 'en',
  onShowOriginal = null,
  className = '',
}) => {
  const isTranslated = originalLanguage !== currentLanguage;

  const getLanguageLabel = (code) => {
    const labels = {
      en: 'English',
      es: 'Español',
      hi: 'हिन्दी',
    };
    return labels[code] || code.toUpperCase();
  };

  if (!isTranslated) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-300 ${className}`}
      role="status"
      aria-label={`Translated from ${getLanguageLabel(originalLanguage)} to ${getLanguageLabel(currentLanguage)}`}
    >
      <Globe size={14} />
      <span>
        Originally <span className="font-semibold">{getLanguageLabel(originalLanguage)}</span>
      </span>
      {onShowOriginal && (
        <button
          onClick={onShowOriginal}
          className="ml-1 p-0.5 rounded hover:bg-blue-200 transition-colors"
          title={`View original ${getLanguageLabel(originalLanguage)} text`}
          aria-label={`Show original ${getLanguageLabel(originalLanguage)} version`}
        >
          <Eye size={14} />
        </button>
      )}
    </div>
  );
};
