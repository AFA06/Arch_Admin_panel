import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface Category {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
}

export default function Videos() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [fadeOutIds, setFadeOutIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/video-categories");
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!title || !file || !categoryId) {
      toast.error("Please fill all fields");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      formData.append("categoryId", categoryId);

      await api.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Video uploaded successfully");
      setUploadOpen(false);
      setTitle("");
      setFile(null);
      setCategoryId("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    setFadeOutIds((prev) => [...prev, categoryId]); // trigger fade out
    setDeleting(true);
    try {
      await new Promise((res) => setTimeout(res, 300)); // wait for fade-out animation
      await api.delete(`/video-categories/${categoryId}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
      toast.success("Category deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
      setFadeOutIds((prev) => prev.filter((id) => id !== categoryId)); // revert if failed
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header with upload button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Available Video Courses</h2>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a New Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Video Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label>Video File</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label>Select Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories grid */}
      <ScrollArea className="h-[75vh]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            <span className="ml-2">Loading categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat._id}
                className={clsx(
                  "transition-all duration-300",
                  fadeOutIds.includes(cat._id) && "opacity-0 translate-y-3"
                )}
              >
                <Link to={`/videos/${cat.slug}`}>
                  <CardContent className="p-4">
                    {cat.thumbnailUrl ? (
                      <img
                        src={cat.thumbnailUrl}
                        alt={cat.title}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md mb-3">
                        No Image
                      </div>
                    )}
                    <h3 className="text-lg font-semibold">{cat.title}</h3>
                    <p className="text-sm text-gray-600">{cat.description}</p>
                  </CardContent>
                </Link>
                <div className="px-4 pb-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteCategory(cat._id)}
                    disabled={deleting && fadeOutIds.includes(cat._id)}
                  >
                    {deleting && fadeOutIds.includes(cat._id) ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
