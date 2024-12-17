// src/components/ChatMessage.tsx
import React from 'react';
import useAuth from '../hooks/useAuth';
import { ChatMessageProps } from '../../src/types/Entities';

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onClick }) => {
    const { user } = useAuth();
    const isOwnMessage = user?.id === message.sender.id;

    return (
        <div 
            className={`w-full flex ${isOwnMessage ? 'justify-end' : 'justify-start'} cursor-pointer`}
            onClick={onClick} 
        >
            <div
                className={`max-w-md rounded px-3 py-2 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}
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
