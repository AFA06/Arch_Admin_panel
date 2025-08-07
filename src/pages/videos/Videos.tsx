// AdminPanel/src/pages/Videos.tsx

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Eye, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  ScrollArea,
  Textarea,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  Checkbox,
} from "@/components/ui";
import { api } from "@/lib/api";

interface Video {
  _id: string;
  title: string;
  description: string;
  access: string;
  videoUrl: string;
  duration?: string;
  thumbnail?: string;
  isPreview?: boolean;
  instructor?: string;
  price?: number;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function Videos() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState("free");
  const [duration, setDuration] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const res = await api.get("/videos");
      return res.data.videos;
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.categories;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("access", access);
      formData.append("duration", duration);
      formData.append("thumbnail", thumbnail);
      formData.append("instructor", instructor);
      formData.append("isPreview", String(isPreview));
      formData.append("price", price);
      formData.append("categoryId", categoryId);

      const res = await api.post("/admin/videos/upload", formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setAccess("free");
    setDuration("");
    setThumbnail("");
    setInstructor("");
    setIsPreview(false);
    setPrice("");
    setCategoryId("");
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold">Videos</h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Upload Video</DialogTitle>
                <DialogDescription>
                  Add your video and details.
                </DialogDescription>
              </DialogHeader>

              <div
                onClick={() => document.getElementById("fileInput")?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center cursor-pointer rounded"
              >
                {file ? (
                  <p className="text-sm text-green-600">{file.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Drop your video file here or click to browse
                  </p>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label>Video Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />

                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />

                <Label>Access</Label>
                <Select value={access} onValueChange={setAccess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Duration</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 10:45" />

                <Label>Instructor</Label>
                <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />

                <Label>Thumbnail URL</Label>
                <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />

                <Label>Price (UZS)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

                <div className="flex items-center gap-2 mt-2">
                  <Checkbox id="isPreview" checked={isPreview} onCheckedChange={() => setIsPreview(!isPreview)} />
                  <Label htmlFor="isPreview">Mark as Preview Video</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button
                  disabled={!file || !title || !categoryId}
                  onClick={() => uploadMutation.mutate()}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Video"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video._id}>
              <CardContent className="p-4 space-y-2">
                <video src={video.videoUrl} controls className="w-full h-40 object-cover rounded" />
                <h3 className="font-semibold">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.description}</p>
                <div className="flex justify-between mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(video.videoUrl, "_blank")}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Preview
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(video._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
