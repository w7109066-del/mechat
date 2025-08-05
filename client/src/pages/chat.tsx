import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Video, Phone, Plus, Smile, Send } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import TabBar from "@/components/TabBar";
import type { Message, User } from "@shared/schema";

export default function Chat() {
  const { friendId } = useParams<{ friendId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState("");
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

  // Fetch friend details
  const { data: friends = [] } = useQuery<User[]>({
    queryKey: ["/api/friends"],
    enabled: isAuthenticated,
    retry: false,
  });

  const friend = friends.find((f: User) => f.id === friendId);

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/direct", friendId],
    enabled: isAuthenticated && !!friendId,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        content,
        recipientId: friendId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/direct", friendId] });
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  if (!friend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Friend not found</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const friendDisplayName = friend.username || friend.firstName || friend.email || "Friend";

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      {/* Chat Header */}
      <div className="gradient-bg p-4 pt-12 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Avatar className="w-10 h-10" data-testid="img-friend-avatar">
            <AvatarImage 
              src={friend.profileImageUrl || undefined} 
              alt={friendDisplayName}
            />
            <AvatarFallback className="bg-white text-[hsl(196,100%,50%)] font-semibold">
              {friendDisplayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-white font-semibold" data-testid="text-friend-name">{friendDisplayName}</h1>
            <p className="text-white text-sm opacity-90" data-testid="status-friend">
              {friend.isOnline ? "Online" : "Offline"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-white" data-testid="button-video">
            <Video className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" data-testid="button-call">
            <Phone className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(196,100%,50%)]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500" data-testid="text-no-messages">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message: Message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isOwn={message.senderId === user.id}
                sender={message.senderId === user.id ? user : friend}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-[hsl(196,100%,50%)]" data-testid="button-add">
            <Plus className="w-6 h-6" />
          </Button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0"
              data-testid="input-message"
            />
            <Button variant="ghost" size="icon" className="text-gray-400" data-testid="button-emoji-chat">
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="gradient-bg text-white p-2 rounded-full hover:scale-105 transition-transform"
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <TabBar activeTab="dm" />
    </div>
  );
}
