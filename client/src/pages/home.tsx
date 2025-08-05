import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, ToggleLeft, ToggleRight, Image, Smile } from "lucide-react";
import TabBar from "@/components/TabBar";
import FriendCard from "@/components/FriendCard";
import type { User } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusInput, setStatusInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);

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

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery<User[]>({
    queryKey: ["/api/friends"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { isOnline: boolean; status?: string }) => {
      await apiRequest("PUT", "/api/user/status", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (statusInput.trim()) {
        toast({
          title: "Status Updated",
          description: "Your status has been updated successfully.",
        });
        setStatusInput("");
      }
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
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (statusInput.trim()) {
      updateStatusMutation.mutate({ isOnline, status: statusInput.trim() });
    }
  };

  const toggleOnlineStatus = () => {
    const newOnlineStatus = !isOnline;
    setIsOnline(newOnlineStatus);
    updateStatusMutation.mutate({ isOnline: newOnlineStatus });
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
  const userLevel = user?.level || 1;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="gradient-bg p-4 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white" data-testid="img-avatar">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={displayName}
              />
              <AvatarFallback className="bg-white text-[hsl(196,100%,50%)] font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-white font-semibold" data-testid="text-username">{displayName}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm opacity-90" data-testid="text-level">Level {userLevel}</span>
                <div className="flex items-center space-x-1">
                  <div className={isOnline ? "status-dot-online" : "status-dot-offline"}></div>
                  <span className="text-white text-xs" data-testid="status-online">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-white" data-testid="button-search">
              <Search className="w-6 h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={toggleOnlineStatus}
              data-testid="button-toggle-status"
            >
              {isOnline ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Update */}
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3">
            <Input
              type="text"
              placeholder="What's on your mind?"
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full bg-transparent text-white placeholder-white placeholder-opacity-70 border-none outline-none focus:ring-0"
              data-testid="input-status"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" className="text-white opacity-70" data-testid="button-image">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white opacity-70" data-testid="button-emoji">
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button 
                onClick={handleStatusUpdate}
                disabled={!statusInput.trim() || updateStatusMutation.isPending}
                className="bg-[hsl(186,100%,50%)] hover:bg-[hsl(186,100%,45%)] text-white px-4 py-1 rounded-full text-sm"
                data-testid="button-post"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Friends List */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4" data-testid="text-friends-title">Friends</h3>
        
        {friendsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500" data-testid="text-no-friends">No friends yet. Start connecting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend: User) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </div>

      <TabBar activeTab="home" />
    </div>
  );
}
