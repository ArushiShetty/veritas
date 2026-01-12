import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  Bot,
  Heart,
  FileText,
  QrCode,
  Smile,
  Bell,
  BarChart3,
  Home,
  LogOut
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { LanguageSelector } from "@/components/LanguageSelector"
import { useI18n } from "@/lib/i18n/context"

// Navigation items will be translated in the component
const navigationItems = [
  { key: "dashboard", url: "/dashboard", icon: Home },
  { key: "chatbot", url: "/chatbot", icon: Bot },
  { key: "healthVault", url: "/vault", icon: FileText },
  { key: "emergencyQR", url: "/emergency", icon: QrCode },
  { key: "moodTracker", url: "/mood", icon: Smile },
  { key: "reminders", url: "/reminders", icon: Bell },
  { key: "insights", url: "/insights", icon: BarChart3 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useI18n()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const currentPath = location.pathname
  
  const isCollapsed = state === "collapsed"
  const isActive = (path: string) => currentPath === path

  useEffect(() => {
    // Check auth state and get user name
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || 
                     session.user.email?.split('@')[0] || 
                     'User'
        setUserName(name)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || 
                     session.user.email?.split('@')[0] || 
                     'User'
        setUserName(name)
      } else {
        setUserName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      navigate("/auth")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="bg-gradient-primary">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-card rounded-lg shadow-soft">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">MedPal</h1>
                {userName ? (
                  <p className="text-sm text-primary-foreground/80">Hello {userName}!</p>
                ) : (
                  <p className="text-sm text-primary-foreground/80">Wellness Hub</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-base text-primary-foreground/80 px-4">
              {t.sidebar.navigation}
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const title = t.sidebar[item.key as keyof typeof t.sidebar]
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => 
                          `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-smooth ${
                            isActive 
                              ? "bg-card text-primary shadow-soft" 
                              : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span className="font-medium text-base">{title}</span>}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 space-y-2">
          <div className="mb-2">
            <LanguageSelector />
          </div>
          {!isSignedIn && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              <Heart className="w-5 h-5" />
              {!isCollapsed && <span className="text-base">{t.common.signIn}</span>}
            </Button>
          )}
          {isSignedIn && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="text-base">{t.common.signOut}</span>}
            </Button>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}