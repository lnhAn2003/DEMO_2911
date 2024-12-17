// src/serverside/chatServer.tsx
import axiosInstance from '../utils/axiosInstance';
import { ChatRoom } from '../types/Entities';

export const fetchChatRooms = async (userId: number): Promise<ChatRoom[] | null> => {
    try {
        const response = await axiosInstance.get(`/chats/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch chat rooms:', error);
        return [];
    }
};
