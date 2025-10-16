"use client"

import { createContext, useContext, useEffect, useState, ReactNode, ReactElement } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: number, courseId: number, userId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendMessage: (data: {
    roomId: number;
    message: string;
    senderId: number;
    senderName: string;
    messageType?: string;
    fileUrl?: string;
  }) => void;
  onMessage: (callback: (data: any) => void) => void;
  onUserJoined: (callback: (data: any) => void) => void;
  onUserLeft: (callback: (data: any) => void) => void;
  onTyping: (callback: (data: any) => void) => void;
  onStoppedTyping: (callback: (data: any) => void) => void;
  onMessageDeleted: (callback: (data: any) => void) => void;
  startTyping: (roomId: number, userId: number, userName: string) => void;
  stopTyping: (roomId: number, userId: number) => void;
  deleteMessage: (messageId: number, roomId: number, userId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  sendMessage: () => {},
  onMessage: () => {},
  onUserJoined: () => {},
  onUserLeft: () => {},
  onTyping: () => {},
  onStoppedTyping: () => {},
  onMessageDeleted: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  deleteMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
  userId?: number;
  userName?: string;
}

export function SocketProvider({ children, userId, userName }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!userId || !userName) {
      return;
    }

    // Connect to Socket.IO server
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
      setIsConnected(true);
      
      // Authenticate socket connection
      socketInstance.emit('authenticate', { userId, userName });
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId, userName]);

  const joinRoom = (roomId: number, courseId: number, userId: number) => {
    if (socket) {
      socket.emit('join-room', { roomId, courseId, userId });
      console.log(`🔗 Joining room ${roomId} for course ${courseId}`);
    }
  };

  const leaveRoom = (roomId: number) => {
    if (socket) {
      socket.emit('leave-room', { roomId });
      console.log(`👋 Leaving room ${roomId}`);
    }
  };

  const sendMessage = (data: {
    roomId: number;
    message: string;
    senderId: number;
    senderName: string;
    messageType?: string;
    fileUrl?: string;
  }) => {
    if (socket) {
      socket.emit('chat-message', data);
    }
  };

  const onMessage = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('chat-message', callback);
    }
  };

  const onUserJoined = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user-joined', callback);
    }
  };

  const onUserLeft = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user-left', callback);
    }
  };

  const onTyping = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user-typing', callback);
    }
  };

  const onStoppedTyping = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('user-stopped-typing', callback);
    }
  };

  const onMessageDeleted = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('message-deleted', callback);
    }
  };

  const startTyping = (roomId: number, userId: number, userName: string) => {
    if (socket) {
      socket.emit('typing-start', { roomId, userId, userName });
    }
  };

  const stopTyping = (roomId: number, userId: number) => {
    if (socket) {
      socket.emit('typing-stop', { roomId, userId });
    }
  };

  const deleteMessage = (messageId: number, roomId: number, userId: number) => {
    if (socket) {
      socket.emit('delete-message', { messageId, roomId, userId });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    onMessage,
    onUserJoined,
    onUserLeft,
    onTyping,
    onStoppedTyping,
    onMessageDeleted,
    startTyping,
    stopTyping,
    deleteMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
