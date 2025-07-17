import { useState } from "react";
import { Search, Star, Trash2, Flag, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    user: "John Doe",
    video: "Advanced React Patterns",
    rating: 5,
    comment: "Amazing video quality! Love the premium content. This tutorial helped me understand React patterns in depth.",
    date: "2024-03-15",
    status: "visible",
    isSpam: false
  },
  {
    id: 2,
    user: "Sarah Smith",
    video: "JavaScript Fundamentals",
    rating: 4,
    comment: "Great platform, easy to use and navigate. The explanations are clear and concise.",
    date: "2024-03-14",
    status: "visible",
    isSpam: false
  },
  {
    id: 3,
    user: "Mike Johnson",
    video: "Node.js Backend Development",
    rating: 5,
    comment: "Worth every penny for the premium subscription. The backend concepts are explained perfectly.",
    date: "2024-03-13",
    status: "visible",
    isSpam: false
  },
  {
    id: 4,
    user: "Spam User",
    video: "CSS Grid and Flexbox",
    rating: 1,
    comment: "Check out my amazing website at spam-link.com for better content!!!",
    date: "2024-03-12",
    status: "hidden",
    isSpam: true
  },
  {
    id: 5,
    user: "Emma Wilson",
    video: "Advanced React Patterns",
    rating: 4,
    comment: "Excellent content library and video streaming quality. Would recommend to other developers.",
    date: "2024-03-11",
    status: "visible",
    isSpam: false
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.video.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "spam") return review.isSpam && matchesSearch;
    if (filter === "hidden") return review.status === "hidden" && matchesSearch;
    if (filter === "visible") return review.status === "visible" && matchesSearch;
    return matchesSearch;
  });

  const toggleVisibility = (reviewId: number) => {
    setReviews(reviews.map(review =>
      review.id === reviewId 
        ? { ...review, status: review.status === "visible" ? "hidden" : "visible" }
        : review
    ));
  };

  const markAsSpam = (reviewId: number) => {
    setReviews(reviews.map(review =>
      review.id === reviewId 
        ? { ...review, isSpam: !review.isSpam, status: review.isSpam ? "visible" : "hidden" }
        : review
    ));
  };

  const deleteReview = (reviewId: number) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Review Management</h1>
        <p className="text-muted-foreground">Monitor and manage user reviews and feedback.</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by user, video, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Reviews
            </Button>
            <Button 
              variant={filter === "visible" ? "default" : "outline"}
              onClick={() => setFilter("visible")}
            >
              Visible
            </Button>
            <Button 
              variant={filter === "hidden" ? "default" : "outline"}
              onClick={() => setFilter("hidden")}
            >
              Hidden
            </Button>
            <Button 
              variant={filter === "spam" ? "default" : "outline"}
              onClick={() => setFilter("spam")}
            >
              Spam
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className={`bg-card/50 backdrop-blur-sm border-border ${
            review.isSpam ? "border-destructive/50" : ""
          }`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {review.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{review.user}</h3>
                      <div className="flex">
                        {getRatingStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reviewed: <span className="font-medium">{review.video}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={review.status === "visible" ? "default" : "secondary"}>
                    {review.status === "visible" ? "Visible" : "Hidden"}
                  </Badge>
                  {review.isSpam && (
                    <Badge variant="destructive">Spam</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">{review.comment}</p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleVisibility(review.id)}
                >
                  {review.status === "visible" ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsSpam(review.id)}
                  className={review.isSpam ? "text-success" : "text-warning"}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {review.isSpam ? "Unmark Spam" : "Mark as Spam"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteReview(review.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No reviews found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}