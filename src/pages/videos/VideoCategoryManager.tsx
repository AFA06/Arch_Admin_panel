import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { toast } from "sonner";
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
} from "@/components/ui";
import { Upload, Trash2 } from "lucide-react";

interface Category {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
}

export default function VideoCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/video-categories");

      setCategories(data.categories);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
  try {
    const data = new FormData();
    data.append("title", formData.title); // ✅ correct key
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("image", formData.thumbnail[0]);

    await api.post("/video-categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Category created!");
    reset();
    setImagePreview(null);
    setDialogOpen(false);
    fetchCategories();
  } catch (error) {
    toast.error("Error creating category");
  }
};
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/video-categories/${id}`);
      toast.success("Category deleted!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold">Video Categories</h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" /> Create
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>Add a new video course category</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input {...register("title", { required: true })} placeholder="Category Title" />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea {...register("description", { required: true })} placeholder="Category Description" />
              </div>

              <div className="space-y-1">
                <Label>Price (UZS)</Label>
                <Input type="number" {...register("price", { required: true })} placeholder="Price" />
              </div>

              <div className="space-y-1">
                <Label>Thumbnail</Label>
                <Input
                  type="file"
                  accept="image/*"
                  {...register("thumbnail", { required: true })}
                  onChange={handleImagePreview}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="rounded-md max-h-48 object-contain mt-2" />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[70vh]">
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat._id}>
                <CardContent className="p-4">
                  <img src={cat.thumbnailUrl} alt={cat.title} className="w-full h-40 object-cover rounded-md mb-3" />
                  <h3 className="text-lg font-semibold">{cat.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{cat.description}</p>
                  <p className="text-green-600 font-medium mb-2">{cat.price.toLocaleString()} UZS</p>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat._id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
