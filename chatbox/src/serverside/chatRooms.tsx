// src/serverside/chatRooms.ts
import axiosInstance from '../utils/axiosInstance'; 
import { ChatMessage } from '../../src/types/Entities';

export const fetchChatRoom = async (id: string) : Promise<ChatMessage[] | null> => {
    try {
        const response = await axiosInstance.get(`/chats/${id}/messages`); 
        // Adjust the endpoint if needed. If /chats/:id returns a ChatRoom object, 
        // and you need messages, either:
        // 1) Use /chats/:id/messages to get messages directly, or
        // 2) Extract messages from the ChatRoom object if returned.
        return response.data as ChatMessage[];
    } catch (error: any) {
        console.error(`Failed to fetch chat room messages with id ${id}:`, error);
        return null;
    }
};
