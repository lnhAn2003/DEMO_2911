import useSWR from 'swr';
import axiosInstance from '../utils/axiosInstance';
import { Notification } from '../types/Entities';
import { useEffect } from 'react';
import { useSocketContext } from '@/context/SocketContext';

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

const useNotifications = () => {
  const { socket } = useSocketContext();
  const { data, error, mutate } = useSWR<Notification[]>('/notifications', fetcher, {
    refreshInterval: 30000, 
  });

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', () => {
        mutate();
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket, mutate]);

  return {
    notifications: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export default useNotifications;
