import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateRoomDialogProps {
  trigger?: React.ReactNode;
}

export default function CreateRoomDialog({ trigger }: CreateRoomDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [roomData, setRoomData] = useState({
    name: "",
    description: "",
    category: "OFFICIAL ROOM",
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; category: string }) => {
      await apiRequest("POST", "/api/rooms", {
        name: data.name,
        description: data.description,
        isPrivate: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/user"] });
      toast({
        title: "Room Created",
        description: "Your chat room has been created successfully.",
      });
      setOpen(false);
      setRoomData({ name: "", description: "", category: "OFFICIAL ROOM" });
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
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = () => {
    if (!roomData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name.",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate(roomData);
  };

  const displayName = user?.username || user?.firstName || user?.email || "User";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-bg text-white" data-testid="button-create-room-trigger">
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-create-room">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold" data-testid="text-create-room-title">
            Create Room
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Room Name */}
          <div>
            <Label htmlFor="room-name" className="text-sm font-medium">
              Room Name
            </Label>
            <Input
              id="room-name"
              placeholder="Enter room name"
              value={roomData.name}
              onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
              data-testid="input-room-name"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="room-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="room-description"
              placeholder="Enter room description"
              value={roomData.description}
              onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 min-h-[80px]"
              data-testid="textarea-room-description"
            />
          </div>

          {/* Created By */}
          <div>
            <Label className="text-sm font-medium">Created by</Label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">
              <span className="text-sm text-gray-700" data-testid="text-creator-name">
                {displayName}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={roomData.category}
              onValueChange={(value) => setRoomData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-1" data-testid="select-room-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFFICIAL ROOM">OFFICIAL ROOM</SelectItem>
                <SelectItem value="RECENT ROOM">RECENT ROOM</SelectItem>
                <SelectItem value="FAVORITE ROOM">FAVORITE ROOM</SelectItem>
                <SelectItem value="GAME ROOM">GAME ROOM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              data-testid="button-cancel-room"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={createRoomMutation.isPending || !roomData.name.trim()}
              className="flex-1 gradient-bg text-white"
              data-testid="button-create-room"
            >
              {createRoomMutation.isPending ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}