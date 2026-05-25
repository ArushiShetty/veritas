import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import ProfileGuard from "./pages/ProfileGuard";
// import ProfileGuardScanner from "./pages/ProfileGuardScanner";
import ReportSubmission from "./pages/ReportSubmission";
import Evidence from "./pages/Evidence";
import Quiz from "./pages/Quiz";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import Chatbot from "./pages/Chatbot";
import FaceCheck from "./pages/FaceCheck";
import EmergencyVault from "./pages/EmergencyVault";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import SafetyAnalyzer from "./pages/SafetyAnalyzer";
import VoiceAssistant from "./pages/VoiceAssistant";
import Profile from "./pages/Profile";
import { useEffect, useState, createContext } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

// Language and Theme Context
export const VeritasUIContext = createContext({
  language: 'en',
  setLanguage: (_: string) => {},
  darkMode: false,
  setDarkMode: (_: boolean) => {},
  user: null as any,
  profileName: '',
  loadingAuth: true,
});

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

// ScrollToTop component to reset window scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem('veritas-lang') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('veritas-dark') === 'true');
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Persist language and theme
  useEffect(() => {
    localStorage.setItem('veritas-lang', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('veritas-dark', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth and profile name loading & listening at root level to prevent navigation layout shift
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        // 2-second timeout wrapper to prevent hanging on slow network or database responses
        const { data } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth fetch timeout')), 2000))
        ]) as any;

        const currentUser = data.user;
        setUser(currentUser);
        
        if (currentUser) {
          const profilePromise = supabase
            .from('profiles')
            .select('name')
            .eq('user_id', currentUser.id)
            .single();

          const { data: profile } = await Promise.race([
            profilePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 2000))
          ]) as any;

          if (profile?.name) {
            setProfileName(profile.name);
          } else {
            setProfileName(currentUser.user_metadata?.name || currentUser.email || '');
          }
        } else {
          setProfileName('');
        }
      } catch (error) {
        console.warn("Auth user loading timed out or failed:", error);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          const profilePromise = supabase
            .from('profiles')
            .select('name')
            .eq('user_id', currentUser.id)
            .single();

          const { data: profile } = await Promise.race([
            profilePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 2000))
          ]) as any;

          if (profile?.name) {
            setProfileName(profile.name);
          } else {
            setProfileName(currentUser.user_metadata?.name || currentUser.email || '');
          }
        } else {
          setProfileName('');
        }
      } catch (error) {
        console.warn("Auth state listener profile fetch failed or timed out:", error);
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Stealth Escape Double-Press ESC
  useEffect(() => {
    let lastEscapeTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const currentTime = new Date().getTime();
        if (currentTime - lastEscapeTime < 500) {
          // Trigger stealth redirect, replacing history so back button is disabled
          window.location.replace('https://www.wikipedia.org');
        }
        lastEscapeTime = currentTime;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VeritasUIContext.Provider value={{ language, setLanguage, darkMode, setDarkMode, user, profileName, loadingAuth }}>
          <div className={darkMode ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-background min-h-screen'}>
            {/* Pulsing Stealth Panic Button */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 group">
              <span className="bg-gray-900/90 dark:bg-gray-100/95 text-white dark:text-gray-950 text-xs px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none font-medium whitespace-nowrap border border-white/10">
                Double-Press <span className="font-bold underline text-rose-400 dark:text-rose-600">ESC</span> key anywhere to hide site instantly
              </span>
              <button
                onClick={() => window.location.href = '/analyzer#helplines'}
                className="relative bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full px-5 py-3 shadow-lg hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 border border-rose-500/30 overflow-hidden animate-pulse-slow"
                aria-label="Quickly go to a safe page"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 rounded-full" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="relative font-bold text-sm tracking-wide uppercase">🚨 Quick Escape</span>
              </button>
            </div>
            {/* Global toggles bar */}
            <div className={"w-full flex justify-end items-center gap-4 px-6 py-2 border-b border-purple-100/30 bg-background/85 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40"}>
              <label htmlFor="veritas-lang" className="font-medium mr-1">🌐</label>
              <select
                id="veritas-lang"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="rounded px-2 py-1 border dark:bg-gray-800 dark:text-white"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button
                onClick={() => setDarkMode(d => !d)}
                className="px-3 py-1 rounded border font-medium ml-2 dark:bg-gray-800 dark:text-white"
              >
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
                <Route path="/profile-guard" element={<ProfileGuard />} />
                <Route path="/report" element={<ReportSubmission />} />
                <Route path="/evidence" element={<Evidence />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/face-check" element={<FaceCheck />} />
                <Route path="/vault" element={<EmergencyVault />} />
                <Route path="/analyzer" element={<SafetyAnalyzer />} />
                <Route path="/voice-assistant" element={<VoiceAssistant />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </VeritasUIContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
