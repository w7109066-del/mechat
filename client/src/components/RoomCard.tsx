import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Hash, Users } from "lucide-react";
import type { ChatRoom } from "@shared/schema";

interface RoomCardProps {
  room: ChatRoom;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/rooms/${room.id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/user"] });
      setLocation("/room-chat");
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

  const handleJoinRoom = () => {
    joinRoomMutation.mutate();
  };

  const handleOpenRoom = () => {
    setLocation("/room-chat");
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" data-testid={`card-room-${room.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-[hsl(196,100%,50%)]" />
          <h3 className="font-semibold text-gray-800" data-testid={`text-room-name-${room.id}`}>
            {room.name}
          </h3>
        </div>
        <span className="bg-[hsl(196,100%,50%)] text-white text-xs px-2 py-1 rounded-full" data-testid={`text-room-members-${room.id}`}>
          24 online
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3" data-testid={`text-room-description-${room.id}`}>
        {room.description || "Welcome to this chat room!"}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face" alt="User 1" />
            <AvatarFallback className="text-xs">U1</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" alt="User 2" />
            <AvatarFallback className="text-xs">U2</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face" alt="User 3" />
            <AvatarFallback className="text-xs">U3</AvatarFallback>
          </Avatar>
          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-gray-600">+21</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenRoom}
            data-testid={`button-view-room-${room.id}`}
          >
            <Users className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            onClick={handleJoinRoom}
            disabled={joinRoomMutation.isPending}
            className="gradient-bg text-white"
            size="sm"
            data-testid={`button-join-room-${room.id}`}
          >
            {joinRoomMutation.isPending ? "Joining..." : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}