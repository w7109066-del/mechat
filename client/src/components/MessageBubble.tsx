import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message, User } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender: User;
}

export default function MessageBubble({ message, isOwn, sender }: MessageBubbleProps) {
  const senderName = sender.username || sender.firstName || sender.email || "User";
  const timestamp = new Date(message.createdAt || "").toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (isOwn) {
    return (
      <div className="flex items-start space-x-2 justify-end" data-testid={`message-sent-${message.id}`}>
        <div className="chat-bubble-sent max-w-xs p-3 rounded-2xl rounded-tr-sm">
          <p className="text-white" data-testid={`text-message-content-${message.id}`}>
            {message.content}
          </p>
          <span className="text-xs text-white text-opacity-80 mt-1 block" data-testid={`text-message-time-${message.id}`}>
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2" data-testid={`message-received-${message.id}`}>
      <Avatar className="w-8 h-8" data-testid={`img-sender-avatar-${message.id}`}>
        <AvatarImage 
          src={sender.profileImageUrl || undefined} 
          alt={senderName}
        />
        <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
          {senderName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="chat-bubble-received max-w-xs p-3 rounded-2xl rounded-tl-sm">
        <p className="text-gray-800" data-testid={`text-message-content-${message.id}`}>
          {message.content}
        </p>
        <span className="text-xs text-gray-500 mt-1 block" data-testid={`text-message-time-${message.id}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}
