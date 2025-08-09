import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
}

export default function CategoryVideos() {
  const { slug } = useParams<{ slug: string }>();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get(`/videos/category/${slug}`)
      .then((res) => {
        setVideos(res.data);
        // Optionally auto-select the first video on load
        if (res.data.length > 0) setSelectedVideo(res.data[0]);
      })
      .catch((err) => {
        setError("Failed to load videos.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="ml-2">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!videos.length) {
    return <p>No videos found for this category.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Videos in "{slug}" category</h2>

      {/* Video player for selected video */}
      {selectedVideo && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{selectedVideo.title}</h3>
          <video
            src={selectedVideo.videoUrl}
            controls
            className="w-full max-h-[480px] rounded-md bg-black"
          >
            Sorry, your browser does not support embedded videos.
          </video>
          <p className="mt-2 text-gray-700">{selectedVideo.description}</p>
        </div>
      )}

      {/* Video list grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card
            key={video._id}
            className={`cursor-pointer hover:shadow-md transition ${
              selectedVideo?._id === video._id ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setSelectedVideo(video)}
          >
            <CardContent>
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md mb-3">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-600">{video.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
