import React from 'react';
import useAuth from '../hooks/useAuth';

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    sender: {
      id: number;
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();

  const isOwnMessage = user?.id === message.sender.id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded px-3 py-2 ${
          isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs text-right block mt-1">
          - {message.sender.name}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
