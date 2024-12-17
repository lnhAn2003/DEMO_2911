// src/serverside/chatRooms.ts
import axiosInstance from '../utils/axiosInstance'; 
import { ChatMessage } from '../../src/types/Entities';

export const fetchChatRoom = async (id: string) : Promise<ChatMessage[] | null> => {
    try {
        const response = await axiosInstance.get(`/chats/${id}/messages`); 
        return response.data as ChatMessage[];
    } catch (error: any) {
        console.error(`Failed to fetch chat room messages with id ${id}:`, error);
        return null;
    }
};
