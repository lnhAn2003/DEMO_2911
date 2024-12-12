// src/pages/chats/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import ChatMessageComponent from '../../src/components/ChatMessage';
import { useSocketContext } from '../../src/context/SocketContext';
import { fetchChatRoom } from '../../src/serverside/chatRooms';
import { fetchChatMessage } from '../../src/serverside/chatMessage';

interface ChatRoom {
    id: number;
    name: string;
    participants: Array<{
        id: number;
        name: string;
        email: string;
    }>;
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
    // chatRoom: ChatRoom;
    createdAt: string;
}

const ChatRoomPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { socket } = useSocketContext();
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [selectedMessage, setSelectedMessage] = useState<ChatMessageType | null>(null);

    // Fetch messages
    useEffect(() => {
        const loadMessages = async () => {
            if (typeof id !== 'string') {
                console.error('Chat room ID is not a string:', id);
                setError('Invalid chat room ID.');
                return;
            }

            try {
                const data = await fetchChatRoom(id);
                if (data && Array.isArray(data)) {
                    console.log("Fetched messages:", data);
                    setMessages(data);
                    // Optionally, set chatRoom details from another source
                    if (data.length > 0) {
                        // If chatRoom details are available elsewhere, set them here
                        // For example, fetch chatRoom details via another API call
                        // Or retrieve from a list of chat rooms if available
                        // setChatRoom(data[0].chatRoom); // Not applicable since chatRoom is not in messages
                    } else {
                        console.warn('No messages found for this chat room.');
                        setChatRoom(null); // Or set a default chatRoom object
                    }
                } else {
                    setError('Failed to fetch messages.');
                }
            } catch (err: any) {
                console.error('Error fetching messages:', err);
                setError('Failed to fetch messages.');
            }
        };

        if (id) {
            loadMessages();
        }
    }, [id]);

    // Listen for new messages
    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        if (socket) {
            const handleNewMessage = (message: ChatMessageType) => {
                console.log('Received newMessage:', message);
                // Assume all messages belong to the current chat room
                setMessages((prev) => {
                    const messageExists = prev.some((msg) => msg.id === message.id);
                    if (!messageExists) {
                        return [...prev, message];
                    }
                    return prev;
                });
            };

            const handleConnectError = (err: any) => {
                console.error('Socket connection error:', err.message);
                setError('Real-time connection failed.');
            };

            socket.on('newMessage', handleNewMessage);
            socket.on('connect_error', handleConnectError);

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.off('connect_error', handleConnectError);
            };
        }
    }, [id, socket]);

    // Scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            if (typeof id !== 'string') {
                console.error('Chat room ID is not a string:', id);
                setError('Invalid chat room ID.');
                return;
            }

            socket?.emit('sendMessage', {
                chatRoomId: parseInt(id, 10),
                content: newMessage,
            });

            setNewMessage('');
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setError('Failed to send message.');
        }
    };

    // Fetch a single message (optional)
    const handleFetchMessage = async (messageId: number) => {
        if (typeof id !== 'string') {
            console.error('Chat room ID is not a string:', id);
            setError('Invalid chat room ID.');
            return;
        }

        const message = await fetchChatMessage(id, messageId.toString());

        if (message) {
            setSelectedMessage(message);
            console.log('Fetched single message:', message);
        } else {
            setError('Failed to fetch the selected message.');
        }
    };

    const handleCloseMessageDetail = () => {
        setSelectedMessage(null);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (messages.length === 0 && !chatRoom) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p>No messages found in this chat room.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white p-4 shadow">
                <h2 className="text-2xl font-bold">{chatRoom ? chatRoom.name : 'Chat Room'}</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <ChatMessageComponent
                            key={msg.id}
                            message={msg}
                            onClick={() => handleFetchMessage(msg.id)}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>
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

            {/* Modal to Display Selected Message Details */}
            {selectedMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-bold mb-2">Message Details</h3>
                        <p><strong>Sender:</strong> {selectedMessage.sender.name} ({selectedMessage.sender.email})</p>
                        <p><strong>Content:</strong> {selectedMessage.content}</p>
                        <p><strong>Sent At:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        <button
                            onClick={handleCloseMessageDetail}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default ChatRoomPage;