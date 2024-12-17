// src/components/ChatMessage.tsx

import React from 'react';
import { ChatMessageProps } from '../types/Entities';

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onClick }) => {
  const currentUserId = 1; // Replace this with your actual auth user ID
  const isCurrentUser = message.sender.id === currentUserId;

  return (
    <div className={`w-full flex ${isCurrentUser ? 'justify-start' : 'justify-end'} mb-4`} onClick={onClick}>
      {isCurrentUser && (
        <img
          src={message.sender.profileImageUrl || '/default-avatar.png'}
          alt="Sender Avatar"
          className="w-8 h-8 rounded-full object-cover mr-2 self-end"
        />
      )}

      <div
        className={`max-w-sm p-3 rounded shadow hover:shadow-md transition cursor-pointer ${
          isCurrentUser ? 'bg-blue-200 text-left' : 'bg-gray-200 text-right'
        }`}
      >
        {/* Sender Info */}
        <div className="mb-1">
          <p className="font-semibold text-gray-800">{message.sender.name}</p>
          <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
        </div>

        {/* Message Content */}
        <p className="mt-1 break-words text-gray-800">{message.content}</p>

        {/* Render Images */}
        {message.imagesURL && message.imagesURL.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.imagesURL.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`message-img-${index}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        )}

        {/* Render File */}
        {message.fileURL && (
          <div className="mt-2">
            <a
              href={message.fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Download File
            </a>
          </div>
        )}
      </div>

      {!isCurrentUser && (
        <img
          src={message.sender.profileImageUrl || '/default-avatar.png'}
          alt="Sender Avatar"
          className="w-8 h-8 rounded-full object-cover ml-2 self-end"
        />
      )}
    </div>
  );
};

export default ChatMessageComponent;
