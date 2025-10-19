// src/components/userspage/AssignCourseModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, GraduationCap } from "lucide-react";
import { userAPI } from "@/lib/api";

interface Course {
  _id: string;
  title: string;
  slug: string;
  type: "single" | "pack";
  price: number;
  thumbnail: string;
}

interface AssignCourseModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (courseId: string) => void;
  userName: string;
  isSubmitting?: boolean;
}

export function AssignCourseModal({ open, onClose, onAssign, userName, isSubmitting = false }: AssignCourseModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (open) {
      fetchCourses();
    } else {
      setSelectedCourse(null);
      setSearchTerm("");
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAvailableCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedCourse) {
      onAssign(selectedCourse._id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Course to {userName}</DialogTitle>
          <DialogDescription>
            Select a course to grant access to this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Course List */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mb-4" />
              <p>No courses found</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => setSelectedCourse(course)}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCourse?._id === course._id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent border-transparent"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={`http://localhost:5050${course.thumbnail}`}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.slug}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={course.type === "single" ? "default" : "secondary"}>
                            {course.type === "single" ? "Single" : "Pack"}
                          </Badge>
                          <span className="text-sm font-semibold">${course.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedCourse || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

