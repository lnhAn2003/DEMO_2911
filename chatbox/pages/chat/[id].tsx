import { useRouter } from 'next/router';
import { useEffect, useState, useContext, useRef } from 'react';
import Header from '../../src/components/Header';
import useAuth from '../../src/hooks/useAuth';
import axiosInstance from '../../src/utils/axiosInstance';
import ChatMessage from '../../src/components/ChatMessage';
import { io, Socket } from 'socket.io-client';

interface ChatRoom {
    id: number;
    name: string;
    participants: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    messages: ChatMessageType[];
    createdAt: string;
    updatedAt: string;
}

interface ChatMessageType {
    id: number;
    content: string;
    sender: {
        id: number;
        name: string;
        email: string;
    };
    chatRoom: {
        id: number;
        name: string;
    };
    createdAt: string;
}

let socket: Socket;
const ChatRoomPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        if (!socketRef.current) {
            socketRef.current = io('http://localhost:4000', {
                auth: {
                    token: localStorage.getItem('token'),
                },
            });

            socketRef.current.on('newMessage', (message: ChatMessageType) => {
                if (message.chatRoom.id === parseInt(id, 10)) {
                    setMessages((prev) => {
                        const messageExists = prev.some((msg) => msg.id === message.id);
                        if (!messageExists) {
                            return [...prev, message];
                        }
                        return prev;
                    });
                }
            });

            socketRef.current.on('connect_error', (err: any) => {
                console.error('Socket connection error:', err.message);
                setError('Real-time connection failed.');
            });
        }

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [id]);

    useEffect(() => {
        const fetchChatRoom = async () => {
            try {
                const response = await axiosInstance.get<ChatRoom>(`/chats/${id}`);
                setChatRoom(response.data);
                setMessages(response.data.messages);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    setError('You are not authorized to access this chat room. Please log in again.');
                } else {
                    setError('Failed to fetch chat room.');
                }
            }
        };

        if (id) {
            fetchChatRoom();
        }
    }, [id]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            socketRef.current?.emit('sendMessage', {
                chatRoomId: parseInt(id as string, 10),
                content: newMessage,
            });

            setNewMessage('');
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setError('Failed to send message.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="flex items-center justify-center h-full">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!chatRoom) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header />
                <div className="flex items-center justify-center h-full">
                    <p>Loading chat room...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header />
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-2xl font-bold mb-4">{chatRoom.name}</h2>
                <div className="space-y-4">
                    {Array.isArray(messages) && messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <footer className="bg-white p-4 shadow">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        className="flex-1 border px-3 py-2 rounded"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Send
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatRoomPage;
