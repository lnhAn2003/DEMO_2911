// src/components/UserCard.tsx
import React from 'react';
import { User, FriendStatus } from '../types/Entities';

interface UserCardProps {
  user: User;
  isFriend: boolean;
  hasSentRequest: boolean;
  onAddFriend: (userId: number) => void;
  actionLoading: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFriend,
  hasSentRequest,
  onAddFriend,
  actionLoading,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center">
      <img
        src={user.profileImageUrl || '/default-avatar.png'}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover mr-4"
      />
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div>
        {isFriend ? (
          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            disabled
          >
            Friends
          </button>
        ) : hasSentRequest ? (
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded"
            disabled
          >
            Request Sent
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => onAddFriend(user.id)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Sending...' : 'Add Friend'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
