import { useState } from "react";
import { Search, Plus, MoreHorizontal, Play, Lock, Globe, Trash2, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock video data
const mockVideos = [
  { 
    id: 1, 
    title: "Advanced React Patterns", 
    description: "Learn advanced React patterns and techniques",
    duration: "45:30", 
    accessLevel: "premium", 
    uploadDate: "2024-03-15",
    views: 1250,
    thumbnail: "/api/placeholder/300/180"
  },
  { 
    id: 2, 
    title: "JavaScript Fundamentals", 
    description: "Master the basics of JavaScript programming",
    duration: "32:15", 
    accessLevel: "free", 
    uploadDate: "2024-03-10",
    views: 3420,
    thumbnail: "/api/placeholder/300/180"
  },
  { 
    id: 3, 
    title: "Node.js Backend Development", 
    description: "Build scalable backend applications with Node.js",
    duration: "1:15:45", 
    accessLevel: "premium", 
    uploadDate: "2024-03-05",
    views: 890,
    thumbnail: "/api/placeholder/300/180"
  },
  { 
    id: 4, 
    title: "CSS Grid and Flexbox", 
    description: "Modern CSS layout techniques explained",
    duration: "28:20", 
    accessLevel: "free", 
    uploadDate: "2024-02-28",
    views: 2100,
    thumbnail: "/api/placeholder/300/180"
  },
];

export default function Videos() {
  const [videos, setVideos] = useState(mockVideos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteVideo = (videoId: number) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Management</h1>
          <p className="text-muted-foreground">Upload and manage your video content library.</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Drop your video file here</p>
                <p className="text-muted-foreground">or click to browse</p>
                <Button variant="outline" className="mt-4">Choose File</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input id="title" placeholder="Enter video title" />
                </div>
                <div>
                  <Label htmlFor="access">Access Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter video description" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button className="bg-gradient-primary">Upload Video</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">All Videos</Button>
            <Button variant="outline">Premium Only</Button>
            <Button variant="outline">Free Videos</Button>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="bg-card/50 backdrop-blur-sm border-border hover:shadow-glow transition-all duration-300">
            <CardContent className="p-0">
              {/* Video Thumbnail */}
              <div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted">
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={video.accessLevel === "premium" ? "default" : "secondary"}>
                    {video.accessLevel === "premium" ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Free
                      </>
                    )}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Button size="sm" variant="outline">
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteVideo(video.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Video
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}