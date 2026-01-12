import { useEffect, useState } from "react"
import { toDataURL } from "qrcode"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  QrCode, 
  Download, 
  Share, 
  AlertTriangle, 
  User, 
  Phone, 
  MapPin,
  Heart,
  Shield,
  Clock
} from "lucide-react"

interface EmergencyInfo {
  name: string
  age: string
  bloodType: string
  allergies: string
  medications: string
  conditions: string
  emergencyContact: string
  emergencyPhone: string
}

const defaultInfo: EmergencyInfo = {
  name: "John Doe",
  age: "35",
  bloodType: "A+",
  allergies: "Penicillin, Shellfish",
  medications: "Lisinopril 10mg daily, Metformin 500mg twice daily",
  conditions: "Type 2 Diabetes, Hypertension",
  emergencyContact: "Jane Doe (Spouse)",
  emergencyPhone: "+1 (555) 123-4567"
}

export default function EmergencyQR() {
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>(defaultInfo)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleGenerateQR = async (payload: string) => {
    try {
      // Generate a PNG data URL for the QR code
      const dataUrl = await toDataURL(payload, { errorCorrectionLevel: "M", margin: 2, width: 512 })
      setQrDataUrl(dataUrl)
      setQrGenerated(true)
    } catch (err) {
      console.error("Failed to generate QR:", err)
    }
  }

  // Try to persist the emergency info to Supabase and return a public URL (or null)
  const trySaveToSupabase = async (info: EmergencyInfo) => {
    // If Supabase isn't configured (env vars missing), skip saving
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) return null
    try {
      setSaving(true)
      const payload = { data: info }
      // Use a table name 'emergency_qrs' — create this table in Supabase with columns: id (uuid primary key), data jsonb, created_at
      const { data, error } = await supabase.from("emergency_qrs").insert(payload).select("id").limit(1)
      setSaving(false)
      if (error) {
        console.warn("Supabase insert failed:", error)
        return null
      }
      if (Array.isArray(data) && data[0]?.id) {
        // Build a viewer URL in the same origin
        const id = data[0].id
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        return `${origin}/emergency/${id}`
      }
      return null
    } catch (err) {
      console.error("Supabase save error:", err)
      setSaving(false)
      return null
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = "emergency-qr.png"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleShare = async () => {
    if (!qrDataUrl) return
    try {
      if ((navigator as any).canShare && (navigator as any).share) {
        // Convert data URL to blob then to File if the Web Share API is available
        const res = await fetch(qrDataUrl)
        const blob = await res.blob()
        const file = new File([blob], "emergency-qr.png", { type: blob.type })
        await (navigator as any).share({ files: [file], title: "Emergency QR Code" })
      } else {
        // Fallback: copy data URL to clipboard
        await navigator.clipboard.writeText(qrDataUrl)
        // Optionally inform the user (UI toast not added here)
      }
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  // Auto-generate QR when emergencyInfo changes (debounced)
  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(async () => {
      // Only generate if the form is not empty (basic check)
      const hasAny = Object.values(emergencyInfo).some(v => v && v.length > 0)
      if (!hasAny) return

      // Try to save to Supabase and use returned URL as payload when possible
      const remoteUrl = await trySaveToSupabase(emergencyInfo)
      if (cancelled) return

      const payload = remoteUrl ? remoteUrl : JSON.stringify(emergencyInfo)
      await handleGenerateQR(payload)
    }, 700)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [emergencyInfo])

  const handleInputChange = (field: keyof EmergencyInfo, value: string) => {
    setEmergencyInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-destructive rounded-xl">
            <QrCode className="w-6 h-6 text-destructive-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency QR Code</h1>
            <p className="text-muted-foreground">Quick access to your critical medical information</p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <Card className="border-destructive/20 bg-destructive/5 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Important Safety Information</p>
              <p className="text-sm text-destructive/80">
                This QR code contains your emergency medical information. Keep it accessible and share with trusted individuals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Information Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Emergency Information
            </CardTitle>
            <CardDescription>
              Update your critical medical information for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={emergencyInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={emergencyInfo.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Input
                id="bloodType"
                value={emergencyInfo.bloodType}
                onChange={(e) => handleInputChange("bloodType", e.target.value)}
                placeholder="e.g., A+, O-, B+, AB-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies & Reactions</Label>
              <Textarea
                id="allergies"
                value={emergencyInfo.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                placeholder="List any known allergies..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={emergencyInfo.medications}
                onChange={(e) => handleInputChange("medications", e.target.value)}
                placeholder="List current medications and dosages..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Textarea
                id="conditions"
                value={emergencyInfo.conditions}
                onChange={(e) => handleInputChange("conditions", e.target.value)}
                placeholder="List chronic conditions or important medical history..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={emergencyInfo.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Name and relationship"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input
                  id="emergencyPhone"
                  value={emergencyInfo.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-destructive/10 rounded-lg mx-auto mb-2">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm font-medium">Encrypted</p>
                <p className="text-xs text-muted-foreground">Secure</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium">24/7</p>
                <p className="text-xs text-muted-foreground">Access</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg mx-auto mb-2">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-medium">Life</p>
                <p className="text-xs text-muted-foreground">Saving</p>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Your QR Code
                </span>
                {qrGenerated && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Scan this code to access emergency information
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-4">
                {qrDataUrl ? (
                  <div className="space-y-4">
                    <div className="w-48 h-48 rounded-lg flex items-center justify-center mx-auto">
                      <img src={qrDataUrl} alt="Emergency QR Code" className="w-48 h-48 object-contain" />
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={handleDownload} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={handleShare} className="gap-2">
                        <Share className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mx-auto">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Generate Your QR Code</p>
                      <p className="text-sm text-muted-foreground">
                        Create a secure QR code with your emergency information
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={async () => {
                    // Immediate generation: try to save remotely then generate a QR with returned URL or JSON
                    const remoteUrl = await trySaveToSupabase(emergencyInfo)
                    const payload = remoteUrl ? remoteUrl : JSON.stringify(emergencyInfo)
                    await handleGenerateQR(payload)
                  }}
                  className="w-full bg-gradient-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : (qrGenerated ? "QR Code Generated" : "Generate QR Code")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}