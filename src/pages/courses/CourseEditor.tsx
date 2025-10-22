// src/pages/courses/CourseEditor.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Loader2, Upload, Link as LinkIcon, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Video {
  _id: string;
  title: string;
  url: string;
  duration: string;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: "single" | "pack";
  thumbnail: string;
  price: number;
  category: string;
  instructor: string;
  level: string;
  totalDuration: string;
  videos: Video[];
}

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  // Course edit form
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    instructor: "",
    level: "beginner",
    totalDuration: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // Video form
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    url: "",
    duration: "",
    uploadType: "url", // "url" or "file"
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourse(id!);
      const courseData = response.data.data;
      setCourse(courseData);
      
      // Populate course form
      setCourseFormData({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price.toString(),
        category: courseData.category || "",
        instructor: courseData.instructor || "",
        level: courseData.level,
        totalDuration: courseData.totalDuration || "",
      });
      
      if (courseData.thumbnail) {
        setThumbnailPreview(`http://localhost:5050${courseData.thumbnail}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch course",
        variant: "destructive",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const data = new FormData();
      
      data.append("title", courseFormData.title);
      data.append("description", courseFormData.description);
      data.append("price", courseFormData.price || "0");
      data.append("category", courseFormData.category);
      data.append("instructor", courseFormData.instructor);
      data.append("level", courseFormData.level);
      data.append("totalDuration", courseFormData.totalDuration);
      
      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      await courseAPI.updateCourse(id!, data);
      
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      
      fetchCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (videoFormData.uploadType === "url" && !videoFormData.url) {
      toast({
        title: "Validation Error",
        description: "Please provide a video URL",
        variant: "destructive",
      });
      return;
    }

    if (videoFormData.uploadType === "file" && !videoFile) {
      toast({
        title: "Validation Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      
      data.append("title", videoFormData.title);
      data.append("duration", videoFormData.duration || "0:00");
      
      if (videoFormData.uploadType === "url") {
        data.append("url", videoFormData.url);
      } else {
        data.append("video", videoFile!);
      }

      await courseAPI.addVideoToPack(id!, data);
      
      toast({
        title: "Success",
        description: "Video added successfully",
      });
      
      setVideoFormData({
        title: "",
        url: "",
        duration: "",
        uploadType: "url",
      });
      setVideoFile(null);
      setIsAddVideoDialogOpen(false);
      fetchCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add video",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVideo) return;

    try {
      setIsSubmitting(true);
      await courseAPI.updateVideo(id!, editingVideo._id, {
        title: videoFormData.title,
        url: videoFormData.url,
        duration: videoFormData.duration,
      });
      
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      
      setIsEditVideoDialogOpen(false);
      setEditingVideo(null);
      fetchCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update video",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }

    try {
      await courseAPI.deleteVideo(id!, videoId);
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      fetchCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (video: Video) => {
    setEditingVideo(video);
    setVideoFormData({
      title: video.title,
      url: video.url,
      duration: video.duration,
      uploadType: "url",
    });
    setIsEditVideoDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/courses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Edit course details and manage videos</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="videos">Videos ({course.videos.length})</TabsTrigger>
        </TabsList>

        {/* Course Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Update course details and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Course Thumbnail</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                  {thumbnailPreview && (
                    <img src={thumbnailPreview} alt="Preview" className="w-48 h-32 object-cover rounded-lg mt-2" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (UZS) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseFormData.price}
                      onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                      min="0"
                      step="1"
                      required
                    />
                    {courseFormData.price && (
                      <p className="text-sm text-muted-foreground">
                        Preview: {parseInt(courseFormData.price).toLocaleString('uz-UZ')} UZS
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={courseFormData.level} onValueChange={(value) => setCourseFormData({ ...courseFormData, level: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={courseFormData.category}
                      onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={courseFormData.instructor}
                      onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalDuration">Total Duration</Label>
                  <Input
                    id="totalDuration"
                    value={courseFormData.totalDuration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, totalDuration: e.target.value })}
                    placeholder="e.g., 5 hours"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Videos</CardTitle>
                <CardDescription>
                  {course.type === "pack" 
                    ? "Manage videos in this pack" 
                    : "This is a single video course"}
                </CardDescription>
              </div>
              
              {course.type === "pack" && (
                <Dialog open={isAddVideoDialogOpen} onOpenChange={setIsAddVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Video to Pack</DialogTitle>
                      <DialogDescription>
                        Upload a video file or provide a URL
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddVideo} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="videoTitle">Video Title *</Label>
                        <Input
                          id="videoTitle"
                          value={videoFormData.title}
                          onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                          placeholder="Enter video title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Method</Label>
                        <Select value={videoFormData.uploadType} onValueChange={(value) => setVideoFormData({ ...videoFormData, uploadType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url">Video URL</SelectItem>
                            <SelectItem value="file">Upload File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {videoFormData.uploadType === "url" ? (
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl">Video URL *</Label>
                          <Input
                            id="videoUrl"
                            value={videoFormData.url}
                            onChange={(e) => setVideoFormData({ ...videoFormData, url: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                            required
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="videoFile">Video File *</Label>
                          <Input
                            id="videoFile"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="videoDuration">Duration</Label>
                        <Input
                          id="videoDuration"
                          value={videoFormData.duration}
                          onChange={(e) => setVideoFormData({ ...videoFormData, duration: e.target.value })}
                          placeholder="e.g., 45:30"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddVideoDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Video
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            
            <CardContent>
              {course.videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No videos yet. {course.type === "pack" && "Click 'Add Video' to get started."}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {course.videos
                    .sort((a, b) => a.order - b.order)
                    .map((video, index) => (
                      <div
                        key={video._id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        
                        <div className="flex-1">
                          <p className="font-semibold">{video.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {video.duration} | Order: {video.order + 1}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(video)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVideo(video._id, video.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Video Dialog */}
      <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>Update video information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateVideo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Video Title *</Label>
              <Input
                id="editTitle"
                value={videoFormData.title}
                onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editUrl">Video URL *</Label>
              <Input
                id="editUrl"
                value={videoFormData.url}
                onChange={(e) => setVideoFormData({ ...videoFormData, url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDuration">Duration</Label>
              <Input
                id="editDuration"
                value={videoFormData.duration}
                onChange={(e) => setVideoFormData({ ...videoFormData, duration: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditVideoDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

