// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useContext(AuthContext);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = auth?.token;
        console.log('SocketContext: Retrieved token:', token); 

        if (!token) {
            console.warn('Socket not initialized: Token missing');
            return;
        }

        const newSocket = io('http://localhost:4000', {
            auth: {
                token: token,
            },
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [auth?.token]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);
