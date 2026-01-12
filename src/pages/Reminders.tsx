import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Plus, 
  Clock, 
  Calendar, 
  Pill,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  AlertCircle,
  Activity,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: "medication" | "appointment" | "exercise" | "checkup" | "other";
  time: string;
  frequency: string;
  isActive: boolean;
  nextDue: Date;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    type: "medication" as const,
    time: "",
    frequency: "daily"
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('next_due', { ascending: true });

      if (error) throw error;

      setReminders(data.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
        type: r.type as "medication" | "appointment" | "exercise" | "checkup" | "other",
        time: r.time,
        frequency: r.frequency,
        nextDue: new Date(r.next_due),
        isActive: r.is_active
      })));
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    try {
      const [hours, minutes] = newReminder.time.split(':').map(Number);
      const nextDue = new Date();
      nextDue.setHours(hours, minutes, 0, 0);
      
      if (nextDue < new Date()) {
        nextDue.setDate(nextDue.getDate() + 1);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create reminders",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: newReminder.title,
          description: newReminder.description,
          type: newReminder.type,
          time: newReminder.time,
          frequency: newReminder.frequency,
          next_due: nextDue.toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder created successfully"
      });

      setNewReminder({
        title: "",
        description: "",
        type: "medication",
        time: "",
        frequency: "daily"
      });
      setShowForm(false);
      fetchReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive"
      });
    }
  };

  const toggleReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !reminder.isActive })
        .eq('id', id);

      if (error) throw error;

      setReminders(reminders.map(r => 
        r.id === id ? { ...r, isActive: !r.isActive } : r
      ));

      toast({
        title: "Success",
        description: `Reminder ${!reminder.isActive ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive"
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReminders(reminders.filter(r => r.id !== id));

      toast({
        title: "Success",
        description: "Reminder deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication": return <Pill className="w-4 h-4" />;
      case "appointment": return <Calendar className="w-4 h-4" />;
      case "exercise": return <Activity className="w-4 h-4" />;
      case "checkup": return <Heart className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medication": return "bg-primary/10 text-primary";
      case "appointment": return "bg-secondary/10 text-secondary";
      case "exercise": return "bg-accent/10 text-accent";
      case "checkup": return "bg-wellness/10 text-wellness";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const upcomingToday = activeReminders.filter(r => 
    r.nextDue.toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-accent rounded-xl">
              <Bell className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medication Reminders</h1>
              <p className="text-muted-foreground">Never miss your medications and appointments</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Reminders</p>
                <p className="text-2xl font-bold text-accent">{activeReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold text-primary">{upcomingToday.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-wellness/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-wellness" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reminders</p>
                <p className="text-2xl font-bold text-wellness">{reminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Add New Reminder</CardTitle>
            <CardDescription>
              Set up a new medication or health reminder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Reminder Title</Label>
                <Input
                  id="title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  placeholder="e.g., Take Morning Medication"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value as any})}
                >
                  <option value="medication">Medication</option>
                  <option value="appointment">Appointment</option>
                  <option value="exercise">Exercise</option>
                  <option value="checkup">Checkup</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReminder.description}
                onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                placeholder="Additional details about this reminder..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="once">One-time</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddReminder} className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
          <CardDescription>
            Manage your medication and health reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reminders yet. Create your first reminder!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                    reminder.isActive 
                      ? "bg-background hover:shadow-soft" 
                      : "bg-muted/50 opacity-60"
                  }`}
                >
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="flex-shrink-0"
                  >
                    {reminder.isActive ? (
                      <CheckCircle className="w-6 h-6 text-accent" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{reminder.title}</h3>
                      <Badge variant="secondary" className={getTypeColor(reminder.type)}>
                        <span className="mr-1">{getTypeIcon(reminder.type)}</span>
                        {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {reminder.frequency}
                      </Badge>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {reminder.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Next: {reminder.nextDue.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}