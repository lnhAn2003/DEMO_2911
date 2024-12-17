// src/components/ChatMessage.tsx
import React from 'react';
import { ChatMessageProps } from '../types/Entities';

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onClick }) => {
  const currentUserId = 1; // Replace this with your actual auth user ID
  const isCurrentUser = message.sender.id === currentUserId;

  return (
    <div className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`} onClick={onClick}>
      {/* If it's not current user, avatar goes on the left */}
      {!isCurrentUser && (
        <img
          src={message.sender.profileImageUrl || '/default-avatar.png'}
          alt="Sender Avatar"
          className="w-8 h-8 rounded-full object-cover mr-2 self-end"
        />
      )}

      {/* Message bubble */}
      <div className={`max-w-sm p-3 rounded shadow hover:shadow-md transition cursor-pointer
        ${isCurrentUser ? 'bg-blue-200 text-right' : 'bg-gray-200 text-left'}`}
      >
        <div className="mb-1">
          <p className="font-semibold text-gray-800">{message.sender.name}</p>
          <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</p>
        </div>

        {message.content && (
          <p className="mt-1 break-words text-gray-800">
            {message.content}
          </p>
        )}

        {message.imagesURL && message.imagesURL.length > 0 && (
          <div className={`flex flex-wrap gap-2 mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {message.imagesURL.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Attachment ${index}`}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
          </div>
        )}

        {message.fileURL && (
          <div className={`${isCurrentUser ? 'text-right' : 'text-left'} mt-2`}>
            <a
              href={message.fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              Download File
            </a>
          </div>
        )}
      </div>

      {/* If current user, avatar goes on the right */}
      {isCurrentUser && (
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
