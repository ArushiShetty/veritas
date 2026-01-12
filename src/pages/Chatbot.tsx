import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Sparkles, Plus, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n/context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! I'm your AI health assistant. I can help you:\n\n• Set up medication reminders\n• Schedule hospital appointments\n• Track when to take pills\n• Remember doctor visits\n\nJust tell me what you need, like 'Remind me to take aspirin at 8am daily', and I'll help you stay on top of your health!",
    sender: "bot",
    timestamp: new Date()
  }
];

const quickPrompts = [
  "Remind me to take aspirin at 8am daily",
  "Schedule a doctor appointment next week",
  "Set up my morning medication routine",
  "Create a weekly checkup reminder"
];

type AssistantIntent =
  | "medication_reminder"
  | "appointment"
  | "pill_tracking"
  | "doctor_visit"
  | "condition_info"
  | "general";

interface ReminderDetails {
  title: string;
  time: string;
  description: string;
  frequency: string;
  type: string;
}

interface AppointmentDetails {
  title: string;
  description: string;
  date: Date;
  location: string | null;
  status: string;
}

const detectIntent = (message: string): AssistantIntent => {
  const text = message.toLowerCase();
  if (text.includes("remind") || text.includes("medication") || text.includes("pill schedule")) {
    return "medication_reminder";
  }
  if (text.includes("take pill") || text.includes("pill tracker")) {
    return "pill_tracking";
  }
  if (text.includes("appointment") || text.includes("hospital") || text.includes("schedule visit")) {
    return "appointment";
  }
  if (text.includes("doctor visit") || text.includes("follow up") || text.includes("doctor list")) {
    return "doctor_visit";
  }
  if (text.includes("what is") || text.includes("disease") || text.includes("symptom") || text.includes("condition")) {
    return "condition_info";
  }
  return "general";
};

const to24HrTime = (match: RegExpMatchArray | null): string => {
  if (!match) return "08:00";
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const parseReminderDetails = (message: string, intent: AssistantIntent): ReminderDetails => {
  const timeMatch = message.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)?/i);
  const normalizedTime = to24HrTime(timeMatch);
  const intentLabel = intent === "pill_tracking" ? "Pill Tracker" : "Medication";
  const title =
    message
      .replace(/remind me to/i, "")
      .replace(/schedule/i, "")
      .trim() || `${intentLabel} reminder`;

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    time: normalizedTime,
    frequency: message.includes("weekly") ? "weekly" : "daily",
    description: `Auto-created from chat: "${message}"`,
    type: intent === "pill_tracking" ? "pill-tracker" : "medication",
  };
};

const parseAppointmentDetails = (message: string): AppointmentDetails => {
  const now = new Date();
  let daysToAdd = 2;
  if (message.includes("tomorrow")) daysToAdd = 1;
  if (message.includes("today")) daysToAdd = 0;
  if (message.includes("next week")) daysToAdd = 7;
  const appointmentDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  appointmentDate.setHours(10, 0, 0, 0);

  if (message.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i)) {
    const parsedTime = to24HrTime(message.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i));
    const [hours, minutes] = parsedTime.split(":").map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
  }

  return {
    title: "Doctor visit",
    description: `Auto-scheduled from chat: "${message}"`,
    date: appointmentDate,
    location: null,
    status: "scheduled",
  };
};

const getSystemPrompt = (intent: AssistantIntent) => `
You are MedPal, a friendly AI health assistant. Your responsibilities:
- Help users set up medication reminders, pill schedules, hospital appointments, and doctor visit notes.
- Offer quick comfort tips (hydration, rest, contact doctor) but NEVER state medication dosages or prescribe.
- Provide clear steps, checklists, and encourage professional consultation.
- Keep responses concise, structured, supportive, and policy-compliant.
- If discussing symptoms or diseases, share general info only and warn against self-medication.
- Mention if a reminder or appointment was logged when context is provided.
- Prioritize fast, readable answers.
Focus right now on ${intent.replace("_", " ")} while remaining open to related health questions.`;

