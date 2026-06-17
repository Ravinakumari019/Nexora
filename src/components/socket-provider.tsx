/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/use-chat-store';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Record<string, boolean>; // userId -> isTyping for active conversation
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: {},
  joinRoom: () => {},
  leaveRoom: () => {},
  emitTyping: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { addMessage, activeConversationId } = useChatStore();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  
  // Use a ref to always have the latest activeConversationId inside event listeners
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    // Clear typing indicators when switching conversations
    setTypingUsers({});
  }, [activeConversationId]);

  useEffect(() => {
    if (!currentUserId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    // Initialize socket connection
    const socketInstance = io(socketUrl, {
      query: { userId: currentUserId },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[SOCKET] Connected to real-time server');

      // If there is already an active conversation, rejoin its room on reconnect
      if (activeConversationIdRef.current) {
        socketInstance.emit('room:join', activeConversationIdRef.current);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[SOCKET] Disconnected from real-time server');
    });

    // Handle initial presence list
    socketInstance.on('presence:initial', (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    // Handle individual presence updates
    socketInstance.on('presence:update', ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUsers((prev) => {
        if (status === 'online') {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    });

    // Handle incoming messages
    socketInstance.on('message:received', (message) => {
      addMessage(message.conversationId, message);
    });

    // Handle typing indicator updates
    socketInstance.on(
      'typing:update',
      ({ conversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (conversationId === activeConversationIdRef.current) {
          setTypingUsers((prev) => ({
            ...prev,
            [userId]: isTyping,
          }));
        }
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [currentUserId, addMessage]);

  // Join a conversation room
  const joinRoom = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('room:join', conversationId);
    }
  }, [socket, isConnected]);

  // Leave a conversation room
  const leaveRoom = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('room:leave', conversationId);
    }
  }, [socket, isConnected]);

  // Emit typing statuses
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', conversationId);
    }
  }, [socket, isConnected]);

  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinRoom,
    leaveRoom,
    emitTyping,
  }), [socket, isConnected, onlineUsers, typingUsers, joinRoom, leaveRoom, emitTyping]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
