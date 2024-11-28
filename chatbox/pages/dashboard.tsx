import React, { useState, useEffect } from 'react';
import useAuth from '../src/hooks/useAuth';
import axiosInstance from '../src/utils/axiosInstance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChatRoomSchema } from '../src/schema/validationSchemas';
import { z } from 'zod';
import Link from 'next/link';

type CreateChatRoomFormData = z.infer<typeof createChatRoomSchema>;

interface ChatRoom {
  id: string; 
  name: string;
  participants: Array<{
    id: number; 
    name: string;
    email: string;
  }>;
  messages: any[]; 
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateChatRoomFormData>({
    resolver: zodResolver(createChatRoomSchema),
  });

  const fetchChatRooms = async () => {
    if (!user) return; 
    try {
      const response = await axiosInstance.get<ChatRoom[]>(`/chats/user/${user.id}`);
      setChatRooms(response.data);
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Failed to fetch chat rooms.');
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [user]); 

  const onSubmit = async (data: CreateChatRoomFormData) => {
    setServerError(null);
    try {
        const participantIds = data.participantIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      
      if (!participantIds.includes(user!.id)) {
        participantIds.push(user!.id);
      };
      
      const response = await axiosInstance.post<ChatRoom>('/chats', {
        name: data.name,
        participantIds,
      });

      setChatRooms((prev) => [...prev, response.data]);
      reset();
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Failed to create chat room.');
    }
  };

  if (!user) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Create New Chat Room</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Name</label>
            <input
              type="text"
              {...register('name')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter chat room name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Participant IDs (comma separated)
            </label>
            <input
              type="text"
              {...register('participantIds')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.participantIds ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., user123,user456"
              required
            />
            {errors.participantIds && (
              <p className="mt-1 text-sm text-red-600">
                {errors.participantIds.message}
              </p>
            )}
          </div>
          {serverError && (
            <div className="text-red-500 text-sm">{serverError}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Chat Room'}
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">Your Chat Rooms</h2>
      {chatRooms.length === 0 ? (
        <p>No chat rooms available. Create one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatRooms.map((room) => (
            <div key={room.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Participants: {room.participants.map((p) => p.name).join(', ')}
              </p>
              <Link href={`/chat/${room.id}`}>
                <span className="text-blue-500 hover:underline cursor-pointer">
                  Go to Chat
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
