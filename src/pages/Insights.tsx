import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart,
  Target,
  Calendar,
  Award
} from "lucide-react"

const mockHealthData = [
  { date: "Jan 1", steps: 8500, mood: 4, medications: 2 },
  { date: "Jan 2", steps: 9200, mood: 5, medications: 2 },
  { date: "Jan 3", steps: 7800, mood: 3, medications: 1 },
  { date: "Jan 4", steps: 10100, mood: 4, medications: 2 },
  { date: "Jan 5", steps: 9800, mood: 4, medications: 2 },
  { date: "Jan 6", steps: 11200, mood: 5, medications: 2 },
  { date: "Jan 7", steps: 8900, mood: 3, medications: 2 }
]

const healthMetrics = [
  {
    title: "Daily Steps",
    value: "9,200",
    change: "+12%",
    trending: "up",
    icon: Activity,
    color: "primary"
  },
  {
    title: "Average Mood",
    value: "4.1/5",
    change: "+5%",
    trending: "up",
    icon: Heart,
    color: "wellness"
  },
  {
    title: "Medication Adherence",
    value: "95%",
    change: "+2%",
    trending: "up",
    icon: Target,
    color: "accent"
  },
  {
    title: "Sleep Quality",
    value: "7.8/10",
    change: "-3%",
    trending: "down",
    icon: Calendar,
    color: "secondary"
  }
]

const insights = [
  {
    title: "Great Progress!",
    description: "Your mood has improved by 15% over the past week. Keep up the excellent work!",
    type: "positive",
    icon: Award
  },
  {
    title: "Medication Reminder",
    description: "You've been consistent with your medications. This consistency is key to your health.",
    type: "info",
    icon: Target
  },
  {
    title: "Activity Suggestion",
    description: "Consider adding 10 more minutes of walking daily to reach your optimal activity level.",
    type: "suggestion",
    icon: TrendingUp
  }
]

export default function Insights() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-secondary rounded-xl">
            <BarChart3 className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Health Insights</h1>
            <p className="text-muted-foreground">Visualize your health trends and patterns</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 bg-${metric.color}/10 rounded-lg`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trending === "up" ? "text-accent" : "text-destructive"
                }`}>
                  {metric.trending === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className={`text-2xl font-bold text-${metric.color}`}>{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly Activity Overview</CardTitle>
            <CardDescription>
              Your daily steps and activity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-primary rounded-lg p-4 flex items-center justify-center">
              <div className="text-center space-y-2 text-primary-foreground">
                <Activity className="w-12 h-12 mx-auto" />
                <p className="font-medium">Activity Chart</p>
                <p className="text-sm opacity-80">Interactive chart showing daily steps and trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Mood Patterns</CardTitle>
            <CardDescription>
              Your emotional wellbeing trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-wellness rounded-lg p-4 flex items-center justify-center">
              <div className="text-center space-y-2 text-wellness-foreground">
                <Heart className="w-12 h-12 mx-auto" />
                <p className="font-medium">Mood Trends</p>
                <p className="text-sm opacity-80">Visual representation of your mood over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Score Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Overall Health Score</CardTitle>
          <CardDescription>
            Combined view of all your health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">85</span>
              </div>
              <p className="font-medium">Overall Score</p>
              <p className="text-sm text-muted-foreground">Based on all metrics</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Physical Activity</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-4/5 h-full bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Mental Health</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-5/6 h-full bg-wellness rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Medication</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-full h-full bg-accent rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <Badge className="bg-accent/10 text-accent">Excellent</Badge>
              <p className="text-sm text-muted-foreground">
                You're maintaining great health habits! Keep up the excellent work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>AI Health Insights</CardTitle>
          <CardDescription>
            Personalized recommendations based on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === "positive" 
                    ? "bg-accent/5 border-l-accent" 
                    : insight.type === "info"
                    ? "bg-primary/5 border-l-primary"
                    : "bg-wellness/5 border-l-wellness"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === "positive" 
                      ? "bg-accent/10 text-accent" 
                      : insight.type === "info"
                      ? "bg-primary/10 text-primary"
                      : "bg-wellness/10 text-wellness"
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}