import axiosInstance from "@/utils/axiosInstance";

export const fetchChatRooms = async () => {
    try {
        const response = await axiosInstance.get('/chats');
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch chat rooms:', error);
        return [];
    }
}