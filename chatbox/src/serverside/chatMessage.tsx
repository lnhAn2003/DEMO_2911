// src/serverside/chatMessage.ts
import axiosInstance from '../utils/axiosInstance'; 
import { ChatMessage } from '../../src/types/Entities';

export const fetchChatMessage = async (chatRoomId: string, messageId: string) : Promise<ChatMessage | null> => {
    console.log(`Fetching message ${messageId} from chat room ${chatRoomId}`);

    try {
        const response = await axiosInstance.get(`/chats/${chatRoomId}/messages/${messageId}`);
        console.log('Fetched message:', response.data);
        return response.data as ChatMessage;
    } catch (error: any) {
        console.error(`Failed to fetch message with id ${messageId} in chat room ${chatRoomId}:`, error.response?.data || error.message);
        return null;
    }
};

export const deleteChatMessage = async (messageId: string) : Promise<boolean> => {
    try {
        const response = await axiosInstance.patch('/chats/delete', {
            messageId: messageId,
        })

        console.log('Resource deleted successfully:', response.data);
        return true;
      } catch (error: any) {
        console.error('Error deleting message:', error.response?.data || error.message);
        return false;
      }
}
