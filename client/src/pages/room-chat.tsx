import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  Send, 
  Plus, 
  Smile, 
  X,
  Settings,
  UserPlus,
  Hash
} from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import TabBar from "@/components/TabBar";
import type { Message, User, ChatRoom } from "@shared/schema";

interface RoomTab {
  id: string;
  room: ChatRoom;
  isActive: boolean;
}

export default function RoomChat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState("");
  const [roomTabs, setRoomTabs] = useState<RoomTab[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch available rooms
  const { data: availableRooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user's joined rooms
  const { data: userRooms = [] } = useQuery({
    queryKey: ["/api/rooms/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch messages for active room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages/room", activeRoomId],
    enabled: isAuthenticated && !!activeRoomId,
    retry: false,
  });

  // Fetch room members for active room
  const { data: roomMembers = [] } = useQuery({
    queryKey: ["/api/rooms", activeRoomId, "members"],
    enabled: isAuthenticated && !!activeRoomId,
    retry: false,
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      await apiRequest("POST", `/api/rooms/${roomId}/join`);
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/user"] });
      const room = availableRooms.find((r: ChatRoom) => r.id === roomId);
      if (room) {
        addRoomTab(room);
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
        description: "Failed to join room. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        content,
        roomId: activeRoomId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/room", activeRoomId] });
      setMessageInput("");
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize with user's rooms
  useEffect(() => {
    if (userRooms.length > 0 && roomTabs.length === 0) {
      const tabs = userRooms.map((room: ChatRoom, index: number) => ({
        id: room.id,
        room,
        isActive: index === 0,
      }));
      setRoomTabs(tabs);
      setActiveRoomId(tabs[0]?.id || "");
    }
  }, [userRooms, roomTabs.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addRoomTab = (room: ChatRoom) => {
    const existingTab = roomTabs.find(tab => tab.id === room.id);
    if (existingTab) {
      setActiveRoomId(room.id);
      return;
    }

    const newTabs = roomTabs.map(tab => ({ ...tab, isActive: false }));
    newTabs.push({ id: room.id, room, isActive: true });
    setRoomTabs(newTabs);
    setActiveRoomId(room.id);
  };

  const closeRoomTab = (roomId: string) => {
    const updatedTabs = roomTabs.filter(tab => tab.id !== roomId);
    setRoomTabs(updatedTabs);
    
    if (activeRoomId === roomId) {
      const newActiveTab = updatedTabs[updatedTabs.length - 1];
      setActiveRoomId(newActiveTab?.id || "");
    }
  };

  const switchToRoom = (roomId: string) => {
    setActiveRoomId(roomId);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && activeRoomId) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeRoom = roomTabs.find(tab => tab.id === activeRoomId)?.room;

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

  if (roomTabs.length === 0) {
    return (
      <div className="min-h-screen pb-16">
        {/* Header */}
        <div className="gradient-bg p-4 pt-12">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-white text-xl font-semibold" data-testid="text-room-chat-title">
              Room Chat
            </h1>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4" data-testid="text-available-rooms">Available Rooms</h2>
          <div className="space-y-3">
            {availableRooms.map((room: ChatRoom) => (
              <div key={room.id} className="bg-white rounded-xl p-4 shadow-sm" data-testid={`card-available-room-${room.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800" data-testid={`text-available-room-name-${room.id}`}>
                      <Hash className="w-4 h-4 inline mr-1" />
                      {room.name}
                    </h3>
                    <p className="text-gray-600 text-sm" data-testid={`text-available-room-description-${room.id}`}>
                      {room.description || "Welcome to this chat room!"}
                    </p>
                  </div>
                  <Button
                    onClick={() => joinRoomMutation.mutate(room.id)}
                    disabled={joinRoomMutation.isPending}
                    className="gradient-bg text-white"
                    data-testid={`button-join-room-${room.id}`}
                  >
                    {joinRoomMutation.isPending ? "Joining..." : "Join"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TabBar activeTab="room" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      {/* Header */}
      <div className="gradient-bg flex-shrink-0">
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-white text-lg font-semibold" data-testid="text-active-room-name">
                {activeRoom?.name || "Chatroom"}
              </h1>
              <p className="text-white/70 text-sm">Chatroom</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-copy">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012 2v2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-gift">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-member-list">
              <Users className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Room indicator dots */}
        <div className="flex justify-center space-x-2 pb-4">
          {roomTabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`w-2 h-2 rounded-full ${
                tab.id === activeRoomId ? "bg-white" : "bg-white/30"
              }`}
              data-testid={`room-indicator-${tab.id}`}
            />
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-white">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(196,100%,50%)]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm" data-testid="text-no-room-messages">
              Welcome to {activeRoom?.name} official chat room.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Currently in the room: {roomMembers.map(member => member.username || member.email.split('@')[0]).join(', ')}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: Message, index: number) => {
              const sender = roomMembers.find((member: User) => member.id === message.senderId) || user;
              const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
              const showTime = index === 0 || 
                new Date(messages[index - 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000;
              
              return (
                <div key={message.id} className="text-sm">
                  {showTime && (
                    <div className="text-center text-gray-400 text-xs my-2">
                      {timestamp}
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <span 
                      className={`font-semibold text-sm ${
                        message.senderId === user.id ? 'text-blue-600' : 
                        sender.username === 'bass' ? 'text-gray-800' :
                        sender.username === 'tumi' ? 'text-red-500' :
                        sender.username === 'batik' ? 'text-blue-500' :
                        sender.username === 'send' ? 'text-orange-500' :
                        sender.username === 'huang' ? 'text-green-600' :
                        sender.username === 'alif' ? 'text-purple-600' :
                        sender.username === 'nickie' ? 'text-pink-500' :
                        'text-gray-600'
                      }`}
                    >
                      {sender.username || sender.email.split('@')[0]}
                    </span>
                    <span className="text-gray-600 flex-1">{message.content}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-400" data-testid="button-emoji-room">
            <Smile className="w-6 h-6" />
          </Button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-700 placeholder:text-gray-500"
              data-testid="input-room-message"
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="gradient-bg text-white p-3 rounded-full hover:scale-105 transition-transform"
            data-testid="button-send-room-message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <TabBar activeTab="room" />
    </div>
  );
}