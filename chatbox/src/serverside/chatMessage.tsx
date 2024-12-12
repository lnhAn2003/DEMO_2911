// src/serverside/chatMessage.ts
import axiosInstance from '@/utils/axiosInstance'; 

export const fetchChatMessage = async (chatRoomId: string | string[] | undefined, messageId: string | string[] | undefined) => {
    if (!chatRoomId || Array.isArray(chatRoomId)) {
        console.error(`Invalid chat room ID: ${chatRoomId}`);
        return null;
    }

    if (!messageId || Array.isArray(messageId)) {
        console.error(`Invalid message ID: ${messageId}`);
        return null;
    }

    console.log(`Fetching message ${messageId} from chat room ${chatRoomId}`);

    try {
        const response = await axiosInstance.get(`/chats/${chatRoomId}/messages/${messageId}`);
        console.log('Fetched message:', response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Failed to fetch message with id ${messageId} in chat room ${chatRoomId}:`, error.response?.data || error.message);
        return null;
    }
};
