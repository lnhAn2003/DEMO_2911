// pages/notification/collection.tsx

import React, { useState } from 'react';
import useNotifications from '@/hooks/useNotifications';
import axiosInstance from '@/utils/axiosInstance';

const NotificationCollection: React.FC = () => {
  const { notifications, isLoading, isError, mutate } = useNotifications();
  const [expandedNotificationId, setExpandedNotificationId] = useState<number | null>(null);

  const toggleReadStatus = async (notificationId: number, isRead: boolean) => {
    try {
      if (!isRead) {
        await axiosInstance.post(`/notifications/${notificationId}/read`);
      } else {
        console.log('Currently, unread toggle logic is not supported by the backend');
      }
      mutate(); // Refresh the notification list
    } catch (error) {
      console.error('Failed to toggle notification read status:', error);
    }
  };

  const handleExpand = (notificationId: number) => {
    setExpandedNotificationId((prev) => (prev === notificationId ? null : notificationId));
  };

  if (isLoading) {
    return <p>Loading notifications...</p>;
  }

  if (isError) {
    return <p>Failed to load notifications.</p>;
  }

  if (!notifications || notifications.length === 0) {
    return <p>You have no notifications.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg shadow-sm ${
              notification.isRead ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <div
                className="cursor-pointer"
                onClick={() => handleExpand(notification.id)}
              >
                <p className="font-medium">
                  {notification.message || 'No message available'}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                className={`text-sm ${
                  notification.isRead
                    ? 'text-gray-500 hover:text-red-500'
                    : 'text-blue-500 hover:text-blue-700'
                }`}
                onClick={() =>
                  toggleReadStatus(notification.id, notification.isRead)
                }
              >
                {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </button>
            </div>
            {expandedNotificationId === notification.id && (
              <div className="mt-4 text-sm text-gray-700">
                <p>
                  <strong>Type:</strong> {notification.type}
                </p>
                <p>
                  <strong>From:</strong>{' '}
                  {notification.sender
                    ? notification.sender.name
                    : 'System Notification'}
                </p>
                {notification.chatRoomId && (
                  <p>
                    <strong>Chat Room:</strong> #{notification.chatRoomId}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCollection;
