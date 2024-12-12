import axiosInstance from '@/utils/axiosInstance'; 

export const fetchChatRoom = async (id: string | string[] | undefined) => {
    if (!id || Array.isArray(id)) {
        console.error(`Invalid chat room ID: ${id}`);
        return null;
    }

    try {
        const response = await axiosInstance.get(`/chats/${id}`);
        return response.data;
    } catch (error: any) {
        console.error(`Failed to fetch chat room with id ${id}:`, error);
        return null;
    }
};
