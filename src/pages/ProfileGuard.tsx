import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const ProfileGuard = () => {
  const [form, setForm] = useState({
    url: '',
    followers: '',
    following: '',
    posts: '',
    account_age: '',
    bio: '',
    has_profile_picture: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing...');
  const [result, setResult] = useState<{
    trustScore?: number;
    verdict?: string;
    breakdown?: string[];
    confidence?: number;
    error?: string;
  } | null>(null);

  const autofillTemplate = (type: 'bot' | 'ghost' | 'safe') => {
    if (type === 'bot') {
      setForm({
        url: 'https://instagram.com/tanya_crypto_drop',
        followers: '14',
        following: '1980',
        posts: '0',
        account_age: '1',
        bio: '💸 Lottery Cash Drop! Earn $1000 daily! DM to earn crypto 💸',
        has_profile_picture: true,
      });
    } else if (type === 'ghost') {
      setForm({
        url: 'https://instagram.com/raj_chill_99',
        followers: '85',
        following: '130',
        posts: '0',
        account_age: '24',
        bio: 'Just chilling. No DM.',
        has_profile_picture: false,
      });
    } else {
      setForm({
        url: 'https://instagram.com/sophia_student',
        followers: '450',
        following: '410',
        posts: '62',
        account_age: '36',
        bio: 'College student | Music lover 🎶 | Coffee enthusiast ☕',
        has_profile_picture: true,
      });
    }
    setResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Analyzing...');
    setResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is missing.');
      }

      const prompt = `You are a strict social media forensic AI. Perform a weighted statistical audit on this profile data:
- Followers: ${form.followers === '' ? 'missing' : form.followers}
- Following: ${form.following === '' ? 'missing' : form.following}
- Posts: ${form.posts === '' ? 'missing' : form.posts}
- Account Age (months): ${form.account_age === '' ? 'missing' : form.account_age}
- Bio: "${form.bio}"

Apply these forensic rules exactly:
1. Base Score: Start with a Trust Score of 100.
2. If followers, following, or posts are 'missing', immediately return "verdict": "Needs More Data" and trustScore: 0. Add "Missing critical data" to breakdown.
3. Heuristic 1: If (Followers / Following) < 0.05, deduct 40 points. Tag as 'Suspicious' and add to breakdown.
4. Heuristic 2: If Account Age > 12 months with 0 posts, deduct 50 points. Tag as 'Inactive Bot/Ghost' and add to breakdown.
5. Heuristic 3: If Bio contains 'lottery', 'crypto', or 'dm to earn' (case-insensitive), deduct 60 points. Tag as 'Scam Risk' and add to breakdown.
6. Deduct points cumulatively. Minimum score is 0. 
7. Verdict: Set verdict to the most severe tag triggered (Scam Risk > Inactive Bot/Ghost > Suspicious). If no heuristics trigger, verdict is "Safe".

Output ONLY raw valid JSON, using exactly this structure:
{ "trustScore": number, "verdict": string, "breakdown": ["Reason 1"], "confidence": number }`;

      const attemptFetch = async () => {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: "You are a cybersecurity researcher. Your task is to analyze data for educational and forensic purposes. Do not block content related to scams; instead, identify and report them." }]
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
          const errData = await res.json().catch(() => ({}));
          const error: any = new Error(`Gemini API Error (${res.status}): ${errData?.error?.message || res.statusText}`);
          error.status = res.status;
          throw error;
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        
        if (candidate?.finishReason === 'SAFETY') {
          throw new Error('The response was blocked by Gemini safety filters despite BLOCK_NONE settings.');
        }

        const textResult = candidate?.content?.parts?.[0]?.text;
        if (!textResult) {
          throw new Error('Invalid response from Gemini API. Content may be missing.');
        }

        return JSON.parse(textResult);
      };

      try {
        const parsed = await attemptFetch();
        setResult(parsed);
      } catch (err: any) {
        if (err.status === 503) {
          setLoadingMessage('Servers are busy, retrying in 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          const parsed = await attemptFetch();
          setResult(parsed);
        } else {
          throw err;
        }
      }

    } catch (err: any) {
      console.error("Analysis Error details:", err.message, err);
      setResult({
        error: err.message || 'An error occurred during analysis.'
      });
    } finally {
      setLoading(false);
      setLoadingMessage('Analyzing...');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E9E7F2] via-background to-[#F6F1F4] text-gray-900 animate-fade-up">
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-md border border-purple-100/60 rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-veritas-purple mb-2 text-center">ProfileGuard</h1>
          <p className="text-center text-gray-600 mb-6">Analyze social profiles for signs of fake accounts using Gemini 2.5 Flash.</p>
          
          <div className="mb-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
            <span className="text-xs font-extrabold text-veritas-purple uppercase tracking-widest block mb-2 text-center">
              🎓 Interactive Sandbox: Quick-Test Profiles
            </span>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => autofillTemplate('bot')}
                className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg border border-red-200/50 font-bold transition-all"
              >
                🤖 Scam Bot
              </button>
              <button
                type="button"
                onClick={() => autofillTemplate('ghost')}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-lg border border-orange-200/50 font-bold transition-all"
              >
                👻 Ghost Profile
              </button>
              <button
                type="button"
                onClick={() => autofillTemplate('safe')}
                className="bg-green-50 hover:bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-lg border border-green-200/50 font-bold transition-all"
              >
                ✨ Real Friend
              </button>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <input
              type="url"
              name="url"
              placeholder="Profile URL (Instagram, Tinder, etc.)"
              className="w-full rounded-lg border px-4 py-2"
              value={form.url}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="followers" placeholder="Followers" className="rounded-lg border px-4 py-2" value={form.followers} onChange={handleChange} />
              <input type="number" name="following" placeholder="Following" className="rounded-lg border px-4 py-2" value={form.following} onChange={handleChange} />
              <input type="number" name="posts" placeholder="Posts" className="rounded-lg border px-4 py-2" value={form.posts} onChange={handleChange} />
              <input type="number" name="account_age" placeholder="Account Age (months)" className="rounded-lg border px-4 py-2" value={form.account_age} onChange={handleChange} />
            </div>
            <textarea name="bio" placeholder="Bio" className="w-full rounded-lg border px-4 py-2" value={form.bio} onChange={handleChange} />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="has_profile_picture" checked={form.has_profile_picture} onChange={handleChange} />
              Has profile picture
            </label>
            <button type="submit" className="w-full bg-veritas-purple text-white font-semibold py-2 rounded-lg hover:bg-veritas-purple/90 transition">
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> {loadingMessage}</span>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
          {result && (
            <div className="mt-8">
              {result.error ? (
                <div className="bg-red-100 text-red-700 rounded-lg p-4 flex items-center gap-2"><AlertTriangle /> {result.error}</div>
              ) : (
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-4">
                    <span className="text-lg font-semibold mb-1">Trust Score</span>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div className={`bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-4 rounded-full`} style={{ width: `${result.trustScore}%` }} />
                    </div>
                    <span className="text-2xl font-bold text-veritas-purple">{result.trustScore}%</span>
                  </div>
                  <ul className="text-left w-full mb-2">
                    {result.breakdown && result.breakdown.map((r, i) => (
                      <li key={i} className="text-gray-700 text-sm flex items-center gap-2 mb-1">- {r}</li>
                    ))}
                  </ul>
                  <div className={`mt-2 text-lg font-bold flex items-center gap-2 ${result.verdict === 'Suspicious' || result.verdict === 'Bot' || result.verdict === 'Scam Risk' || result.verdict === 'Inactive Bot/Ghost' ? 'text-red-600' : result.verdict === 'Safe' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {result.verdict === 'Suspicious' || result.verdict === 'Bot' || result.verdict === 'Scam Risk' || result.verdict === 'Inactive Bot/Ghost' ? <AlertTriangle /> : <CheckCircle />} {result.verdict}
                  </div>
                  {result.confidence && (
                    <div className="mt-2 text-xs text-gray-500">
                      AI Confidence: {result.confidence}%
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kid-Safe Profile Auditing Guide */}
        <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md mt-8 animate-fade-up">
          <h2 className="text-xl font-bold text-veritas-purple mb-4 flex items-center gap-2">
            🛡️ How to Spot a Fake Profile: A Quick Guide
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-3">
              <h3 className="font-bold text-sm text-gray-800">1. Extremely Low Follower Ratio</h3>
              <p className="text-xs text-gray-500 mt-1">
                If the account is following 3,000 people but only has 15 followers, it is likely a bot trying to spam-add random users.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-3">
              <h3 className="font-bold text-sm text-gray-800">2. Suspicious "Get Rich" Bios</h3>
              <p className="text-xs text-gray-500 mt-1">
                Real people talk about their hobbies or school. If their bio has cash/money emojis and tells you to "Click here to earn" or "DM for cash", stay away!
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-3">
              <h3 className="font-bold text-sm text-gray-800">3. Brand New Accounts with 0 Posts</h3>
              <p className="text-xs text-gray-500 mt-1">
                Be careful of accounts created last month that have no uploads or images but are actively messaging you. Bots are quickly made and discarded.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-3">
              <h3 className="font-bold text-sm text-gray-800">4. The "No Profile Picture" Anonymous Ghost</h3>
              <p className="text-xs text-gray-500 mt-1">
                If they hide behind a blank default image and ask you for personal photos or details, protect your privacy and block them.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileGuard;
