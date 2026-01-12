import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  TrendingUp,
  Calendar,
  BarChart3,
  Save,
  Loader2,
  Flame,
  Brain,
  Lightbulb,
  Activity,
  BookOpen,
  Music,
  Coffee,
  Sun,
  Users,
  CheckCircle2,
  X
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const moodEmojis = ["😢", "😔", "😐", "😊", "😁"]
// moodLabels will be translated in component
const moodColors = [
  "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
]

interface MoodEntry {
  id: string
  mood: number
  note: string | null
  entry_date: string
  created_at: string
}

export default function MoodTracker() {
  const [currentMood, setCurrentMood] = useState([3])
  const [moodNote, setMoodNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null)
  const [showMoodTips, setShowMoodTips] = useState(false)
  const [lastSavedMood, setLastSavedMood] = useState<number | null>(null)
  const { toast } = useToast()
  const { t } = useI18n()
  
  const moodLabels = [t.moodTracker.verySad, t.moodTracker.sad, t.moodTracker.neutral, t.moodTracker.happy, t.moodTracker.veryHappy]

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchMoodEntries()
    } else {
      setLoading(false)
    }
  }, [userId])

  const fetchMoodEntries = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(30)

      if (error) throw error

      setMoodEntries(data || [])
      
      // Check if today's entry exists
      const today = new Date().toISOString().split('T')[0]
      const todayMood = data?.find(entry => entry.entry_date === today)
      if (todayMood) {
        setTodayEntry(todayMood)
        setCurrentMood([todayMood.mood])
        setMoodNote(todayMood.note || "")
      } else {
        setTodayEntry(null)
      }
    } catch (error) {
      console.error("Error fetching mood entries:", error)
      toast({
        title: "Error",
        description: "Failed to load mood entries. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMood = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your mood entries.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const today = new Date().toISOString().split('T')[0]
    const moodValue = currentMood[0]

    try {
      if (todayEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('mood_entries')
          .update({
            mood: moodValue,
            note: moodNote || null,
          })
          .eq('id', todayEntry.id)

        if (error) throw error

        toast({
          title: t.common.success,
          description: t.moodTracker.updateMood + " - " + t.common.success.toLowerCase(),
        })
      } else {
        // Create new entry
        const { error } = await supabase
          .from('mood_entries')
          .insert({
            user_id: userId,
            mood: moodValue,
            note: moodNote || null,
            entry_date: today,
          })

        if (error) throw error

        toast({
          title: t.common.success,
          description: t.moodTracker.saveMood + " - " + t.common.success.toLowerCase(),
        })
      }

      // Show mood improvement tips
      setLastSavedMood(moodValue)
      setShowMoodTips(true)

      // Refresh entries
      await fetchMoodEntries()
    } catch (error: any) {
      console.error("Error saving mood:", error)
      toast({
        title: "Save failed",
        description: error.message || "Failed to save mood entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodIcon = (moodValue: number) => {
    switch (moodValue) {
      case 1:
      case 2:
        return <Frown className="w-5 h-5" />
      case 3:
        return <Meh className="w-5 h-5" />
      case 4:
      case 5:
        return <Smile className="w-5 h-5" />
      default:
        return <Meh className="w-5 h-5" />
    }
  }

  const getAverageMood = () => {
    if (moodEntries.length === 0) return "0.0"
    const total = moodEntries.reduce((sum, entry) => sum + entry.mood, 0)
    return (total / moodEntries.length).toFixed(1)
  }

  const getCurrentStreak = () => {
    if (moodEntries.length === 0) return 0
    
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    )
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].entry_date)
      entryDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - streak)
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++
      } else if (i === 0 && entryDate.getTime() === today.getTime()) {
        // Today's entry exists, start counting from yesterday
        streak = 1
        today.setDate(today.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Prepare chart data (last 7 days)
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map(date => {
      const entry = moodEntries.find(e => e.entry_date === date)
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry?.mood || null,
        fullDate: date,
      }
    })
  }

  const chartData = getChartData()

  // Get mood improvement tips based on mood level
  const getMoodImprovementTips = (mood: number) => {
    const allTips = [
      {
        title: "Take a Walk Outside",
        description: "Even 10 minutes of fresh air and sunlight can boost your mood and energy levels.",
        icon: <Sun className="w-4 h-4 text-wellness" />
      },
      {
        title: "Practice Deep Breathing",
        description: "Take 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 4. Repeat.",
        icon: <Activity className="w-4 h-4 text-wellness" />
      },
      {
        title: "Listen to Uplifting Music",
        description: "Create a playlist of songs that make you happy and play it when you need a boost.",
        icon: <Music className="w-4 h-4 text-wellness" />
      },
      {
        title: "Connect with Someone",
        description: "Reach out to a friend or family member. Social connection is powerful for mental health.",
        icon: <Users className="w-4 h-4 text-wellness" />
      },
      {
        title: "Practice Gratitude",
        description: "Write down 3 things you're grateful for today. Gratitude shifts your perspective.",
        icon: <Heart className="w-4 h-4 text-wellness" />
      },
      {
        title: "Do Something Creative",
        description: "Draw, write, cook, or craft. Creative activities are therapeutic and fulfilling.",
        icon: <BookOpen className="w-4 h-4 text-wellness" />
      },
      {
        title: "Move Your Body",
        description: "Dance, stretch, or do light exercise. Physical activity releases endorphins.",
        icon: <Activity className="w-4 h-4 text-wellness" />
      },
      {
        title: "Limit Screen Time",
        description: "Take breaks from social media and news. Unplugging helps reduce anxiety.",
        icon: <Sun className="w-4 h-4 text-wellness" />
      },
      {
        title: "Get Enough Sleep",
        description: "Aim for 7-9 hours of quality sleep. Rest is essential for emotional regulation.",
        icon: <Coffee className="w-4 h-4 text-wellness" />
      }
    ]

    // For low moods (1-2), show more supportive tips
    if (mood <= 2) {
      return [
        allTips[0], // Walk outside
        allTips[1], // Deep breathing
        allTips[2], // Music
        allTips[3], // Connect with someone
        allTips[4], // Gratitude
        allTips[6], // Move body
      ]
    }
    
    // For neutral mood (3), show balanced tips
    if (mood === 3) {
      return [
        allTips[0], // Walk outside
        allTips[4], // Gratitude
        allTips[5], // Creative activity
        allTips[6], // Move body
        allTips[3], // Connect
        allTips[2], // Music
      ]
    }
    
    // For positive moods (4-5), show maintenance tips
    return [
      allTips[5], // Creative activity
      allTips[4], // Gratitude
      allTips[6], // Move body
      allTips[3], // Connect
      allTips[8], // Sleep
      allTips[7], // Limit screen time
    ]
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-wellness rounded-xl">
            <Smile className="w-6 h-6 text-wellness-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.moodTracker.title}</h1>
            <p className="text-muted-foreground">{t.moodTracker.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Mental Health Importance */}
      <Card className="shadow-card border-l-4 border-l-wellness">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-wellness" />
            {t.moodTracker.mentalHealthMatters}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed text-muted-foreground">
            Mental health is just as important as physical health. Taking care of your emotional wellbeing helps you:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-wellness mt-0.5 flex-shrink-0" />
              <span className="text-sm">Cope with stress and life's challenges</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-wellness mt-0.5 flex-shrink-0" />
              <span className="text-sm">Build stronger relationships</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-wellness mt-0.5 flex-shrink-0" />
              <span className="text-sm">Make meaningful contributions to your community</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-wellness mt-0.5 flex-shrink-0" />
              <span className="text-sm">Work productively and realize your potential</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic pt-2">
            Tracking your mood helps you identify patterns, understand triggers, and take proactive steps toward better mental health.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-wellness/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-wellness" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.moodTracker.averageMood}</p>
                <p className="text-2xl font-bold text-wellness">{getAverageMood()}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.moodTracker.currentStreak}</p>
                <p className="text-2xl font-bold text-accent">{getCurrentStreak()} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.moodTracker.totalEntries}</p>
                <p className="text-2xl font-bold text-primary">{moodEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Input */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t.moodTracker.howAreYouFeeling}
            </CardTitle>
            <CardDescription>
              {todayEntry ? t.moodTracker.updateMood : t.moodTracker.saveMood}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selector */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-6xl">
                  {moodEmojis[currentMood[0] - 1]}
                </div>
                <p className="text-xl font-medium">
                  {moodLabels[currentMood[0] - 1]}
                </p>
              </div>
              
              <div className="space-y-3">
                <Slider
                  value={currentMood}
                  onValueChange={setCurrentMood}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Very Sad</span>
                  <span>Sad</span>
                  <span>Neutral</span>
                  <span>Happy</span>
                  <span>Very Happy</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What's on your mind? (Optional)
              </label>
              <Textarea
                placeholder="Share how you're feeling or what happened today..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={3}
                className="text-base"
              />
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveMood}
              className="w-full bg-gradient-wellness"
              disabled={isSubmitting || !userId}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {todayEntry ? t.moodTracker.updateMood : t.moodTracker.saveMood}
                </>
              )}
            </Button>
            {!userId && (
              <p className="text-sm text-muted-foreground text-center">
                Sign in to save your mood entries
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{t.moodTracker.moodTrends}</CardTitle>
            <CardDescription>
              Your mood patterns over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : moodEntries.length === 0 ? (
              <div className="h-64 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">No mood data yet</p>
                  <p className="text-sm text-muted-foreground">Start tracking your mood to see trends</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--wellness))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--wellness))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood Improvement Tips - Shows after logging mood */}
      {showMoodTips && lastSavedMood !== null && (
        <Card className="shadow-card bg-gradient-to-br from-wellness/5 to-primary/5 border-2 border-wellness/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-wellness" />
                {t.moodTracker.waysToImprove}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMoodTips(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {lastSavedMood <= 2 
                ? "Here are some activities that can help lift your spirits" 
                : lastSavedMood === 3
                ? "Keep up the good work! Here are ways to maintain and boost your mood"
                : "Great to see you're feeling good! Here are activities to maintain your positive energy"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMoodImprovementTips(lastSavedMood).map((tip, index) => (
                <div
                  key={index}
                  className="p-4 bg-card rounded-lg border hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-wellness/10 rounded-lg flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <Card className="shadow-card">
        <CardHeader>
        <CardTitle>{t.moodTracker.recentEntries}</CardTitle>
        <CardDescription>
          Your mood history and notes
        </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : moodEntries.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Smile className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No mood entries yet</p>
              <p className="text-sm text-muted-foreground">Start tracking your mood to see your history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full flex-shrink-0">
                    <span className="text-2xl">
                      {moodEmojis[entry.mood - 1]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-base">
                        {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={moodColors[entry.mood - 1]}
                      >
                        {moodLabels[entry.mood - 1]}
                      </Badge>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getMoodIcon(entry.mood)}
                    <span className="text-sm font-medium">{entry.mood}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
