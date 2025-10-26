// src/pages/courses/CourseManager.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseAPI, companyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Video, PackageOpen, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

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
  videos: any[];
  studentsEnrolled: number;
  isActive: boolean;
  accessDuration?: number; // Duration in months (6, 9, or 12)
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "single",
    price: "",
    category: "",
    instructor: "",
    level: "beginner",
    totalDuration: "",
    accessDuration: "12", // Default to 12 months
    ownerType: "platform", // "platform" or "company"
    companyId: "",
    videoUrl: "",
    videoTitle: "",
    videoDuration: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const { user } = useAdminAuth();

  useEffect(() => {
    fetchCourses();
    if (user?.adminRole === 'main') {
      fetchCompanies();
    }
  }, [filterType]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = filterType !== "all" ? { type: filterType } : {};
      const response = await courseAPI.getAllCourses(params);
      setCourses(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getCompanies();
      setCompanies(response.data);
    } catch (error: any) {
      console.error("Failed to fetch companies:", error);
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !thumbnailFile) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // For single video type, require either URL or file
    if (formData.type === "single" && !formData.videoUrl && !formData.videoFile) {
      toast({
        title: "Validation Error",
        description: "Video URL or video file is required for single video courses",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("price", formData.price || "0");
      data.append("category", formData.category || "");
      data.append("instructor", formData.instructor || "");
      data.append("level", formData.level);
      data.append("totalDuration", formData.totalDuration || "0 hours");
      data.append("accessDuration", formData.accessDuration);
      data.append("ownerType", formData.ownerType);
      if (formData.ownerType === "company" && formData.companyId) {
        data.append("companyId", formData.companyId);
      }
      data.append("thumbnail", thumbnailFile);

      if (formData.type === "single") {
        if (videoFile) {
          // It's a file upload
          data.append("video", videoFile);
        } else {
          // It's a URL
          data.append("videoUrl", formData.videoUrl);
        }
        data.append("videoTitle", formData.videoTitle || formData.title);
        data.append("videoDuration", formData.videoDuration || "0:00");
      }

      const response = await courseAPI.createCourse(data);
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "single",
        price: "",
        category: "",
        instructor: "",
        level: "beginner",
        totalDuration: "",
        accessDuration: "12",
        ownerType: "platform",
        companyId: "",
        videoUrl: "",
        videoTitle: "",
        videoDuration: "",
      });
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoFile(null);
      setIsCreateDialogOpen(false);
      
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This will also remove the course from all users who have purchased it.`)) {
      return;
    }

    try {
      const response = await courseAPI.deleteCourse(courseId);
      const { data } = response.data;

      toast({
        title: "Course Deleted Successfully",
        description: `Course "${data.courseTitle}" has been deleted and removed from ${data.usersAffected} users.`,
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Create and manage your video courses</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to your platform. For single video courses, provide the video URL. For packs, you'll add videos after creation.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {/* Course Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Course Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Video</SelectItem>
                    <SelectItem value="pack">Video Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Owner Type - Only for main admin */}
              {user?.adminRole === 'main' && (
                <div className="space-y-2">
                  <Label htmlFor="ownerType">Owner Type *</Label>
                  <Select value={formData.ownerType} onValueChange={(value) => setFormData({ ...formData, ownerType: value, companyId: value === 'platform' ? '' : formData.companyId })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formData.ownerType === 'platform'
                      ? 'Course owned by the platform (100% revenue)'
                      : 'Course owned by a company (50/50 revenue split)'}
                  </p>
                </div>
              )}

              {/* Company Selection - Only show if owner type is company and user is main admin */}
              {user?.adminRole === 'main' && formData.ownerType === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company *</Label>
                  <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                  required
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course Thumbnail *</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required
                />
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mt-2" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (UZS) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1250000"
                    min="0"
                    step="1"
                    required
                  />
                  {formData.price && (
                    <p className="text-sm text-muted-foreground">
                      Preview: {parseInt(formData.price).toLocaleString('uz-UZ')} UZS
                    </p>
                  )}
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Design, Development"
                  />
                </div>

                {/* Instructor */}
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Instructor name"
                  />
                </div>
              </div>

              {/* Total Duration */}
              <div className="space-y-2">
                <Label htmlFor="totalDuration">Total Duration</Label>
                <Input
                  id="totalDuration"
                  value={formData.totalDuration}
                  onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                  placeholder="e.g., 5 hours"
                />
              </div>

              {/* Access Duration */}
              <div className="space-y-2">
                <Label htmlFor="accessDuration">Access Duration *</Label>
                <Select value={formData.accessDuration} onValueChange={(value) => setFormData({ ...formData, accessDuration: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="9">9 Months</SelectItem>
                    <SelectItem value="12">1 Year (12 Months)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Students will have access to this course for the selected duration after purchase or assignment.
                </p>
              </div>

              {/* Single Video Fields */}
              {formData.type === "single" && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Video Details</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload Method *</Label>
                        <Select value={formData.videoUrl ? "url" : "file"} onValueChange={(value) => {
                          if (value === "file") {
                            setFormData({ ...formData, videoUrl: "" });
                          } else {
                            setFormData({ ...formData, videoUrl: "" });
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select upload method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url">Video URL</SelectItem>
                            <SelectItem value="file">Upload File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.videoUrl || (!formData.videoUrl && !formData.videoFile) ? (
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl">Video URL *</Label>
                          <Input
                            id="videoUrl"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
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
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Set a temporary URL-like string for validation
                                setFormData({ ...formData, videoUrl: `file:${file.name}` });
                              }
                            }}
                            required
                          />
                          <p className="text-sm text-muted-foreground">
                            Supported formats: MP4, MOV, AVI, WebM (max 500MB)
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="videoTitle">Video Title</Label>
                        <Input
                          id="videoTitle"
                          value={formData.videoTitle}
                          onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                          placeholder="Leave empty to use course title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoDuration">Video Duration</Label>
                        <Input
                          id="videoDuration"
                          value={formData.videoDuration}
                          onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                          placeholder="e.g., 45:30"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="single">Single Videos</SelectItem>
            <SelectItem value="pack">Video Packs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                {course.thumbnail ? (
                  <img
                    src={`http://localhost:5050${course.thumbnail}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={course.type === "single" ? "default" : "secondary"}>
                    {course.type === "single" ? "Single" : "Pack"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">{course.price.toLocaleString('uz-UZ')} UZS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Videos:</span>
                    <span className="font-semibold">{course.videos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-semibold">{course.studentsEnrolled}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCourse(course._id, course.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

