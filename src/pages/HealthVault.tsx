import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useI18n } from "@/lib/i18n/context"
import { FileText, Upload, Download, Trash2, Plus, Loader2, AlertCircle } from "lucide-react"

interface HealthRecord {
  id: string
  title: string
  type: string
  doctor: string | null
  hospital: string | null
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  created_at: string
  storage_provider?: "supabase" | "local"
  local_data?: string
}

const LOCAL_STORAGE_KEY = "medpal-health-records"

const loadLocalRecords = (): HealthRecord[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveLocalRecords = (records: HealthRecord[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records))
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function HealthVault() {
  const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000" // demo user ID
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [recordType, setRecordType] = useState("Lab Report")
  const [doctor, setDoctor] = useState("")
  const [hospital, setHospital] = useState("")
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useI18n()
  const fallbackToastShown = useRef(false)

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
      if (session?.user?.id) {
        fetchRecords()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [userId])

  const fetchRecords = async () => {
    setLoading(true)
    const currentUserId = userId || DEMO_USER_ID
    
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setIsSupabaseOnline(true)
      setRecords(data || [])
    } catch (error) {
      console.error(error)
      // Only use local fallback if not signed in
      if (!userId) {
        const fallback = loadLocalRecords()
        setRecords(fallback)
        setIsSupabaseOnline(false)
        if (!fallbackToastShown.current) {
          toast({
            title: "Demo mode activated",
            description: "Sign in to sync your records to the cloud.",
            variant: fallback.length ? "default" : "destructive",
          })
          fallbackToastShown.current = true
        }
      } else {
        toast({
          title: "Failed to load records",
          description: "Could not fetch your health records. Please try again.",
          variant: "destructive",
        })
        setRecords([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB", variant: "destructive" })
        return
      }
      setSelectedFile(file)
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast({ title: "Missing Info", description: "Select a file and enter title", variant: "destructive" })
      return
    }
    setUploading(true)
    const currentUserId = userId || DEMO_USER_ID
    
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('health-records')
        .upload(fileName, selectedFile, {
          contentType: selectedFile.type || 'application/octet-stream',
          upsert: false
        })
      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('health_records')
        .insert({
          user_id: currentUserId,
          title,
          type: recordType,
          doctor: doctor || null,
          hospital: hospital || null,
          file_name: selectedFile.name,
          file_path: fileName,
          file_size: selectedFile.size,
          mime_type: selectedFile.type
        })
      if (dbError) throw dbError

      toast({ title: "Success", description: "Record uploaded!" })

      setSelectedFile(null)
      setTitle("")
      setRecordType("Lab Report")
      setDoctor("")
      setHospital("")
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      fetchRecords()
    } catch (error: any) {
      console.error(error)
      await handleLocalUpload()
      const msg = (error && (error.message || error.error)) ? (error.message || error.error) : 'Saved locally instead.'
      toast({ title: "Supabase upload failed", description: msg, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleLocalUpload = async () => {
    if (!selectedFile) return
    const base64 = await fileToBase64(selectedFile)
    const newRecord: HealthRecord = {
      id: crypto.randomUUID(),
      title,
      type: recordType,
      doctor: doctor || null,
      hospital: hospital || null,
      file_name: selectedFile.name,
      file_path: `local-${Date.now()}`,
      file_size: selectedFile.size,
      mime_type: selectedFile.type,
      created_at: new Date().toISOString(),
      storage_provider: "local",
      local_data: base64,
    }

    const updatedRecords = [newRecord, ...loadLocalRecords()]
    saveLocalRecords(updatedRecords)
    setRecords(updatedRecords)
    toast({ title: "Saved locally", description: "We'll keep this on your device until Supabase is available." })
    setSelectedFile(null)
    setTitle("")
    setRecordType("Lab Report")
    setDoctor("")
    setHospital("")
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDownload = async (record: HealthRecord) => {
    try {
      let url: string
      if (record.storage_provider === "local" && record.local_data) {
        url = record.local_data
      } else {
        const { data, error } = await supabase.storage.from('health-records').download(record.file_path)
        if (error) throw error
        url = URL.createObjectURL(data)
      }
      const a = document.createElement('a')
      a.href = url
      a.download = record.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      if (!(record.storage_provider === "local" && record.local_data)) {
        URL.revokeObjectURL(url)
      }
    } catch {
      toast({ title: "Download Failed", variant: "destructive" })
    }
  }

  const handleDelete = async (record: HealthRecord) => {
    if (!confirm('Delete this record?')) return
    try {
      if (record.storage_provider === "local") {
        const updated = loadLocalRecords().filter(item => item.id !== record.id)
        saveLocalRecords(updated)
        setRecords(updated)
      } else {
        const { error: storageError } = await supabase.storage.from('health-records').remove([record.file_path])
        if (storageError) throw storageError
        const { error: dbError } = await supabase.from('health_records').delete().eq('id', record.id)
        if (dbError) throw dbError
        fetchRecords()
      }
      toast({ title: "Deleted" })
    } catch {
      toast({ title: "Delete Failed", variant: "destructive" })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lab Report": return "bg-primary/10 text-primary"
      case "Imaging": return "bg-secondary/10 text-secondary"
      case "Medication": return "bg-accent/10 text-accent"
      case "Immunization": return "bg-wellness/10 text-wellness"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="space-y-4 text-center">
          <Badge variant={isSupabaseOnline ? "outline" : "secondary"} className="mx-auto">
            {isSupabaseOnline ? t.healthVault.cloudSynced : userId ? t.common.loading : t.healthVault.localMode}
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{t.healthVault.title}</h1>
            <p className="text-lg text-muted-foreground">
              Store and access lab reports, prescriptions, and important health documents in one beautiful dashboard.
            </p>
          </div>
        </div>

        <Card className="shadow-soft border border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              {t.healthVault.uploadRecord}
            </CardTitle>
            <CardDescription>
              PDF or image files up to 10MB. Add a title so you can find it later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {selectedFile ? (
                <p className="text-sm font-medium text-primary flex flex-wrap items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {selectedFile.name} • {formatFileSize(selectedFile.size)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drag & drop or browse files from your device
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Annual Blood Work" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Record Type</Label>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab Report">Lab Report</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Immunization">Immunization</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor (optional)</Label>
                <Input id="doctor" placeholder="Dr. Patel" value={doctor} onChange={e => setDoctor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital / Clinic (optional)</Label>
                <Input id="hospital" placeholder="City Medical Center" value={hospital} onChange={e => setHospital(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {isSupabaseOnline ? "Securely synced to Supabase cloud" : "Stored locally until Supabase reconnects"}
              </div>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile || !title} className="gap-2 px-6">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save Record
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border border-border/60">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {t.healthVault.myRecords}
            </CardTitle>
            <CardDescription>
              {records.length ? `${records.length} document${records.length > 1 ? "s" : ""} stored securely` : "Upload your first record to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Retrieving your records...
              </div>
            ) : records.length === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
                <p className="font-medium">No records yet</p>
                <p className="text-sm">Upload lab reports, medications, or imaging files to see them here.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {records.map(r => (
                  <Card key={r.id} className="border border-border/80">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{r.title}</CardTitle>
                          <CardDescription className="flex items-center flex-wrap gap-2">
                            <Badge className={`${getTypeColor(r.type)} capitalize`}>{r.type}</Badge>
                            {r.doctor && <span className="text-sm text-muted-foreground">Dr. {r.doctor}</span>}
                            {r.hospital && <span className="text-sm text-muted-foreground">{r.hospital}</span>}
                          </CardDescription>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-0">
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(r.file_size)} · {r.mime_type || "file"}
                        {r.storage_provider === "local" && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Local only</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(r)} className="gap-1.5">
                          <Download className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(r)} className="gap-1.5">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
