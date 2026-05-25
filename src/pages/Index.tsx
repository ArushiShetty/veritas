import React, { useState, useEffect, useContext } from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import FeatureCard from '../components/FeatureCard';
import { ShieldCheck, FileText, Lock, Eye, Activity, Shield, Cpu, RefreshCw } from 'lucide-react';
import { VeritasUIContext } from '../App';

const translations = {
  en: {
    ledgerTitle: 'VERITAS Node Status',
    ledgerSubtitle: 'Live Platform Integrity Ledger',
    classifier: 'AI Forensics Classifier',
    vault: 'Supabase Private Vault',
    proofEngine: 'Blockchain Proof Engine',
    operational: 'OPERATIONAL',
    synced: 'SYNCED',
    syncing: 'SYNCING LEDGER',
    feedTitle: 'Real-time Protection Feed',
    feedStatus: 'Network Secure',
    protectTitle: 'How VERITAS Protects You',
    protectSubtitle: 'Our platform uses advanced technology to provide multiple layers of digital protection and empowers you with the tools to fight back against online threats.',
    trustTitle: 'Why Women Trust VERITAS',
    trustSubtitle: 'We\'ve built a platform focused on privacy, security, and empowerment, designed specifically for women facing digital threats.',
    stat1Title: '100%',
    stat1Desc: 'Anonymous Reporting',
    stat2Title: '256-bit',
    stat2Desc: 'SHA Encryption',
    stat3Title: '24/7',
    stat3Desc: 'Digital Protection',
    helpTitle: 'Need Immediate Help?',
    helpDesc: 'If you\'re in danger or experiencing immediate threats, please contact local authorities or reach out to crisis support services.',
    helpBtn: 'Access Emergency Resources',
    feature1Title: 'ProfileGuard Scanner',
    feature1Desc: 'Upload suspicious profile images to detect AI-generated fakes and potential catfishing attempts with our advanced detection system.',
    feature1Btn: 'Scan a profile',
    feature2Title: 'Anonymous Reporting',
    feature2Desc: 'Report harassment, threats, or abuse without revealing your identity. Your information is protected with advanced encryption.',
    feature2Btn: 'Submit a report',
    feature3Title: 'Blockchain Evidence',
    feature3Desc: 'Create tamper-proof, timestamped digital evidence that can be verified later and potentially used in legal proceedings.',
    feature3Btn: 'Secure your evidence',
    feature4Title: 'Digital Self-Defense Quiz',
    feature4Desc: 'Test your knowledge and learn essential cybersecurity skills to protect yourself from common online threats and scams.',
    feature4Btn: 'Take the quiz',
    feature5Title: 'Case Verification',
    feature5Desc: 'Easily verify the authenticity and timestamp of previously submitted evidence using your unique case ID.',
    feature5Btn: 'Verify a case',
  },
  hi: {
    ledgerTitle: 'VERITAS नोड स्थिति',
    ledgerSubtitle: 'लाइव प्लेटफ़ॉर्म अखंडता बहीखाता',
    classifier: 'AI फोरेंसिक वर्गीकारक',
    vault: 'सुपाबेस निजी वॉल्ट',
    proofEngine: 'ब्लॉकचेन प्रूफ इंजन',
    operational: 'सक्रिय',
    synced: 'सिंक किया गया',
    syncing: 'बहीखाता सिंक हो रहा है',
    feedTitle: 'वास्तविक समय सुरक्षा फ़ीड',
    feedStatus: 'नेटवर्क सुरक्षित',
    protectTitle: 'VERITAS आपकी सुरक्षा कैसे करता है',
    protectSubtitle: 'हमारा प्लेटफ़ॉर्म डिजिटल सुरक्षा की कई परतें प्रदान करने के लिए उन्नत तकनीक का उपयोग करता है और आपको ऑनलाइन खतरों से लड़ने के उपकरण देता है।',
    trustTitle: 'महिलाएं VERITAS पर भरोसा क्यों करती हैं',
    trustSubtitle: 'हमने गोपनीयता, सुरक्षा और सशक्तिकरण पर केंद्रित एक प्लेटफ़ॉर्म बनाया है, जिसे विशेष रूप से डिजिटल खतरों का सामना करने वाली महिलाओं के लिए डिज़ाइन किया गया है।',
    stat1Title: '100%',
    stat1Desc: 'गुमनाम रिपोर्टिंग',
    stat2Title: '256-बिट',
    stat2Desc: 'SHA एन्क्रिप्शन',
    stat3Title: '24/7',
    stat3Desc: 'डिजिटल सुरक्षा',
    helpTitle: 'तत्काल सहायता की आवश्यकता है?',
    helpDesc: 'यदि आप खतरे में हैं या तत्काल खतरों का सामना कर रहे हैं, तो कृपया स्थानीय अधिकारियों से संपर्क करें या संकट सहायता सेवाओं से जुड़ें।',
    helpBtn: 'आपातकालीन संसाधन एक्सेस करें',
    feature1Title: 'प्रोफाइलगार्ड स्कैनर',
    feature1Desc: 'उन्नत डिटेक्शन सिस्टम के साथ एआई-जनरेटेड नकली प्रोफाइल और संभावित कैटफ़िशिंग प्रयासों का पता लगाने के लिए संदिग्ध प्रोफाइल चित्र अपलोड करें।',
    feature1Btn: 'प्रोफ़ाइल स्कैन करें',
    feature2Title: 'गुमनाम रिपोर्टिंग',
    feature2Desc: 'अपनी पहचान बताए बिना उत्पीड़न, खतरों या दुर्व्यवहार की रिपोर्ट करें। आपकी जानकारी उन्नत एन्क्रिप्शन के साथ सुरक्षित है।',
    feature2Btn: 'एक रिपोर्ट सबमिट करें',
    feature3Title: 'ब्लॉकचेन साक्ष्य',
    feature3Desc: 'छेड़छाड़-प्रूफ, टाइमस्टैम्पयुक्त डिजिटल साक्ष्य बनाएं जिसे बाद में सत्यापित किया जा सके और कानूनी कार्यवाही में उपयोग किया जा सके।',
    feature3Btn: 'अपना साक्ष्य सुरक्षित करें',
    feature4Title: 'डिजिटल आत्म-रक्षा प्रश्नोत्तरी',
    feature4Desc: 'अपने ज्ञान का परीक्षण करें और सामान्य ऑनलाइन खतरों और घोटालों से खुद को बचाने के लिए आवश्यक साइबर सुरक्षा कौशल सीखें।',
    feature4Btn: 'प्रश्नोत्तरी लें',
    feature5Title: 'मामला सत्यापन',
    feature5Desc: 'अपने विशिष्ट केस आईडी का उपयोग करके पहले सबमिट किए गए साक्ष्य की प्रामाणिकता और टाइमस्टैम्प को आसानी से सत्यापित करें।',
    feature5Btn: 'एक मामले को सत्यापित करें',
  },
  kn: {
    ledgerTitle: 'VERITAS ನೋಡ್ ಸ್ಥಿತಿ',
    ledgerSubtitle: 'ಲೈವ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಮಗ್ರತೆಯ ಲೆಡ್ಜರ್',
    classifier: 'AI ಫೋರೆನ್ಸಿಕ್ಸ್ ವರ್ಗೀಕರಣಕಾರ',
    vault: 'ಸುಪಬೇಸ್ ಖಾಸಗಿ ವಾಲ್ಟ್',
    proofEngine: 'ಬ್ಲಾಕ್‌ಚೈನ್ ಪ್ರೂಫ್ ಇಂಜಿನ್',
    operational: 'ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ',
    synced: 'ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ',
    syncing: 'ಲೆಡ್ಜರ್ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ',
    feedTitle: 'ನೈಜ-ಸಮಯದ ರಕ್ಷಣೆ ಫೀಡ್',
    feedStatus: 'ನೆಟ್‌ವರ್ಕ್ ಸುರಕ್ಷಿತವಾಗಿದೆ',
    protectTitle: 'VERITAS ನಿಮ್ಮನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುತ್ತದೆ',
    protectSubtitle: 'ನಮ್ಮ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಡಿಜಿಟಲ್ ರಕ್ಷಣೆಯ ಬಹು ಪದರಗಳನ್ನು ಒದಗಿಸಲು ಸುಧಾರಿತ ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸುತ್ತದೆ ಮತ್ತು ಆನ್‌ಲೈನ್ ಬೆದರಿಕೆಗಳ ವಿರುದ್ಧ ಹೋರಾಡಲು ನಿಮಗೆ ಸಾಧನಗಳನ್ನು ನೀಡುತ್ತದೆ.',
    trustTitle: 'ಮಹಿಳೆಯರು VERITAS ಅನ್ನು ಏಕೆ ನಂಬುತ್ತಾರೆ',
    trustSubtitle: 'ಡಿಜಿಟಲ್ ಬೆದರಿಕೆಗಳನ್ನು ಎದುರಿಸುತ್ತಿರುವ ಮಹಿಳೆಯರಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಗೌಪ್ಯತೆ, ಭದ್ರತೆ ಮತ್ತು ಸಬಲೀಕರಣದ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿದ ವೇದಿಕೆಯನ್ನು ನಾವು ನಿರ್ಮಿಸಿದ್ದೇವೆ.',
    stat1Title: '100%',
    stat1Desc: 'ಅನಾಮಧೇಯ ವರದಿ',
    stat2Title: '256-ಬಿಟ್',
    stat2Desc: 'SHA ಎನ್‌ಕ್ರಿಪ್ಶನ್',
    stat3Title: '24/7',
    stat3Desc: 'ಡಿಜಿಟಲ್ ರಕ್ಷಣೆ',
    helpTitle: 'ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕೇ?',
    helpDesc: 'ನೀವು ಅಪಾಯದಲ್ಲಿದ್ದರೆ ಅಥವಾ ತಕ್ಷಣದ ಬೆದರಿಕೆಗಳನ್ನು ಎದುರಿಸುತ್ತಿದ್ದರೆ, ದಯವಿಟ್ಟು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಬಿಕ್ಕಟ್ಟು ಬೆಂಬಲ ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    helpBtn: 'ತುರ್ತು ಸಂಪನ್ಮೂಲಗಳನ್ನು ಪ್ರವೇಶಿಸಿ',
    feature1Title: 'ಪ್ರೊಫೈಲ್‌ಗಾರ್ಡ್ ಸ್ಕ್ಯಾನರ್',
    feature1Desc: 'ನಮ್ಮ ಸುಧಾರಿತ ಪತ್ತೆ ವ್ಯವಸ್ಥೆಯೊಂದಿಗೆ ಎಐ-ರಚಿತ ನಕಲಿಗಳನ್ನು ಮತ್ತು ಸಂಭಾವ್ಯ ಕ್ಯಾಟ್‌ಫಿಶಿಂಗ್ ಪ್ರಯತ್ನಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಅನುಮಾನಾಸ್ಪದ ಪ್ರೊಫೈಲ್ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    feature1Btn: 'ಪ್ರೊಫೈಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    feature2Title: 'ಅನಾಮಧೇಯ ವರದಿ',
    feature2Desc: 'ನಿಮ್ಮ ಗುರುತನ್ನು ಬಹಿರಂಗಪಡಿಸದೆ ಕಿರುಕುಳ, ಬೆದರಿಕೆಗಳು ಅಥವಾ ನಿಂದನೆಗಳನ್ನು ವರದಿ ಮಾಡಿ. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸುಧಾರಿತ ಎನ್‌ಕ್ರಿಪ್ಶನ್‌ನೊಂದಿಗೆ ರಕ್ಷಿಸಲಾಗಿದೆ.',
    feature2Btn: 'ವರದಿ ಸಲ್ಲಿಸಿ',
    feature3Title: 'ಬ್ಲಾಕ್‌ಚೈನ್ ಸಾಕ್ಷ್ಯ',
    feature3Desc: 'ನಂತರ ಪರಿಶೀಲಿಸಬಹುದಾದ ಮತ್ತು ಕಾನೂನು ಪ್ರಕ್ರಿಯೆಗಳಲ್ಲಿ ಬಳಸಬಹುದಾದ ತಿದ್ದುಪಡಿ-ಮುಕ್ತ, ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ ಮಾಡಿದ ಡಿಜಿಟಲ್ ಸಾಕ್ಷ್ಯವನ್ನು ರಚಿಸಿ.',
    feature3Btn: 'ನಿಮ್ಮ ಸಾಕ್ಷ್ಯವನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ',
    feature4Title: 'ಡಿಜಿಟಲ್ ಸ್ವಯಂ ರಕ್ಷಣೆ ರಸಪ್ರಶ್ನೆ',
    feature4Desc: 'ಸಾಮಾನ್ಯ ಆನ್‌ಲೈನ್ ಬೆದರಿಕೆಗಳು ಮತ್ತು ವಂಚನೆಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಿಕೊಳ್ಳಲು ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಅಗತ್ಯ ಸೈಬರ್ ಸುರಕ್ಷತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ.',
    feature4Btn: 'ರಸಪ್ರಶ್ನೆ ತೆಗೆದುಕೊಳ್ಳಿ',
    feature5Title: 'ಕೇಸ್ ಪರಿಶೀಲನೆ',
    feature5Desc: 'ನಿಮ್ಮ ಅನನ್ಯ ಕೇಸ್ ಐಡಿ ಬಳಸಿಕೊಂಡು ಹಿಂದೆ ಸಲ್ಲಿಸಿದ ಸಾಕ್ಷ್ಯದ ದೃಢೀಕರಣ ಮತ್ತು ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
    feature5Btn: 'ಕೇಸ್ ಪರಿಶೀಲಿಸಿ',
  }
};

