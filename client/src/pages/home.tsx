
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import TabBar from "@/components/TabBar";
import FriendCard from "@/components/FriendCard";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Users, 
  Hash, 
  Settings, 
  UserPlus,
  Home as HomeIcon,
  Rss,
  Search,
  Image,
  Smile
} from "lucide-react";

interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  isOnline: boolean;
  status?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  category: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [postContent, setPostContent] = useState("");

  // Fetch friends
  const { data: friends = [] } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
    enabled: !!user,
  });

  // Fetch chat rooms
  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ["/api/rooms"],
    enabled: !!user,
  });

  const onlineFriends = friends.filter(friend => friend.isOnline);
  const offlineFriends = friends.filter(friend => !friend.isOnline);

  const handleChatWithFriend = (friendId: string) => {
    navigate(`/chat/${friendId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  const userDisplayName = user.username || user.firstName || "User";
  const userLevel = "Level 1"; // You can implement a level system later

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-4 border-white/20">
              <AvatarImage 
                src={user.profileImageUrl || undefined} 
                alt={userDisplayName}
              />
              <AvatarFallback className="bg-white text-blue-600 font-bold text-xl">
                {userDisplayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-white text-2xl font-bold">{userDisplayName}</h1>
              <p className="text-white/80 text-sm">{userLevel}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-white/90 text-sm">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Post Input */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Input
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
              <Button 
                size="icon"
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Image className="w-4 h-4 text-white" />
              </Button>
              <Button 
                size="icon"
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <Smile className="w-4 h-4 text-white" />
              </Button>
            </div>
            {postContent && (
              <Button 
                className="mt-3 bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold px-6"
                onClick={() => {
                  // Handle post submission
                  setPostContent("");
                }}
              >
                Post
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Friends Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Friends</h2>
          <Button variant="ghost" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">No friends yet. Start connecting!</h3>
            <p className="text-gray-500 mb-6">Join rooms and start conversations to meet new people</p>
            <Button onClick={() => navigate("/rooms")}>
              <Hash className="w-4 h-4 mr-2" />
              Explore Rooms
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Online Friends */}
            {onlineFriends.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-600">Online ({onlineFriends.length})</span>
                </div>
                <div className="space-y-2">
                  {onlineFriends.map((friend) => (
                    <div 
                      key={friend.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleChatWithFriend(friend.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={friend.profileImageUrl || undefined} 
                              alt={friend.username || friend.firstName || "Friend"}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {(friend.username || friend.firstName || "F").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {friend.username || friend.firstName || "Friend"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {friend.status || "Active now"}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Friends */}
            {offlineFriends.length > 0 && (
              <div>
                {onlineFriends.length > 0 && <div className="border-t pt-4 mt-4"></div>}
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <span className="font-medium text-gray-600">Offline ({offlineFriends.length})</span>
                </div>
                <div className="space-y-2">
                  {offlineFriends.map((friend) => (
                    <div 
                      key={friend.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-75"
                      onClick={() => handleChatWithFriend(friend.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={friend.profileImageUrl || undefined} 
                              alt={friend.username || friend.firstName || "Friend"}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                              {(friend.username || friend.firstName || "F").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">
                            {friend.username || friend.firstName || "Friend"}
                          </p>
                          <p className="text-sm text-gray-400">Last seen 2h ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-50">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-around">
          <Button variant="ghost" className="flex flex-col items-center space-y-1 text-blue-500">
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => navigate("/rooms")}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Room</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => navigate("/chat")}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">DM</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => navigate("/feed")}
          >
            <Rss className="w-5 h-5" />
            <span className="text-xs">Feed</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-gray-400"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
