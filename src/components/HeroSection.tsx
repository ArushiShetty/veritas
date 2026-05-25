import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Users, Lock, MessageCircle } from 'lucide-react';
import { VeritasUIContext } from '../App';

const translations = {
  en: {
    heroTitle: 'Digital Safety for Women',
    heroSubtitle: 'VERITAS empowers women with tools to identify scams, report harassment, and create tamper-proof digital evidence while staying anonymous.',
    guidanceBtn: 'Get Safety Guidance',
    scannerBtn: 'Check Suspicious Profiles',
    card1Title: 'AI Safety Assistant',
    card1Desc: 'Get personalized guidance on digital safety issues',
    card2Title: 'Profile Scanner',
    card2Desc: 'Detect fake profiles and AI-generated images',
    card3Title: 'Secure Vault',
    card3Desc: 'Store encrypted evidence safely in the cloud',
    card4Title: 'Digital Self-Defense',
    card4Desc: 'Learn cybersecurity skills through interactive quizzes',
  },
  hi: {
    heroTitle: 'महिलाओं के लिए डिजिटल सुरक्षा',
    heroSubtitle: 'VERITAS महिलाओं को घोटालों की पहचान करने, उत्पीड़न की रिपोर्ट करने और गुमनाम रहते हुए छेड़छाड़-प्रूफ डिजिटल साक्ष्य बनाने के लिए उपकरणों से सशक्त बनाता है।',
    guidanceBtn: 'सुरक्षा मार्गदर्शन प्राप्त करें',
    scannerBtn: 'संदिग्ध प्रोफाइल की जांच करें',
    card1Title: 'AI सुरक्षा सहायक',
    card1Desc: 'डिजिटल सुरक्षा मुद्दों पर व्यक्तिगत मार्गदर्शन प्राप्त करें',
    card2Title: 'प्रोफाइल स्कैनर',
    card2Desc: 'नकली प्रोफाइल और AI-जनरेटेड छवियों का पता लगाएं',
    card3Title: 'सुरक्षित वॉल्ट',
    card3Desc: 'क्लाउड में सुरक्षित रूप से एन्क्रिप्टेड साक्ष्य स्टोर करें',
    card4Title: 'डिजिटल आत्म-रक्षा',
    card4Desc: 'इंटरैक्टिव क्विज़ के माध्यम से साइबर सुरक्षा कौशल सीखें',
  },
  kn: {
    heroTitle: 'ಮಹಿಳೆಯರಿಗೆ ಡಿಜಿಟಲ್ ಭದ್ರತೆ',
    heroSubtitle: 'VERITAS ಮಹಿಳೆಯರಿಗೆ ವಂಚನೆಗಳನ್ನು ಗುರುತಿಸಲು, ಕಿರುಕುಳವನ್ನು ವರದಿ ಮಾಡಲು ಮತ್ತು ಅನಾಮಧೇಯರಾಗಿ ಉಳಿದು ತಿದ್ದುಪಡಿ-ಮುಕ್ತ ಡಿಜಿಟಲ್ ಸಾಕ್ಷ್ಯವನ್ನು ರಚಿಸಲು ಸಾಧನಗಳೊಂದಿಗೆ ಸಬಲೀಕರಣಗೊಳಿಸುತ್ತದೆ.',
    guidanceBtn: 'ಭದ್ರತಾ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
    scannerBtn: 'ಅನುಮಾನಾಸ್ಪದ ಪ್ರೊಫೈಲ್ ಪರಿಶೀಲಿಸಿ',
    card1Title: 'AI ಭದ್ರತಾ ಸಹಾಯಕ',
    card1Desc: 'ಡಿಜಿಟಲ್ ಭದ್ರತಾ ವಿಷಯಗಳ ಕುರಿತು ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ',
    card2Title: 'ಪ್ರೊಫೈಲ್ ಸ್ಕ್ಯಾನರ್',
    card2Desc: 'ನಕಲಿ ಪ್ರೊಫೈಲ್‌ಗಳು ಮತ್ತು AI-ರಚಿತ ಚಿತ್ರಗಳನ್ನು ಪತ್ತೆ ಮಾಡಿ',
    card3Title: 'ಸುರಕ್ಷಿತ ವಾಲ್ಟ್',
    card3Desc: 'ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಸಾಕ್ಷ್ಯವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ',
    card4Title: 'ಡಿಜಿಟಲ್ ಸ್ವಯಂ ರಕ್ಷಣೆ',
    card4Desc: 'ಸಂವಾದಾತ್ಮಕ ರಸಪ್ರಶ್ನೆಗಳ ಮೂಲಕ ಸೈಬರ್ ಸೈಬರ್ ಸುರಕ್ಷತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ',
  }
};

const HeroSection = () => {
  const { language } = useContext(VeritasUIContext);

  return (
    <section className="bg-gradient-to-b from-[#E9E7F2] via-background to-background py-20 relative overflow-hidden text-gray-900 border-b border-purple-100/10">
      {/* Floating security anchors */}
      <div className="absolute top-10 right-10 opacity-30 animate-float">
        <Lock className="h-16 w-16 text-veritas-purple" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20 animate-pulse-slow">
        <ShieldCheck className="h-20 w-20 text-veritas-blue" />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-veritas-purple mb-6 leading-tight tracking-tight">
            {translations[language].heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 font-medium leading-relaxed">
            {translations[language].heroSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/chatbot" className="btn-primary hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center py-3 px-6 rounded-xl text-sm font-bold shadow-md">
              {translations[language].guidanceBtn}
            </Link>
            <Link to="/face-check" className="btn-secondary hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center py-3 px-6 rounded-xl text-sm font-bold shadow-md">
              {translations[language].scannerBtn}
            </Link>
          </div>
        </div>

        {/* Feature quick-links overview with micro-interactions */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
          
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-veritas-purple/20 transform hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between bg-white/95">
            <div>
              <div className="bg-veritas-lightPurple p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-inner">
                <MessageCircle className="h-8 w-8 text-veritas-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-veritas-purple transition-colors group-hover:text-purple-800">{translations[language].card1Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{translations[language].card1Desc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-veritas-purple/20 transform hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between bg-white/95">
            <div>
              <div className="bg-veritas-lightPurple p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-inner">
                <Users className="h-8 w-8 text-veritas-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-veritas-purple transition-colors group-hover:text-purple-800">{translations[language].card2Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{translations[language].card2Desc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-veritas-purple/20 transform hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between bg-white/95">
            <div>
              <div className="bg-veritas-lightPurple p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-inner">
                <Lock className="h-8 w-8 text-veritas-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-veritas-purple transition-colors group-hover:text-purple-800">{translations[language].card3Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{translations[language].card3Desc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-veritas-purple/20 transform hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between bg-white/95">
            <div>
              <div className="bg-veritas-lightPurple p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-100 transition-all shadow-inner">
                <FileText className="h-8 w-8 text-veritas-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-veritas-purple transition-colors group-hover:text-purple-800">{translations[language].card4Title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{translations[language].card4Desc}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
