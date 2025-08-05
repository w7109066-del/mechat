import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Video } from "lucide-react";
import type { User } from "@shared/schema";

interface FriendCardProps {
  friend: User;
}

export default function FriendCard({ friend }: FriendCardProps) {
  const [, setLocation] = useLocation();

  const friendName = friend.username || friend.firstName || friend.email || "Friend";
  
  const handleChatClick = () => {
    setLocation(`/chat/${friend.id}`);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm" data-testid={`card-friend-${friend.id}`}>
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12" data-testid={`img-friend-avatar-${friend.id}`}>
          <AvatarImage 
            src={friend.profileImageUrl || undefined} 
            alt={friendName}
          />
          <AvatarFallback className="bg-gray-300 text-gray-700 font-semibold">
            {friendName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-gray-800" data-testid={`text-friend-name-${friend.id}`}>
            {friendName}
          </h4>
          <div className="flex items-center space-x-2">
            <div className={friend.isOnline ? "status-dot-online" : "status-dot-offline"}></div>
            <span className="text-sm text-gray-600" data-testid={`status-friend-${friend.id}`}>
              {friend.isOnline ? "Online" : "Last seen 2h ago"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleChatClick}
          className="text-[hsl(196,100%,50%)] hover:bg-blue-50"
          data-testid={`button-chat-${friend.id}`}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[hsl(269,41%,56%)] hover:bg-purple-50"
          data-testid={`button-video-${friend.id}`}
        >
          <Video className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
