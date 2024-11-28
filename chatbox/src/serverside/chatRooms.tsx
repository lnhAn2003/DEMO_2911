import axiosInstance from '../utils/axiosInstance';

export const fetchChatRoom = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/chats/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chat room with id ${id}:`, error);
    return null;
  }
};
