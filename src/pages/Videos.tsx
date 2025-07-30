import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Upload, Eye, Trash2, Search } from "lucide-react";
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
} from "@/components/ui";

interface Video {
  _id: string;
  title: string;
  description: string;
  access: string;
  videoUrl: string;
}

export default function Videos() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState("free");
  const [search, setSearch] = useState("");

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const res = await axios.get("/api/videos");
      return res.data.videos;
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
      const res = await axios.post("/api/admin/videos/upload", formData);
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
      await axios.delete(`/api/videos/${id}`);
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
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      deleteMutation.mutate(id);
    }
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Video</DialogTitle>
                <DialogDescription>
                  Drop your video file here or click to browse.
                </DialogDescription>
              </DialogHeader>

              <div
                onClick={() =>
                  document.getElementById("fileInput")?.click()
                }
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
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label>Video Title</Label>
                <Input
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Label>Description</Label>
                <Textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Label>Access Level</Label>
                <Select value={access} onValueChange={setAccess}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!file || !title}
                  onClick={() => uploadMutation.mutate()}
                >
                  Upload Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-[70vh]">
        {isLoading ? (
          <p>Loading videos...</p>
        ) : filteredVideos.length === 0 ? (
          <p>No videos found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <Card
                key={video._id}
                className="bg-white dark:bg-gray-900 shadow"
              >
                <CardContent className="p-4">
                  <p className="font-semibold">{video.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {video.description}
                  </p>
                  <p className="text-xs text-blue-500 mt-1 capitalize">
                    Access: {video.access}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{video.title}</DialogTitle>
                          <DialogDescription>
                            {video.description}
                          </DialogDescription>
                        </DialogHeader>
                        <video controls className="w-full rounded mt-4">
                          <source src={video.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(video._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