const Index = () => {
  const { language } = useContext(VeritasUIContext);
  const [liveAlerts, setLiveAlerts] = useState([
    { time: 'Just Now', text: 'AI Message Scan flagged high-pressure extortion request (Coercion)', level: 'Critical' },
    { time: '2 mins ago', text: 'Tamper-proof Evidence chain registered (Hash key: 0x8f32a...)', level: 'Secure' },
    { time: '5 mins ago', text: 'FaceCheck scan confirmed AI-generated Tinder profile (catfish risk)', level: 'High' },
    { time: '12 mins ago', text: 'Secure Vault files downloaded via multi-factor credentials', level: 'Safe' },
  ]);

  useEffect(() => {
    const alertTemplates = [
      { text: 'ProfileGuard Scanner reviewed Instagram profile - trust rating evaluated at 88% Real', level: 'Safe' },
      { text: 'Anonymous Stalking/Harassment Case ID generated for local authorities review', level: 'Secure' },
      { text: 'Helpline direct access triggered via Panic Stealth Exit sequence', level: 'Alert' },
      { text: 'AI Safety assistant resolved panic support dialog with empathetic guidelines', level: 'Safe' },
      { text: 'Evidence Chain Visualizer confirmed ledger node synchronicity with polygonscan network', level: 'Secure' },
      { text: 'Linguistic Scan flagged phishing payment scam (Venmo/CashApp link detected)', level: 'High' },
    ];

    const interval = setInterval(() => {
      const randomTemplate = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const newAlert = {
        time: 'Just Now',
        text: randomTemplate.text,
        level: randomTemplate.level,
      };

      setLiveAlerts(prev => {
        const updated = prev.map(a => ({
          ...a,
          time: a.time === 'Just Now' ? '1 min ago' : a.time.includes('min') ? `${parseInt(a.time) + 1} mins ago` : a.time
        }));
        return [newAlert, ...updated.slice(0, 3)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E9E7F2] via-background to-[#F6F1F4] text-gray-900">
      <Navigation />
      
      <main className="flex-grow">
        <HeroSection />

        {/* Real-Time Safety Dashboard Panel */}
        <section className="bg-gradient-to-r from-purple-50/50 via-background to-pink-50/50 py-12 border-y border-purple-500/10 relative">
          <div className="veritas-container">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-veritas-purple/15 p-6 md:p-8 shadow-2xl animate-scale-in">
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                
                {/* Status Column */}
                <div className="w-full lg:w-1/3 space-y-4">
                  <div className="flex items-center gap-2 text-veritas-purple mb-2">
                    <Activity className="h-6 w-6 animate-pulse text-rose-500" />
                    <span className="text-sm font-extrabold uppercase tracking-widest">{translations[language].ledgerTitle}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{translations[language].ledgerSubtitle}</h3>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between bg-purple-50/50 border border-purple-100/50 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><Cpu className="h-4 w-4 text-veritas-purple" /> {translations[language].classifier}</span>
                      <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" /> {translations[language].operational}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50/50 border border-purple-100/50 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><Shield className="h-4 w-4 text-veritas-purple" /> {translations[language].vault}</span>
                      <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" /> {translations[language].synced}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50/50 border border-purple-100/50 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><Lock className="h-4 w-4 text-veritas-purple" /> {translations[language].proofEngine}</span>
                      <span className="text-[10px] font-extrabold bg-purple-100 text-veritas-purple px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse-slow">
                        <RefreshCw className="h-3 w-3 animate-spin text-veritas-purple" /> {translations[language].syncing}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Audit Log Feed */}
                <div className="w-full lg:w-2/3 border border-purple-100/80 bg-gray-50/50 rounded-2xl p-5 shadow-inner">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-veritas-purple animate-bounce" /> {translations[language].feedTitle}</span>
                    <span className="text-[10px] font-bold text-veritas-purple bg-veritas-lightPurple px-2.5 py-1 rounded-full animate-pulse-slow">{translations[language].feedStatus}</span>
                  </div>
                  <div className="space-y-2.5 overflow-hidden max-h-[220px] transition-all">
                    {liveAlerts.map((alert, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm hover:scale-[1.002] transition-all duration-300 animate-fade-up">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            alert.level === 'Critical' ? 'bg-red-500 shadow-sm shadow-red-500/50' :
                            alert.level === 'High' ? 'bg-orange-500 shadow-sm shadow-orange-500/50' :
                            alert.level === 'Alert' ? 'bg-yellow-500 shadow-sm shadow-yellow-500/50' :
                            alert.level === 'Secure' ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-blue-500 shadow-sm shadow-blue-500/50'
                          }`} />
                          <span className="text-xs font-semibold text-gray-800 leading-snug">{alert.text}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{alert.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="veritas-container py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="section-title">{translations[language].protectTitle}</h2>
            <p className="text-lg text-gray-600">
              {translations[language].protectSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title={translations[language].feature1Title}
              description={translations[language].feature1Desc}
              icon={<Eye className="h-8 w-8 text-veritas-purple" />}
              link="/profile-guard"
              linkText={translations[language].feature1Btn}
            />

            <FeatureCard
              title={translations[language].feature2Title}
              description={translations[language].feature2Desc}
              icon={<ShieldCheck className="h-8 w-8 text-veritas-purple" />}
              link="/report"
              linkText={translations[language].feature2Btn}
            />

            <FeatureCard
              title={translations[language].feature3Title}
              description={translations[language].feature3Desc}
              icon={<Lock className="h-8 w-8 text-veritas-purple" />}
              link="/evidence"
              linkText={translations[language].feature3Btn}
            />

            <FeatureCard
              title={translations[language].feature4Title}
              description={translations[language].feature4Desc}
              icon={<FileText className="h-8 w-8 text-veritas-purple" />}
              link="/quiz"
              linkText={translations[language].feature4Btn}
            />

            <FeatureCard
              title={translations[language].feature5Title}
              description={translations[language].feature5Desc}
              icon={<ShieldCheck className="h-8 w-8 text-veritas-purple" />}
              link="/verify"
              linkText={translations[language].feature5Btn}
            />

            <div className="bg-veritas-purple rounded-xl shadow-md p-8 text-white flex flex-col items-start justify-center h-full">
              <h3 className="text-2xl font-semibold mb-4">{translations[language].helpTitle}</h3>
              <p className="mb-6">
                {translations[language].helpDesc}
              </p>
              <button 
                onClick={() => window.location.href = '/analyzer#helplines'}
                className="bg-white text-veritas-purple font-medium py-2 px-6 rounded-lg hover:bg-gray-100 transition duration-300 mt-auto"
              >
                {translations[language].helpBtn}
              </button>
            </div>
          </div>
        </section>

        {/* The Cyber Threat Reality & Daily Bulletins Section */}
        <section className="py-16 border-t border-purple-100/20 bg-gradient-to-r from-purple-50/20 via-background to-pink-50/20">
          <div className="veritas-container">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-up">
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                ⚠️ Live Crisis Statistics & Threat Intelligence
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-veritas-purple mt-4 mb-4">
                The Cyber Threat Reality
              </h2>
              <p className="text-lg text-gray-700 font-medium leading-relaxed">
                Why VERITAS is an absolute necessity in today's digital landscape. Online crimes targeting women are rising exponentially—education and secure tools are our shield.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Alarming Statistics Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-white/90 border border-red-100/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-red-900/[0.02]">
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                    Alarming NCRB & Global Metrics
                  </h3>
                  
                  <div className="space-y-5">
                    {/* Stat 1 */}
                    <div className="flex gap-4 items-center bg-red-50/30 border border-red-100/40 p-4 rounded-xl">
                      <div className="text-3xl md:text-4xl font-extrabold text-red-600">80%</div>
                      <div className="text-xs font-semibold text-gray-700 leading-snug">
                        Of cyberstalking, harassment, and non-consensual image sharing victims are women.
                      </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="flex gap-4 items-center bg-red-50/30 border border-red-100/40 p-4 rounded-xl">
                      <div className="text-3xl md:text-4xl font-extrabold text-red-600">66%</div>
                      <div className="text-xs font-semibold text-gray-700 leading-snug">
                        Of teenagers and women have interacted with catfishing accounts or AI-generated fake profiles.
                      </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="flex gap-4 items-center bg-red-50/30 border border-red-100/40 p-4 rounded-xl">
                      <div className="text-3xl md:text-4xl font-extrabold text-red-600">12m</div>
                      <div className="text-xs font-semibold text-gray-700 leading-snug">
                        Interval at which a new digital threat or cyber harassment incident targeting women is reported.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs font-bold text-red-600/70 flex items-center gap-1.5 justify-center">
                  🛡️ Critical Directive: Protect, Secure, Anchor and Report.
                </div>
              </div>

              {/* Curated Daily Safety Bulletins Feed */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-white/95 border border-purple-100/60 rounded-2xl p-6 md:p-8 shadow-xl shadow-purple-950/[0.01]">
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    📰 Daily Safety Bulletins & Insight Feed
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Article 1 */}
                    <div className="p-4 rounded-xl border border-purple-100/30 bg-purple-50/10 hover:bg-purple-50/30 hover:border-purple-200/50 hover:scale-[1.005] transition-all duration-300 group cursor-pointer flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] font-extrabold uppercase bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded">Scam Warning</span>
                          <span className="text-[10px] text-gray-400 font-bold">2 hours ago</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-veritas-purple transition-colors">
                          Rise of AI Voice Cloning Scams Targeting Families
                        </h4>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2">
                          Scammers are now using short 3-second audio clips from social media reels to clone voices and demand ransom. Verify callers using a secret family password.
                        </p>
                      </div>
                    </div>

                    {/* Article 2 */}
                    <div className="p-4 rounded-xl border border-purple-100/30 bg-purple-50/10 hover:bg-purple-50/30 hover:border-purple-200/50 hover:scale-[1.005] transition-all duration-300 group cursor-pointer flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">Legal Advice</span>
                          <span className="text-[10px] text-gray-400 font-bold">Today</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-veritas-purple transition-colors">
                          Your Legal Rights Under Section 66E of India's IT Act
                        </h4>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2">
                          Any intentional capturing, publishing, or transmitting of private images without consent is highly punishable. Blockchain timestamps are court-admissible as secure proof.
                        </p>
                      </div>
                    </div>

                    {/* Article 3 */}
                    <div className="p-4 rounded-xl border border-purple-100/30 bg-purple-50/10 hover:bg-purple-50/30 hover:border-purple-200/50 hover:scale-[1.005] transition-all duration-300 group cursor-pointer flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="text-[9px] font-extrabold uppercase bg-purple-50 text-veritas-purple border border-purple-100 px-2 py-0.5 rounded">Self-Defense</span>
                          <span className="text-[10px] text-gray-400 font-bold">Yesterday</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-veritas-purple transition-colors">
                          Stealth Exit Cybersecurity: How to Keep Browsing Private
                        </h4>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2">
                          Always use stealth features like double-pressing ESC key to quickly cover your tracks when searching for safety resources in hostile environments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="bg-purple-50/30 py-16 border-t border-purple-100/20">
          <div className="veritas-container">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="section-title mb-6">{translations[language].trustTitle}</h2>
              <p className="text-lg text-gray-700 mb-12">
                {translations[language].trustSubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-veritas-purple mb-2">{translations[language].stat1Title}</div>
                  <p className="text-gray-600">{translations[language].stat1Desc}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-veritas-purple mb-2">{translations[language].stat2Title}</div>
                  <p className="text-gray-600">{translations[language].stat2Desc}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-veritas-purple mb-2">{translations[language].stat3Title}</div>
                  <p className="text-gray-600">{translations[language].stat3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
