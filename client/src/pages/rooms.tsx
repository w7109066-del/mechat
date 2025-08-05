import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Search } from "lucide-react";
import TabBar from "@/components/TabBar";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import RoomCard from "@/components/RoomCard";
import type { ChatRoom } from "@shared/schema";

export default function Rooms() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/rooms"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Filter rooms based on search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    
    const query = searchQuery.toLowerCase();
    return rooms.filter(room => 
      room.name.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query)) ||
      (room.category && room.category.toLowerCase().includes(query))
    );
  }, [rooms, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(196,100%,50%)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="gradient-bg p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-semibold" data-testid="text-rooms-title">Chat Rooms</h1>
          <CreateRoomDialog 
            trigger={
              <Button variant="ghost" size="icon" className="text-white" data-testid="button-add-room">
                <Plus className="w-6 h-6" />
              </Button>
            } 
          />
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40"
            data-testid="input-search-rooms"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="p-4">
        {roomsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 bg-gray-300 rounded w-32"></div>
                  <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-48 mb-3"></div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {searchQuery.trim() ? (
              <>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No rooms found</h3>
                <p className="text-gray-500 mb-4">Try searching with different keywords</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4" data-testid="text-no-rooms">No chat rooms available</p>
                <CreateRoomDialog />
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room: ChatRoom) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      <TabBar activeTab="room" />
    </div>
  );
}