const fetchConditionInsights = async (message: string, intent: AssistantIntent): Promise<string | null> => {
  if (intent !== "condition_info") return null;
  try {
    const encoded = encodeURIComponent(message.toLowerCase().replace(/what is|tell me about/gi, "").trim());
    const response = await fetch(
      `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encoded}&df=primary_name,synonyms&maxList=3`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const results: string[] = data?.[1] ?? [];
    if (!results.length) return null;
    return `Top related conditions from NIH Clinical Tables: ${results.slice(0, 3).join(", ")}.`;
  } catch {
    return null;
  }
};

const createReminderEntry = async (userId: string, details: ReminderDetails) => {
  const now = new Date();
  const [hours, minutes] = details.time.split(":").map(Number);
  const nextDue = new Date(now);
  nextDue.setHours(hours, minutes, 0, 0);
  if (nextDue < now) {
    nextDue.setDate(nextDue.getDate() + 1);
  }

  const { error } = await supabase.from("reminders").insert({
    user_id: userId,
    title: details.title,
    description: details.description,
    type: details.type,
    frequency: details.frequency,
    time: details.time,
    next_due: nextDue.toISOString(),
    is_active: true,
  });

  if (error) throw error;
  return `Reminder logged for ${details.title} at ${details.time}.`;
};

const createAppointmentEntry = async (userId: string, details: AppointmentDetails) => {
  const { error } = await supabase.from("appointments").insert({
    user_id: userId,
    title: details.title,
    description: details.description,
    appointment_date: details.date.toISOString(),
    duration_minutes: 30,
    location: details.location,
    reminder_before_minutes: 30,
    status: details.status,
  });
  if (error) throw error;
  return `Appointment penciled in for ${details.date.toLocaleString()}.`;
};

// Enhanced ChatGPT-like responses
const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Medication reminders - more conversational
  if (message.includes('remind') && (message.includes('medication') || message.includes('pill') || message.includes('medicine'))) {
    return "I'd be happy to help you set up a medication reminder! 😊\n\nTo create the perfect reminder for you, I'll need a few details:\n\n• What medication are you taking?\n• What time would you like to be reminded?\n• How often should this happen (daily, twice daily, etc.)?\n• Any special instructions?\n\nOnce you give me these details, I can set up a reminder that will help you stay consistent with your medication schedule. This is really important for your health! 💊";
  }
  
  // Doctor appointments - more helpful
  if (message.includes('appointment') || message.includes('doctor') || message.includes('visit')) {
    return "I can definitely help you schedule a doctor appointment! 🏥\n\nLet me gather some information to make this easier for you:\n\n• What type of appointment do you need? (routine checkup, specialist visit, follow-up, etc.)\n• Do you have a preferred date and time?\n• Is there a specific doctor or clinic you'd like to see?\n• What's the reason for the visit?\n\nI'll help you organize everything and make sure you don't miss any important healthcare appointments. Your health is a priority! ❤️";
  }
  
  // Headaches - more empathetic
  if (message.includes('headache')) {
    return "I'm sorry to hear you're dealing with a headache! 😔 Headaches can be really frustrating.\n\nHere are some things that might help:\n\n• **Hydration**: Make sure you're drinking enough water throughout the day\n• **Rest**: Sometimes your body just needs a break - try lying down in a quiet, dark room\n• **Stress management**: Deep breathing or gentle stretching can help\n• **Screen breaks**: If you've been staring at screens, take regular breaks\n• **Temperature**: A cool compress on your forehead might feel good\n\nIf your headache is severe, persistent, or accompanied by other symptoms, please don't hesitate to contact a healthcare professional. Your wellbeing matters! 💙";
  }
  
  // Sleep - more understanding
  if (message.includes('sleep') || message.includes('insomnia')) {
    return "Sleep is so important for your overall health! I understand how frustrating it can be when you're not getting the rest you need. 😴\n\nHere are some strategies that might help:\n\n• **Consistent schedule**: Try to go to bed and wake up at the same time every day\n• **Bedtime routine**: Create a relaxing wind-down routine (reading, gentle music, etc.)\n• **Environment**: Keep your bedroom cool, dark, and quiet\n• **Screen time**: Avoid screens for at least an hour before bed - the blue light can interfere with sleep\n• **Caffeine timing**: Try to avoid caffeine after 2 PM\n• **Relaxation**: Consider meditation or gentle breathing exercises\n\nGood sleep hygiene takes time to develop, but it's worth it for your health! Sweet dreams! 🌙";
  }
  
  // Exercise - more motivational
  if (message.includes('exercise') || message.includes('workout')) {
    return "That's awesome that you're thinking about exercise! 💪 Physical activity is one of the best things you can do for your health.\n\nHere are some ideas to get you started:\n\n• **Start small**: Even 10-15 minutes of movement is better than nothing\n• **Find what you enjoy**: Walking, dancing, swimming, yoga - the best exercise is the one you'll actually do\n• **Mix it up**: Combine cardio (heart-pumping activities) with strength training\n• **Listen to your body**: It's okay to start slow and gradually increase intensity\n• **Make it social**: Exercise with friends or family to stay motivated\n• **Track progress**: Celebrate small wins along the way\n\nRemember, every step counts toward a healthier you! You've got this! 🎯";
  }
  
  // Diet - more practical
  if (message.includes('diet') || message.includes('nutrition') || message.includes('food')) {
    return "Great question about nutrition! 🥗 What you eat really does impact how you feel every day.\n\nHere are some practical tips for a balanced diet:\n\n• **Colorful plate**: Aim for a rainbow of fruits and vegetables - different colors mean different nutrients\n• **Stay hydrated**: Water is your best friend - aim for 8 glasses a day\n• **Whole foods**: Choose whole grains, lean proteins, and fresh produce over processed foods\n• **Regular meals**: Don't skip meals - this helps maintain steady energy and blood sugar\n• **Mindful eating**: Pay attention to hunger and fullness cues\n• **Moderation**: It's okay to enjoy treats in moderation - balance is key!\n\nRemember, healthy eating is about progress, not perfection. Every good choice counts! 🌟";
  }
  
  // Emergency - more caring
  if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
    return "🚨 **If this is a medical emergency, please call your local emergency number immediately!**\n\nYour safety is the most important thing right now.\n\nFor non-emergency health concerns, I'm here to help you with:\n• Setting up medication reminders\n• Scheduling doctor appointments\n• Tracking symptoms and health patterns\n• Organizing your health information\n• Answering general health questions\n\nI care about your wellbeing and want to make sure you get the help you need. Don't hesitate to reach out! 💙";
  }
  
  // General greeting and help
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! 👋 I'm your AI health assistant, and I'm here to help you with all things health-related!\n\nI can assist you with:\n• **Medication reminders** - Never miss a dose again\n• **Doctor appointments** - Keep track of your healthcare schedule\n• **Health questions** - Get reliable information about symptoms, treatments, and wellness\n• **Lifestyle tips** - Sleep, exercise, nutrition, and stress management\n• **Health tracking** - Monitor your symptoms and progress\n\nWhat can I help you with today? I'm excited to support you on your health journey! 🌟";
  }
  
  // Default helpful response - more engaging
  return `I'm your AI health assistant, and I'm here to help you with anything health-related! 🤖💙\n\nI can assist you with:\n• **Medication management** - Set up reminders and track your medications\n• **Healthcare scheduling** - Organize doctor appointments and checkups\n• **Health questions** - Get reliable information about symptoms and treatments\n• **Wellness tips** - Sleep, exercise, nutrition, and mental health advice\n• **Symptom tracking** - Help you monitor and understand your health patterns\n\nI'm designed to be like ChatGPT but focused specifically on your health and wellness. Ask me anything - whether it's about a headache, sleep problems, exercise routines, or setting up medication reminders. I'm here to help you feel your best! ✨\n\nWhat would you like to talk about today?`;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window) {
      setSpeechSupported(true);
      const populateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices().filter(voice =>
          voice.lang.toLowerCase().startsWith("en")
        );
      };
      populateVoices();
      window.speechSynthesis.addEventListener("voiceschanged", populateVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", populateVoices);
      };
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!voiceEnabled || !speechSupported || typeof window === "undefined") return;
    const lastBot = [...messages].reverse().find(msg => msg.sender === "bot");
    if (!lastBot) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastBot.text.replace(/\n+/g, " "));
    utterance.rate = 1.05;
    utterance.pitch = 1;
    if (voicesRef.current.length > 0) {
      utterance.voice = voicesRef.current[0];
    }
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [messages, voiceEnabled, speechSupported]);

  const handleSendMessage = async (text: string, action?: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const intent = detectIntent(userMessage.text);
      const conditionContext = await fetchConditionInsights(userMessage.text, intent);
      let actionContext = "";
      
      if (!session && action === 'create_reminder') {
        toast({
          title: "Authentication required",
          description: "Please sign in to create reminders",
          variant: "destructive"
        });
        setIsTyping(false);
        return;
      }

      // handle structured actions
      if ((intent === "medication_reminder" || intent === "pill_tracking") && session?.user) {
        try {
          const details = parseReminderDetails(userMessage.text, intent);
          const summary = await createReminderEntry(session.user.id, details);
          actionContext = summary;
          toast({ title: "Reminder saved", description: summary });
        } catch (err) {
          console.error(err);
          toast({
            title: "Reminder failed",
            description: "We couldn't save that reminder. Try again shortly.",
            variant: "destructive"
          });
        }
      } else if ((intent === "appointment" || intent === "doctor_visit") && session?.user) {
        try {
          const appointment = parseAppointmentDetails(userMessage.text);
          const summary = await createAppointmentEntry(session.user.id, appointment);
          actionContext = summary;
          toast({ title: "Appointment drafted", description: summary });
        } catch (err) {
          console.error(err);
          toast({
            title: "Appointment failed",
            description: "Unable to log the visit. Please try again.",
            variant: "destructive"
          });
        }
      } else if (
        (intent === "medication_reminder" || intent === "pill_tracking" || intent === "appointment" || intent === "doctor_visit") &&
        !session
      ) {
        toast({
          title: "Sign in required",
          description: "Log in to save reminders and appointments automatically.",
          variant: "destructive"
        });
      }

      // Try Groq API first (fast and reliable)
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!groqKey) {
        // No API key - use offline responses immediately
        const response = getFallbackResponse(userMessage.text);
        
        // Simulate typing delay for better UX
        const words = response.split(' ');
        let index = 0;
        let assistantSoFar = "";
        const assistantMessageId = (Date.now() + 1).toString();
        
        const typeResponse = () => {
          if (index < words.length) {
            assistantSoFar += words[index] + ' ';
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.sender === "bot" && last.id === assistantMessageId) {
                return prev.map((m) => 
                  m.id === assistantMessageId 
                    ? { ...m, text: assistantSoFar } 
                    : m
                );
              }
              return [...prev, {
                id: assistantMessageId,
                text: assistantSoFar,
                sender: "bot" as const,
                timestamp: new Date()
              }];
            });
            index++;
            setTimeout(typeResponse, 50); // Typing delay
          } else {
            setIsTyping(false);
          }
        };
        
        typeResponse();
        return;
      }
      
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: getSystemPrompt(intent)
              },
              ...(conditionContext ? [{ role: "system" as const, content: conditionContext }] : []),
              ...(actionContext ? [{ role: "system" as const, content: `System notice: ${actionContext}` }] : []),
              {
                role: "system",
                content: "Never mention medication dosages or prescribe. Offer general supportive tips only."
              },
              ...messages.map(msg => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text
              })),
              {
                role: "user",
                content: userMessage.text
              }
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          console.error("Groq API error:", response.status, errorText);
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again in a moment.");
          }
          if (response.status === 401) {
            throw new Error("API key invalid. Please check your VITE_GROQ_API_KEY in .env");
          }
          if (response.status === 400) {
            throw new Error(`Bad request: ${errorText.substring(0, 100)}`);
          }
          throw new Error(`API error (${response.status}): ${errorText.substring(0, 100)}`);
        }
        
        if (!response.body) {
          throw new Error("No response body received from Groq API");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let assistantMessageId = (Date.now() + 1).toString();
        let assistantSoFar = "";
        let hasReceivedContent = false;

        try {
          while (!streamDone) {
            const { done, value } = await reader.read();
            if (done) {
              streamDone = true;
              break;
            }
            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                streamDone = true;
                break;
              }

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  hasReceivedContent = true;
                  assistantSoFar += content;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.sender === "bot" && last.id === assistantMessageId) {
                      return prev.map((m) => 
                        m.id === assistantMessageId 
                          ? { ...m, text: assistantSoFar } 
                          : m
                      );
                    }
                    return [...prev, {
                      id: assistantMessageId,
                      text: assistantSoFar,
                      sender: "bot" as const,
                      timestamp: new Date()
                    }];
                  });
                }
              } catch (parseError) {
                // Skip malformed JSON lines, continue processing
                console.warn("Failed to parse line:", line.substring(0, 50));
                continue;
              }
            }
          }

          // Process any remaining buffer
          if (textBuffer.trim()) {
            for (let raw of textBuffer.split("\n")) {
              if (!raw || raw.startsWith(":") || raw.trim() === "" || !raw.startsWith("data: ")) continue;
              const jsonStr = raw.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  hasReceivedContent = true;
                  assistantSoFar += content;
                  setMessages(prev => 
                    prev.map((m) => 
                      m.id === assistantMessageId 
                        ? { ...m, text: assistantSoFar } 
                        : m
                    )
                  );
                }
              } catch { /* ignore malformed lines */ }
            }
          }

          // If we didn't get any content, something went wrong
          if (!hasReceivedContent && assistantSoFar.trim() === "") {
            throw new Error("Received empty response from Groq API");
          }

          setIsTyping(false);
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          // If we got some content, show it even if stream had issues
          if (assistantSoFar.trim()) {
            setIsTyping(false);
            return;
          }
          throw streamError;
        }
      } catch (apiError: any) {
        console.error("Groq API call failed:", apiError);
        // Re-throw with more context
        throw apiError instanceof Error ? apiError : new Error(`API error: ${String(apiError)}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Get detailed error message
      let errorMessage = "AI service temporarily unavailable. Using offline responses.";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common issues
        if (error.message.includes("API key invalid")) {
          errorMessage = "Invalid Groq API key. Please check your VITE_GROQ_API_KEY in .env file.";
        } else if (error.message.includes("Rate limit")) {
          errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("Bad request")) {
          errorMessage = "Invalid request to Groq API. Check console for details.";
        }
      }
      
      // Fallback response when API fails
      const fallbackResponse = getFallbackResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Using offline mode",
        description: errorMessage,
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-6rem)]">
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t.chatbot.title}
                  <Sparkles className="w-4 h-4 text-primary" />
                </CardTitle>
                <CardDescription>
                  {t.chatbot.subtitle}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={!speechSupported}
                onClick={() => {
                  if (!speechSupported) {
                    toast({
                      title: t.chatbot.voiceNotSupported,
                      description: "Try using Chrome, Edge, or Safari to enable voice playback."
                    });
                    return;
                  }
                  setVoiceEnabled(prev => !prev);
                }}
              >
                {voiceEnabled ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    {t.chatbot.voiceOff}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    {t.chatbot.voiceOn}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 shadow-card">
          <CardContent className="p-0 h-full flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="w-8 h-8 bg-gradient-primary">
                        <AvatarFallback className="text-primary-foreground">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 opacity-70 ${
                        message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8 bg-accent">
                        <AvatarFallback className="text-accent-foreground">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 bg-gradient-primary">
                      <AvatarFallback className="text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            <div className="p-4 border-t">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSendMessage(inputValue, 'create_reminder')} 
                  disabled={isTyping || !inputValue.trim()} 
                  size="icon"
                  variant="outline"
                  title="Create reminder from message"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={t.chatbot.placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSendMessage(inputValue)}
                  disabled={isTyping}
                />
                <Button 
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}