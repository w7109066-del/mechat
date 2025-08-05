import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  X,
  Send,
  Play,
  Pause
} from "lucide-react";
import TabBar from "@/components/TabBar";
import { formatDistanceToNow } from "date-fns";
import type { Post, User } from "@shared/schema";

export default function Feed() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<
    (Post & { 
      user: User; 
      likesCount: number; 
      commentsCount: number; 
      sharesCount: number; 
      isLiked: boolean 
    })[]
  >({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content?: string; mediaUrl?: string; mediaType?: string; videoDuration?: number }) => {
      return await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCreatePostOpen(false);
      setPostContent("");
      setMediaFile(null);
      setMediaPreview("");
      toast({
        title: "Post Created",
        description: "Your post has been shared successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("DELETE", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    },
  });

  // Share post mutation
  const sharePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("POST", `/api/posts/${postId}/share`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post Shared",
        description: "Post has been shared to your timeline!",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast({
        title: "Invalid File",
        description: "Please select an image or video file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMediaPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !mediaFile) return;

    let mediaUrl = "";
    let mediaType = "";
    let videoDuration: number | undefined;

    if (mediaFile) {
      // In a real app, you would upload the file to a storage service
      // For demo purposes, we'll use the preview URL
      mediaUrl = mediaPreview;
      mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
      
      if (mediaType === 'video') {
        // Get video duration
        const video = document.createElement('video');
        video.src = mediaPreview;
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            videoDuration = Math.floor(video.duration);
            if (videoDuration > 16) {
              toast({
                title: "Video Too Long",
                description: "Video duration must be 16 seconds or less.",
                variant: "destructive",
              });
              return;
            }
            resolve(null);
          };
        });
        
        if (videoDuration && videoDuration > 16) return;
      }
    }

    createPostMutation.mutate({
      content: postContent.trim() || undefined,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      videoDuration,
    });
  };

  const handleLikeToggle = (postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };

  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    addCommentMutation.mutate({ postId, content });
  };

  const toggleVideoPlay = (postId: string) => {
    const video = videoRefs.current[postId];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(196,100%,50%)]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user?.username || user?.firstName || user?.email || "User";

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      {/* Header */}
      <div className="gradient-bg p-4 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold" data-testid="text-feed-title">Feed</h1>
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-create-post">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  data-testid="textarea-post-content"
                />
                
                {mediaPreview && (
                  <div className="relative">
                    {mediaFile?.type.startsWith('image/') ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-8 h-8"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaPreview("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-add-image"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-add-video"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video (16s max)
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreatePostOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || (!postContent.trim() && !mediaFile)}
                    className="flex-1 bg-[hsl(196,100%,50%)] hover:bg-[hsl(196,100%,45%)]"
                    data-testid="button-publish-post"
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="p-4 space-y-6">
        {postsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share something amazing!</p>
            <Button
              onClick={() => setCreatePostOpen(true)}
              className="bg-[hsl(196,100%,50%)] hover:bg-[hsl(196,100%,45%)]"
              data-testid="button-create-first-post"
            >
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={post.user.profileImageUrl || undefined} 
                      alt={post.user.username || post.user.firstName || "User"}
                    />
                    <AvatarFallback className="bg-[hsl(196,100%,50%)] text-white font-semibold">
                      {(post.user.username || post.user.firstName || post.user.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900" data-testid={`text-author-${post.id}`}>
                      {post.user.username || post.user.firstName || post.user.email}
                    </h4>
                    <p className="text-sm text-gray-500" data-testid={`text-time-${post.id}`}>
                      {formatDistanceToNow(new Date(post.createdAt || Date.now()), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="text-gray-800 mb-4 leading-relaxed" data-testid={`text-content-${post.id}`}>
                    {post.content}
                  </p>
                )}

                {/* Post Media */}
                {post.mediaUrl && (
                  <div className="mb-4">
                    {post.mediaType === 'image' ? (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post content" 
                        className="w-full rounded-lg object-cover max-h-96"
                        data-testid={`img-media-${post.id}`}
                      />
                    ) : post.mediaType === 'video' ? (
                      <div className="relative">
                        <video 
                          ref={(el) => {
                            if (el) videoRefs.current[post.id] = el;
                          }}
                          src={post.mediaUrl} 
                          className="w-full rounded-lg object-cover max-h-96"
                          loop
                          muted
                          data-testid={`video-media-${post.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute inset-0 m-auto w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full"
                          onClick={() => toggleVideoPlay(post.id)}
                          data-testid={`button-play-video-${post.id}`}
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                        {post.videoDuration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {post.videoDuration}s
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeToggle(post.id, post.isLiked)}
                      className={`p-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                      data-testid={`button-like-${post.id}`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likesCount}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-500 hover:text-blue-500"
                      data-testid={`button-comment-${post.id}`}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <span>{post.commentsCount}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sharePostMutation.mutate(post.id)}
                      className="p-2 text-gray-500 hover:text-green-500"
                      data-testid={`button-share-${post.id}`}
                    >
                      <Share className="w-5 h-5 mr-2" />
                      <span>{post.sharesCount}</span>
                    </Button>
                  </div>
                </div>

                {/* Comment Input */}
                <div className="flex items-center space-x-3 mt-4 pt-3 border-t">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={user?.profileImageUrl || undefined} 
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-[hsl(196,100%,50%)] text-white text-sm font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1"
                      data-testid={`input-comment-${post.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim() || addCommentMutation.isPending}
                      className="bg-[hsl(196,100%,50%)] hover:bg-[hsl(196,100%,45%)]"
                      data-testid={`button-send-comment-${post.id}`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TabBar activeTab="feed" />
    </div>
  );
}