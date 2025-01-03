// src/components/Header.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosInstance';

const Header: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, isLoading, isError, mutate } = useNotifications();

  const avatarSrc = user?.profileImageUrl || '/default-avatar.png';

  const [showNotifications, setShowNotifications] = useState(false);

  const handleAvatarClick = () => {
    if (user) {
      router.push('/profile');
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const unreadCount = notifications?.filter((notif) => !notif.isRead).length || 0;

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await axiosInstance.post(`/notifications/${notificationId}/read`);
      mutate();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link
              className="flex-shrink-0 text-2xl font-bold text-blue-600"
              href="/"
            >
              ChatBox
            </Link>
            <div className="hidden sm:flex sm:space-x-8">
              <Link
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                href="/dashboard"
              >
                Dashboard
              </Link>
              {/* Friends Link */}
              <Link
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
                href="/friend"
              >
                Friends
              </Link>
            </div>
          </div>

          {/* Right Side: Icons (If user logged in) */}
          <div className="flex items-center space-x-4 relative">
            {user && (
              <>
                {/* Notification Icon */}
                <button
                  className="relative group"
                  onClick={handleNotificationClick}
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 
                      14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 
                      1.055-.595 1.436L4 17h11zm-7 4h8a2 2 0 
                      11-8 0z"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg w-64 py-2 z-50">
                    {isLoading && (
                      <p className="px-4 py-2 text-sm text-gray-700">Loading...</p>
                    )}
                    {isError && (
                      <p className="px-4 py-2 text-sm text-red-600">Failed to load notifications.</p>
                    )}
                    {!isLoading && !isError && notifications && notifications.length > 0 ? (
                      <ul className="max-h-60 overflow-auto">
                        {notifications.map((notif) => (
                          <li
                            key={notif.id}
                            className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${!notif.isRead ? 'font-semibold bg-gray-50' : ''
                              }`}
                            onClick={() => {
                              if (!notif.isRead) {
                                handleMarkAsRead(notif.id);
                              }
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span>{notif.message}</span>
                              {!notif.isRead && (
                                <span className="ml-2 text-xs text-blue-500">New</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      !isLoading && !isError && (
                        <p className="px-4 py-2 text-sm text-gray-700">No notifications.</p>
                      )
                    )}
                    <div className="border-t border-gray-200">
                      <Link href="/notification/collection" className="block px-4 py-2 text-sm text-blue-600 hover:underline">
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}

                {/* Avatar */}
                <img
                  src={avatarSrc}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 hover:border-blue-500 cursor-pointer"
                  onClick={handleAvatarClick}
                />
              </>
            )}

            {!user && (
              <>
                <Link className="text-blue-500 hover:underline" href="/login">
                  Login
                </Link>
                <Link
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
