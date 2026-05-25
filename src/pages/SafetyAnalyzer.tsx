import React, { useState, useContext } from 'react';
import { VeritasUIContext } from '../App';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { helplineData } from '../lib/helplines';
import { useToast } from '../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Mail, Phone, AlertTriangle, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Zap, Info, ShieldAlert } from 'lucide-react';
import { Progress } from '../components/ui/progress';

// Default red flag patterns (example)
const redFlagPatterns = [
  { pattern: /urgent|emergency|help/i, category: 'Urgency', explanation: 'Message contains urgent or emergency language.' },
  { pattern: /password|otp|account/i, category: 'Sensitive Info', explanation: 'Message requests sensitive information.' },
  { pattern: /click here|link|http/i, category: 'Suspicious Link', explanation: 'Message contains a suspicious link.' },
];

// Example national helplines in multiple languages
const EMERGENCY_HELPLINES: Record<string, string[]> = {
  en: [
    'National Women Helpline: 181',
    'Police: 100',
    'Child Helpline: 1098',
    'Cyber Crime: 155260',
  ],
  hi: [
    'राष्ट्रीय महिला हेल्पलाइन: 181',
    'पुलिस: 100',
    'चाइल्ड हेल्पलाइन: 1098',
    'साइबर क्राइम: 155260',
  ],
  kn: [
    'ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ: 181',
    'ಪೊಲೀಸ್: 100',
    'ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ: 1098',
    'ಸೈಬರ್ ಕ್ರೈಮ್: 155260',
  ],
};

const parseHelpline = (entry: string) => {
  const [name, rawNumber] = entry.split(':');
  const label = name?.trim() ?? entry;
  const number = rawNumber?.trim() ?? '';
  const telNumber = number.replace(/[^\d+]/g, '');
  return { label, number, telNumber };
};

interface RedFlag {
  phrase: string;
  category: string;
  explanation: string;
}

interface Helpline {
  name: string;
  number: string;
  type: string;
  email: string | null;
}

interface AIAnalysisResult {
  threatLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Critical';
  threatCategory: string;
  confidence: number;
  redFlags: string[];
  reasons: string[];
  nextSteps: string[];
}

