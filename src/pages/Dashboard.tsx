import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bot, 
  FileText, 
  QrCode, 
  Smile, 
  Bell, 
  BarChart3, 
  Heart,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useI18n } from "@/lib/i18n/context"

// Feature cards will be translated in component
const featureCardKeys = [
  { key: "aiHealthChatbot", icon: Bot, path: "/chatbot", color: "bg-gradient-primary", stats: "24/7 Available" },
  { key: "healthVault", icon: FileText, path: "/vault", color: "bg-gradient-secondary", stats: "5 Records" },
  { key: "emergencyQR", icon: QrCode, path: "/emergency", color: "bg-destructive", stats: "Ready" },
  { key: "moodTracker", icon: Smile, path: "/mood", color: "bg-gradient-wellness", stats: "7 Day Streak" },
  { key: "medicationReminders", icon: Bell, path: "/reminders", color: "bg-accent", stats: "3 Active" },
  { key: "healthInsights", icon: BarChart3, path: "/insights", color: "bg-gradient-secondary", stats: "Updated" }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.dashboard.welcomeBack}</h1>
            <p className="text-muted-foreground">{t.dashboard.wellnessJourney}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.dashboard.healthScore}</p>
                <p className="text-2xl font-bold text-accent">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records Stored</p>
                <p className="text-2xl font-bold text-primary">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-wellness/10 rounded-lg">
                <Clock className="w-5 h-5 text-wellness" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold text-wellness">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">{t.dashboard.quickAccess}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCardKeys.map((feature) => {
            const title = t.dashboard[feature.key as keyof typeof t.dashboard]
            return (
              <Card 
                key={feature.key} 
                className="shadow-card hover:shadow-medium transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {title}
                  </CardTitle>
                  <CardDescription>
                    {title} - {t.common.welcome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-primary/5 transition-colors"
                  >
                    {t.common.welcome}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}