import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock announcements data
const mockAnnouncements = [
  {
    id: 1,
    title: "New Premium Content Available",
    content: "We've added 50+ new architectural design videos to our premium collection. Upgrade now to access exclusive content from industry experts.",
    status: "active",
    createdDate: "2024-03-15",
    expiryDate: "2024-04-15"
  },
  {
    id: 2,
    title: "Maintenance Schedule",
    content: "Our platform will undergo scheduled maintenance on March 20th from 2:00 AM to 4:00 AM UTC. Thank you for your patience.",
    status: "active",
    createdDate: "2024-03-10",
    expiryDate: "2024-03-21"
  },
  {
    id: 3,
    title: "Welcome to VideoAdmin!",
    content: "Welcome to our premium architecture video platform. Explore our extensive library of tutorials, case studies, and expert insights.",
    status: "inactive",
    createdDate: "2024-02-01",
    expiryDate: "2024-03-01"
  }
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    expiryDate: ""
  });

  const toggleStatus = (id: number) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === id 
        ? { ...announcement, status: announcement.status === "active" ? "inactive" : "active" }
        : announcement
    ));
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  const createAnnouncement = () => {
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      status: "active" as const,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: "", content: "", expiryDate: "" });
    setIsCreateOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Manage platform announcements and notifications for users.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
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
                  onChange={(e) => setNewAnnouncement(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={newAnnouncement.expiryDate}
                  onChange={(e) => setNewAnnouncement(prev => ({
                    ...prev,
                    expiryDate: e.target.value
                  }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAnnouncement} className="bg-gradient-primary">
                  Create Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{announcement.title}</h3>
                    <Badge variant={announcement.status === "active" ? "default" : "secondary"}>
                      {announcement.status === "active" ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {new Date(announcement.createdDate).toLocaleDateString()}
                    </div>
                    {announcement.expiryDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(announcement.id)}
                  >
                    {announcement.status === "active" ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
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
            <p className="text-muted-foreground mb-4">Create your first announcement to notify users about important updates.</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}