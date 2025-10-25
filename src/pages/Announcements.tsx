// /src/pages/Announcements.tsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../lib/api"; // ✅ Correct import for Admin Panel

const recipientOptions = [
  { value: "premium", label: "Premium Users" },
  { value: "free", label: "Free Users" },
  { value: "all", label: "All Registered Users" },
  { value: "guests", label: "Not Logged-in Users" },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    expiryDate: "",
    recipients: [] as string[],
  });

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements"); // Admin Panel API
      if (res.data?.data) setAnnouncements(res.data.data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Toggle announcement status
  const toggleStatus = async (id: string) => {
    try {
      const res = await api.patch(`/announcements/toggle/${id}`);
      if (res.data?.data) {
        setAnnouncements(prev =>
          prev.map(a => (a._id === id ? res.data.data : a))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  // Create new announcement
  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content || newAnnouncement.recipients.length === 0) {
      alert("Please fill title, content, and select at least one recipient.");
      return;
    }

    try {
      const res = await api.post("/announcements", newAnnouncement);
      if (res.data?.data) {
        setAnnouncements([res.data.data, ...announcements]);
        setNewAnnouncement({ title: "", content: "", expiryDate: "", recipients: [] });
        setIsCreateOpen(false);
      }
    } catch (err) {
      console.error("Failed to create announcement:", err);
      alert("Failed to create announcement");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">
            Manage platform announcements and notifications for users.
          </p>
        </div>

        {/* Create Announcement Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={newAnnouncement.expiryDate}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {recipientOptions.map(option => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={newAnnouncement.recipients.includes(option.value) ? "default" : "outline"}
                      onClick={() => {
                        setNewAnnouncement(prev => ({
                          ...prev,
                          recipients: prev.recipients.includes(option.value)
                            ? prev.recipients.filter(r => r !== option.value)
                            : [...prev.recipients, option.value],
                        }));
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={createAnnouncement} className="bg-gradient-primary">Create Announcement</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(a => (
          <Card key={a._id} className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{a.title}</h3>
                    <Badge variant={a.status === "active" ? "default" : "secondary"}>
                      {a.status === "active"
                        ? <><Eye className="w-3 h-3 mr-1" /> Active</>
                        : <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-2">{a.content}</p>

                  {a.recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {a.recipients.map(r => {
                        const label = recipientOptions.find(o => o.value === r)?.label || r;
                        return <Badge key={r}>{label}</Badge>;
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {new Date(a.createdDate).toLocaleDateString()}
                    </div>
                    {a.expiryDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {new Date(a.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(a._id)}>
                    {a.status === "active"
                      ? <><EyeOff className="w-4 h-4 mr-1" /> Deactivate</>
                      : <><Eye className="w-4 h-4 mr-1" /> Activate</>}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAnnouncement(a._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {announcements.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first announcement to notify users about important updates.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Announcement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
