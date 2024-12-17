// pages/friend.tsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../src/utils/axiosInstance';
import { User, Friend, FriendStatus } from '../src/types/Entities';
import useAuth from '../src/hooks/useAuth';
import { toast } from 'react-toastify';
import UserCard from '../src/components/UserCard';

const FriendPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch all users
        const allUsersResponse = await axiosInstance.get<User[]>('/users');
        // Exclude the authenticated user
        const allUsers = allUsersResponse.data.filter((u) => u.id !== user.id);
        setUsers(allUsers);

        // Fetch current user's friends
        const friendsResponse = await axiosInstance.get<User[]>('/friends');
        setFriends(friendsResponse.data);

        // Fetch current user's received friend requests
        const receivedRequestsResponse = await axiosInstance.get<Friend[]>('/friends/received');
        setFriendRequests(receivedRequestsResponse.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error.response) {
          if (error.response.status === 404) {
            toast.error('Resource not found.');
          } else if (error.response.status === 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(error.response.data.message || 'Failed to fetch users.');
          }
        } else {
          toast.error('Network error. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const sendFriendRequest = async (receiverId: number) => {
    setActionLoading((prev) => ({ ...prev, [receiverId]: true }));
    try {
      await axiosInstance.post('/friends/request', { receiverId });
      toast.success('Friend request sent!');
      // Update the UI to reflect the sent request
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === receiverId ? { ...u, isRequestSent: true } : u
        )
      );
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.message || 'Bad request.');
        } else if (error.response.status === 404) {
          toast.error('User not found.');
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.response.data.message || 'Failed to send friend request.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [receiverId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="mt-20 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* All Users Section */}
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      {users.length === 0 ? (
        <p>No other users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((u) => {
            const isFriend = friends.some((f) => f.id === u.id);
            const hasSentRequest = friendRequests.some(
              (fr) =>
                fr.requester.id === user?.id &&
                fr.receiver.id === u.id &&
                fr.status === FriendStatus.PENDING
            );

            return (
              <UserCard
                key={u.id}
                user={u}
                isFriend={isFriend}
                hasSentRequest={hasSentRequest}
                onAddFriend={sendFriendRequest}
                actionLoading={actionLoading[u.id] || false}
              />
            );
          })}
        </div>
      )}

      {/* Received Friend Requests Section */}
      <h2 className="text-2xl font-bold mt-10 mb-6">Received Friend Requests</h2>
      {friendRequests.length === 0 ? (
        <p>No received friend requests.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {friendRequests.map((fr) => (
            <div key={fr.id} className="bg-white shadow rounded-lg p-4 flex items-center">
              <img
                src={fr.requester.profileImageUrl || '/default-avatar.png'}
                alt={fr.requester.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{fr.requester.name}</h2>
                <p className="text-sm text-gray-500">{fr.requester.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={async () => {
                    try {
                      await axiosInstance.post(`/friends/${fr.id}/accept`);
                      toast.success(`Friend request from ${fr.requester.name} accepted!`);
                      // Update the local state
                      setFriends((prev) => [...prev, fr.requester]);
                      setFriendRequests((prev) => prev.filter((req) => req.id !== fr.id));
                    } catch (error: any) {
                      console.error('Error accepting friend request:', error);
                      if (error.response) {
                        if (error.response.status === 404) {
                          toast.error('Friend request not found.');
                        } else if (error.response.status === 500) {
                          toast.error('Server error. Please try again later.');
                        } else {
                          toast.error(error.response.data.message || 'Failed to accept friend request.');
                        }
                      } else {
                        toast.error('Network error. Please check your connection.');
                      }
                    }
                  }}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={async () => {
                    try {
                      await axiosInstance.post(`/friends/${fr.id}/decline`);
                      toast.info(`Friend request from ${fr.requester.name} declined.`);
                      // Update the local state
                      setFriendRequests((prev) => prev.filter((req) => req.id !== fr.id));
                    } catch (error: any) {
                      console.error('Error declining friend request:', error);
                      if (error.response) {
                        if (error.response.status === 404) {
                          toast.error('Friend request not found.');
                        } else if (error.response.status === 500) {
                          toast.error('Server error. Please try again later.');
                        } else {
                          toast.error(error.response.data.message || 'Failed to decline friend request.');
                        }
                      } else {
                        toast.error('Network error. Please check your connection.');
                      }
                    }
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FriendPageWithProtection: React.FC = () => (
    <FriendPage />
);

export default FriendPageWithProtection;
