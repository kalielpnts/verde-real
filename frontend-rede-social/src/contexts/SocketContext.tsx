import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_BASE_URL } from '@/src/services/api';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }

  useEffect(() => {
    const socket = socketRef.current;
    return () => {
      socket?.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
