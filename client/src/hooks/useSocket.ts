
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Join user room for notifications
  const joinUserRoom = (userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-user-room', userId);
    }
  };

  // Join chat room
  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', roomId);
    }
  };

  // Leave chat room
  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', roomId);
    }
  };

  // Send direct message
  const sendDirectMessage = (data: {
    senderId: string;
    receiverId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('send-direct-message', data);
    }
  };

  // Send room message
  const sendRoomMessage = (data: {
    senderId: string;
    roomId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('send-room-message', data);
    }
  };

  // Typing indicators
  const startTyping = (data: { userId: string; roomId?: string; receiverId?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('typing-start', data);
    }
  };

  const stopTyping = (data: { userId: string; roomId?: string; receiverId?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('typing-stop', data);
    }
  };

  // Update user status
  const updateStatus = (data: { userId: string; isOnline: boolean; status?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('update-status', data);
    }
  };

  // Add event listener
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    joinUserRoom,
    joinRoom,
    leaveRoom,
    sendDirectMessage,
    sendRoomMessage,
    startTyping,
    stopTyping,
    updateStatus,
    on,
    off
  };
}