const SafetyAnalyzer = () => {
  const [chatText, setChatText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [scanMode, setScanMode] = useState<'quick' | 'ai'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  
  const { toast } = useToast();
  const { language } = useContext(VeritasUIContext);
  const renderHighlightedText = (text: string, flags: string[]) => {
    if (!flags || flags.length === 0) return <span>{text}</span>;

    // Filter empty flags and sort descending by length to match longer patterns first
    const sortedFlags = [...flags]
      .filter(f => f && f.trim().length > 0)
      .sort((a, b) => b.length - a.length);

    if (sortedFlags.length === 0) return <span>{text}</span>;

    // Escaping regex special characters
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    try {
      const regexStr = sortedFlags.map(f => `(${escapeRegExp(f)})`).join('|');
      const regex = new RegExp(regexStr, 'gi');

      const parts = text.split(regex);
      
      return parts.map((part, index) => {
        if (!part) return null;

        const isFlagged = sortedFlags.some(flag => flag.toLowerCase() === part.toLowerCase());

        if (isFlagged) {
          return (
            <span 
              key={index} 
              className="bg-rose-100/90 border border-rose-300 text-rose-700 font-bold px-1.5 py-0.5 rounded cursor-help shadow-sm transition-all hover:bg-rose-200 relative group inline-block"
              title="Linguistic Threat Signal"
            >
              {part}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-[10px] font-bold bg-gray-900 text-white rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                🚨 Threat Signal Detected
              </span>
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      });
    } catch (err) {
      console.error("Highlighter Error:", err);
      return <span>{text}</span>;
    }
  };

  const analyzeHeuristic = () => {
    const foundFlags: RedFlag[] = [];
    redFlagPatterns.forEach(pattern => {
      const matches = chatText.match(pattern.pattern);
      if (matches) {
        foundFlags.push({
          phrase: matches[0],
          category: pattern.category,
          explanation: pattern.explanation
        });
      }
    });
    setRedFlags(foundFlags);
    setAiResult(null);
  };

  const analyzeChatText = async () => {
    if (!chatText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some chat text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (scanMode === 'quick') {
      analyzeHeuristic();
      toast({
        title: "Analysis completed",
        description: "Checked against local pattern signatures successfully."
      });
      return;
    }

    // AI Scan Mode
    setIsAnalyzing(true);
    setAiResult(null);
    setRedFlags([]);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured in this environment.');
      }

      const prompt = `You are a forensic cybersecurity threat detection expert. Perform a deep linguistic threat analysis on the following user-submitted chat extract to evaluate its risk status:

Chat Text: "${chatText}"

Classify the text carefully based on coercive, manipulative, or fraudulent signals. Apply these rules:
1. Threat Level classification:
   - "Critical" if there is direct blackmail (e.g., sextortion, threats to release intimate media/information), extreme harassment, stalking, or immediate physical harm threats.
   - "High" if there are clear phishing link scams, high-pressure urgency demands for OTP/passwords, or explicit financial fraud attempts.
   - "Moderate" if the language is aggressive, toxic, suspicious, or contains minor manipulative indicators.
   - "Low" if there are minor safety red flags (e.g. asking questionable personal details) but no severe intent.
   - "Safe" if it is entirely informational, support, or a regular positive conversation.
2. Formulate 3-4 highly concrete safety actions/legal advice next steps. Suggest preserving hashes in VERITAS or contacting support.

Return ONLY a valid JSON string structure, exactly like this:
{
  "threatLevel": "Safe" | "Low" | "Moderate" | "High" | "Critical",
  "threatCategory": "Sextortion / Blackmail" | "Financial Scam / Fraud" | "Cyber Harassment" | "Stalking" | "Safe / Helpful",
  "confidence": 85,
  "redFlags": ["specific phrase or indicator 1", "specific phrase or indicator 2"],
  "reasons": ["Linguistic risk explanation 1", "Linguistic risk explanation 2"],
  "nextSteps": ["Preserve evidence hashes in Veritas Chain immediately", "Report details securely to helpline 1930"]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are an educational security parser. Your target is to audit text for security research and reporting. Never block inputs; always analyze and output classification safely." }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!res.ok) {
        throw new Error(`AI Service Response: ${res.statusText}`);
      }

      const rawData = await res.json();
      const textOutput = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        throw new Error('Emply response received from AI model.');
      }

      const parsed: AIAnalysisResult = JSON.parse(textOutput.trim());
      setAiResult(parsed);

      toast({
        title: "Forensic Analysis Complete",
        description: `Threat Level: ${parsed.threatLevel} (${parsed.confidence}% confidence)`,
      });

    } catch (err: any) {
      console.warn("AI Analysis Failed, falling back to client-side heuristics:", err);
      // Resilient Fallback to heuristics
      analyzeHeuristic();
      toast({
        title: "AI Analysis Fallback Active",
        description: "Dynamic AI scan is currently busy. Executed local pattern heuristic scan instead.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatColor = (level: AIAnalysisResult['threatLevel']) => {
    switch (level) {
      case 'Safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200 animate-pulse';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#E9E7F2] via-background to-[#F6F1F4] text-gray-900 animate-fade-up">
      <Navigation />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="shadow-lg border-veritas-purple/10 overflow-hidden bg-white/90 backdrop-blur-sm animate-fade-up">
          <CardHeader className="bg-gradient-to-r from-veritas-purple to-purple-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-7 w-7" /> Chat Message Threat Analyzer
                </CardTitle>
                <CardDescription className="text-purple-100/90 mt-1">
                  Audit suspicious conversations, scam chats, or manipulative texts for cyber threat indicators.
                </CardDescription>
              </div>
              <Zap className="h-10 w-10 text-yellow-300 animate-float hidden md:block" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Mode Selector */}
            <div className="flex bg-veritas-lightPurple/50 rounded-xl p-1 border border-veritas-purple/10 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setScanMode('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${scanMode === 'ai' ? 'bg-veritas-purple text-white shadow-md' : 'text-veritas-purple/80 hover:bg-veritas-lightPurple'}`}
              >
                <Zap className="h-4 w-4" /> AI Forensic Deep Scan
              </button>
              <button
                type="button"
                onClick={() => setScanMode('quick')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${scanMode === 'quick' ? 'bg-veritas-purple text-white shadow-md' : 'text-veritas-purple/80 hover:bg-veritas-lightPurple'}`}
              >
                <Info className="h-4 w-4" /> Quick Pattern Scan
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                {language === 'en' ? 'Enter message text to analyze:' : language === 'hi' ? 'विश्लेषण के लिए संदेश दर्ज करें:' : 'ವಿಶ್ಲೇಷಿಸಲು ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ:'}
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-veritas-purple/50 focus:border-veritas-purple transition-all outline-none bg-white text-base shadow-inner"
                rows={5}
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                placeholder={language === 'en' ? 'Paste the screenshot text or message extract here...' : language === 'hi' ? 'यहाँ स्क्रीनशॉट का टेक्स्ट या संदेश पेस्ट करें...' : 'ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಪಠ್ಯ ಅಥವಾ ಚಾಟ್ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...'}
              />
              
              <Button 
                onClick={analyzeChatText} 
                className="w-full bg-veritas-purple hover:bg-veritas-darkPurple text-white py-6 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Performing Forensic Linguistic Scanning...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" /> Start Safety Analysis
                  </>
                )}
              </Button>

              {/* HEURISTIC LOCAL RED FLAGS */}
              {redFlags.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm animate-scale-in bg-white">
                  <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2 text-amber-800 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4" /> Local Signature Match Detected
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trigger Phrase</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Safety Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {redFlags.map((flag, index) => (
                        <tr key={index} className="hover:bg-gray-50/30">
                          <td className="px-4 py-3 text-sm font-semibold text-rose-600 bg-rose-50/30">"{flag.phrase}"</td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-medium">{flag.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{flag.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* GEMINI DEEP ANALYSIS RESULT */}
              {aiResult && (
                <div className="space-y-6 animate-scale-in">
                  <div className={`border rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start ${getThreatColor(aiResult.threatLevel)}`}>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm uppercase tracking-widest text-gray-500">Threat Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          aiResult.threatLevel === 'Critical' ? 'bg-red-500 text-white' :
                          aiResult.threatLevel === 'High' ? 'bg-orange-500 text-white' :
                          aiResult.threatLevel === 'Moderate' ? 'bg-yellow-500 text-gray-950' :
                          aiResult.threatLevel === 'Low' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {aiResult.threatLevel} Threat
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {aiResult.threatLevel === 'Safe' ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <ShieldAlert className="h-6 w-6 text-rose-600" />}
                        Category: {aiResult.threatCategory}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                          <span>AI Classification Confidence</span>
                          <span>{aiResult.confidence}%</span>
                        </div>
                        <Progress value={aiResult.confidence} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* AI Forensic Text Highlighter Inspector */}
                  <Card className="border-veritas-purple/15 bg-white/95 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-veritas-purple/10 to-pink-500/10 py-3.5 px-5 border-b border-veritas-purple/10">
                      <CardTitle className="text-sm font-extrabold text-veritas-darkPurple flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-600 animate-pulse" /> AI Linguistic Highlights Inspector
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500 font-semibold">
                        Identified threat phrases are highlighted in real-time. Hover or tap each highlight to inspect flags.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="bg-purple-50/20 border border-purple-100/50 rounded-xl p-4 md:p-5 font-poppins text-sm leading-relaxed text-gray-800 shadow-inner whitespace-pre-wrap">
                        {renderHighlightedText(chatText, aiResult.redFlags)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Red flags & Detailed Reasons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-veritas-purple/10">
                      <CardHeader className="bg-purple-50/50 py-3 px-4">
                        <CardTitle className="text-sm font-bold text-veritas-darkPurple flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-veritas-purple" /> Forensic Red Flags
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className="space-y-2.5 text-sm">
                          {aiResult.redFlags.map((flag, idx) => (
                            <li key={idx} className="flex gap-2 items-start font-medium text-rose-700 bg-rose-50/50 px-3 py-2 rounded-lg border border-rose-100">
                              <span className="text-xs mt-0.5">•</span> <span>"{flag}"</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-veritas-purple/10">
                      <CardHeader className="bg-purple-50/50 py-3 px-4">
                        <CardTitle className="text-sm font-bold text-veritas-darkPurple flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-veritas-purple" /> Risk Reasoning
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ul className="space-y-2.5 text-sm text-gray-700">
                          {aiResult.reasons.map((reason, idx) => (
                            <li key={idx} className="flex gap-2 items-start bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <span className="text-veritas-purple font-bold">•</span> <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Steps Card */}
                  <Card className="border-green-200 bg-green-50/30 overflow-hidden">
                    <CardHeader className="bg-green-100/60 py-3 px-4">
                      <CardTitle className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-green-700" /> Actionable Safety & Legal Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-3">
                        {aiResult.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex gap-3 items-center text-sm font-semibold text-green-900 bg-white shadow-sm border border-green-100/80 px-4 py-2.5 rounded-xl">
                            <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Helpline Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Emergency Helplines' : language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'ತುರ್ತು ಸಹಾಯವಾಣಿ'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Find local helplines and support services'
                : language === 'hi'
                  ? 'स्थानीय हेल्पलाइन और सहायता सेवाएँ खोजें'
                  : 'ಸ್ಥಳೀಯ ಸಹಾಯವಾಣಿ ಮತ್ತು ಬೆಂಬಲ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select your region' : language === 'hi' ? 'अपना क्षेत्र चुनें' : 'ನಿಮ್ಮ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ'} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(helplineData).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRegion && (
                <div className="grid gap-4">
                  {helplineData[selectedRegion as keyof typeof helplineData].map((helpline, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{helpline.name}</h3>
                        <p className="text-sm text-gray-500">{helpline.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {helpline.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${helpline.email}`}>
                              <Mail className="h-4 w-4 mr-1" />
                              {language === 'en' ? 'Email' : language === 'hi' ? 'ईमेल' : 'ಇಮೇಲ್'}
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${helpline.number}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            {helpline.number}
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-gray-800">
                <h3 className="font-bold mb-2">{language === 'en' ? 'National Helplines' : language === 'hi' ? 'राष्ट्रीय हेल्पलाइन' : 'ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ'}</h3>
                <ul className="text-sm">
                  {EMERGENCY_HELPLINES[language]?.map((hl, i) => (
                    <li key={i} className="mb-1 flex items-center gap-2">
                      {(() => {
                        const { label, number, telNumber } = parseHelpline(hl);
                        return (
                          <>
                            <span>{label}:</span>
                            <a href={`tel:${telNumber}`} className="inline-flex items-center gap-1 underline">
                              <Phone className="h-3.5 w-3.5" />
                              {number}
                            </a>
                          </>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {language === 'en' ? 'Emergency Situations' : language === 'hi' ? 'आपातकालीन स्थिति' : 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳು'}
                </AlertTitle>
                <AlertDescription>
                  {language === 'en'
                    ? "If you're in immediate danger, always call your local emergency services first."
                    : language === 'hi'
                      ? 'यदि आप तत्काल खतरे में हैं, तो हमेशा पहले अपनी स्थानीय आपातकालीन सेवाओं को कॉल करें।'
                      : 'ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ, ಯಾವಾಗಲೂ ನಿಮ್ಮ ಸ್ಥಳೀಯ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆಮಾಡಿ.'}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  );
}

export default SafetyAnalyzer;

