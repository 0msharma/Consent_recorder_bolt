import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: Language | null;
  onSelectLanguage: (language: Language) => void;
  onProceed: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  onProceed,
}) => {
  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Step 1: Select Your Language
        </h3>
        {/* <p className="text-gray-600">
          Choose the language in which you want to give your consent
        </p> */}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onSelectLanguage(language)}
            className={`language-pill ${
              selectedLanguage?.code === language.code
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white bg-opacity-50 text-gray-700 hover:bg-white hover:bg-opacity-100'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="font-medium">{language.name}</span>
              <span className="text-xs opacity-90">{language.nativeName}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={onProceed}
          disabled={!selectedLanguage}
          className={`enterprise-button w-full flex items-center justify-center space-x-2 ${
            selectedLanguage
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Proceed to Consent</span>
          <ArrowRight size={20} />
        </button>
        
        {/* {!selectedLanguage && (
          <p className="text-sm text-blue-600 mt-2">
            Please select a language to continue
          </p>
        )} */}
      </div>
    </div>
  );
};

export default LanguageSelector;