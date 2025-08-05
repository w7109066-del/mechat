
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TabBar from "@/components/TabBar";
import FriendCard from "@/components/FriendCard";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import RoomCard from "@/components/RoomCard";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageCircle, 
  Users, 
  Hash, 
  Settings, 
  UserPlus,
  Home as HomeIcon,
  Rss
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
  const [activeTab, setActiveTab] = useState<"friends" | "rooms">("friends");
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

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

  // Fetch user's joined rooms
  const { data: userRooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ["/api/rooms/user"],
    enabled: !!user,
  });

  const onlineFriends = friends.filter(friend => friend.isOnline);
  const offlineFriends = friends.filter(friend => !friend.isOnline);

  const handleChatWithFriend = (friendId: string) => {
    navigate(`/chat/${friendId}`);
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const navigation = [
    { id: "home", label: "Home", icon: HomeIcon, active: true, onClick: () => navigate("/") },
    { id: "feed", label: "Feed", icon: Rss, active: false, onClick: () => navigate("/feed") },
    { id: "rooms", label: "Rooms", icon: Hash, active: false, onClick: () => navigate("/rooms") },
    { id: "settings", label: "Settings", icon: Settings, active: false, onClick: () => navigate("/settings") },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-600 mt-1">Connect with friends and join conversations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={user.isOnline ? "default" : "secondary"} className="px-3 py-1">
              {user.isOnline ? "Online" : "Offline"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {navigation.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.active ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={item.onClick}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Friends Online</span>
                  <Badge variant="default">{onlineFriends.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Friends</span>
                  <Badge variant="secondary">{friends.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Joined Rooms</span>
                  <Badge variant="secondary">{userRooms.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Rooms</span>
                  <Badge variant="secondary">{rooms.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Connect & Chat
                  </CardTitle>
                  <TabBar
                    tabs={[
                      { id: "friends", label: "Friends", icon: Users },
                      { id: "rooms", label: "Rooms", icon: Hash },
                    ]}
                    activeTab={activeTab}
                    onTabChange={(tab) => setActiveTab(tab as "friends" | "rooms")}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "friends" && (
                  <div className="space-y-6">
                    {onlineFriends.length > 0 && (
                      <div>
                        <div className="flex items-center mb-3">
                          <h3 className="font-semibold text-green-600">Online Friends</h3>
                          <Badge variant="default" className="ml-2">{onlineFriends.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {onlineFriends.map((friend) => (
                            <FriendCard
                              key={friend.id}
                              friend={friend}
                              onChat={() => handleChatWithFriend(friend.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {onlineFriends.length > 0 && offlineFriends.length > 0 && (
                      <Separator />
                    )}

                    {offlineFriends.length > 0 && (
                      <div>
                        <div className="flex items-center mb-3">
                          <h3 className="font-semibold text-gray-600">Offline Friends</h3>
                          <Badge variant="secondary" className="ml-2">{offlineFriends.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {offlineFriends.map((friend) => (
                            <FriendCard
                              key={friend.id}
                              friend={friend}
                              onChat={() => handleChatWithFriend(friend.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {friends.length === 0 && (
                      <div className="text-center py-12">
                        <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-600 mb-2">No friends yet</h3>
                        <p className="text-gray-500 mb-4">Start connecting with people to see them here</p>
                        <Button onClick={() => navigate("/rooms")}>
                          <Hash className="w-4 h-4 mr-2" />
                          Join a Room
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "rooms" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Available Rooms</h3>
                      <Button onClick={() => setIsCreateRoomOpen(true)} size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Room
                      </Button>
                    </div>

                    {rooms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rooms.slice(0, 6).map((room) => (
                          <RoomCard
                            key={room.id}
                            room={room}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-600 mb-2">No rooms available</h3>
                        <p className="text-gray-500 mb-4">Be the first to create a room</p>
                      </div>
                    )}

                    {rooms.length > 6 && (
                      <div className="text-center">
                        <Button variant="outline" onClick={() => navigate("/rooms")}>
                          View All Rooms ({rooms.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isCreateRoomOpen && <CreateRoomDialog />}
    </div>
  );
}
