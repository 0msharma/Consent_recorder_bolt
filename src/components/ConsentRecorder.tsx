import React, { useState } from 'react';
import { Language, RecordingStatus } from '../types';
import LanguageSelector from './LanguageSelector';
import RecordingInterface from './RecordingInterface';
import { LANGUAGES } from '../constants/languages';

interface ConsentRecorderProps {
  onNotify: (message: string, type: 'info' | 'success' | 'error') => void;
  watchedDuration: number;
}

const ConsentRecorder: React.FC<ConsentRecorderProps> = ({ onNotify, watchedDuration }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [showRecordingInterface, setShowRecordingInterface] = useState(false);
  
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleProceed = () => {
    if (selectedLanguage) {
      setShowRecordingInterface(true);
      onNotify('Please proceed with your consent recording', 'info');
    }
  };
  
  const handleStartRecording = () => {
    setRecordingStatus('recording');
    onNotify('Recording started', 'info');
  };
  
  const handleStopRecording = () => {
    setRecordingStatus('completed');
    onNotify('Recording completed successfully', 'success');
  };
  
  return (
    <div className="h-full flex flex-col glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 border-opacity-20">
        <h2 className="text-xl font-semibold text-gray-800">Consent Recording</h2>
      </div>
      
      <div className="p-6 flex-grow overflow-y-auto">
        {!showRecordingInterface && (
          <LanguageSelector
            languages={LANGUAGES}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleSelectLanguage}
            onProceed={handleProceed}
          />
        )}
        
        {showRecordingInterface && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-gray-700 font-medium mb-1">
                {{
                  en: 'Consent Statement (Please read aloud the text shown below):',
                  hi: 'सहमति विवरण (कृपया नीचे दिया गया पाठ ज़ोर से पढ़ें):',
                  kn: 'ಸಮ್ಮತಿ ಹೇಳಿಕೆ (ದಯವಿಟ್ಟು ಕೆಳಗೆ ಕೊಟ್ಟಿರುವ ಪಠ್ಯವನ್ನು ಜೋರಾಗಿ ಓದಿ):',
                  ta: 'ஒப்புதல் அறிக்கை (தயவுசெய்து கீழே கொடுக்கப்பட்டுள்ள உரையை சத்தமாக வாசிக்கவும்):',
                  te: 'సమ్మతి ప్రకటన (దయచేసి క్రింద ఇచ్చిన వాక్యాన్ని పెద్దగా చదవండి):',
                  bn: 'সম্মতি বিবৃতি (অনুগ্রহ করে নিচে দেওয়া পাঠটি জোরে পড়ুন):'
                }[selectedLanguage?.code || 'en']}
              </p>
              <p className="text-gray-800 italic">
                {{
                  en: 'I [Name] have thoroughly reviewed and understood the product, and I am ready to proceed with the application.',
                  hi: 'मैं [नाम] ने उत्पाद की पूरी तरह से समीक्षा की है और उसे समझ लिया है, और मैं आवेदन प्रक्रिया के लिए तैयार हूँ।',
                  kn: 'ನಾನು [ಹೆಸರು] ಉತ್ಪನ್ನವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಪರಿಶೀಲಿಸಿದ್ದೇನೆ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ, ಮತ್ತು ನಾನು ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಗೆ ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.',
                  ta: '[பெயர்] நான் தயாரிப்பை முழுமையாக பரிசீலித்து, புரிந்துகொண்டேன், மற்றும் விண்ணப்ப செயல்முறைக்குத் தயாராக இருக்கிறேன்.',
                  te: '[పేరు] నేను ఉత్పత్తిని పూర్తిగా సమీక్షించి, అర్థం చేసుకున్నాను, మరియు దరఖాస్తు ప్రక్రియకు సిద్ధంగా ఉన్నాను.',
                  bn: 'আমি [নাম] পণ্যটি সম্পূর্ণভাবে পর্যালোচনা করেছি এবং বুঝেছি, এবং আমি আবেদন প্রক্রিয়া এগিয়ে নিতে প্রস্তুত।'
                }[selectedLanguage?.code || 'en']}
              </p>

            </div>
            
            <RecordingInterface
              recordingStatus={recordingStatus}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              watchedDuration={watchedDuration}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentRecorder;