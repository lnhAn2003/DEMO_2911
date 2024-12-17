// src/pages/chats/[id].tsx

import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import ChatMessageComponent from '../../src/components/ChatMessage';
import { useSocketContext } from '../../src/context/SocketContext';
import { fetchChatRoom } from '../../src/serverside/chatRooms';
import { fetchChatMessage } from '../../src/serverside/chatMessage';
import { ChatMessage, ChatRoom, ChatRoomType } from '../../src/types/Entities'; 

const ChatRoomPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { socket } = useSocketContext();

    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

    useEffect(() => {
        const loadChatRoom = async () => {
            if (typeof id !== 'string') {
                console.error('Chat room ID is not a string:', id);
                setError('Invalid chat room ID.');
                return;
            }

            try {
                const data = await fetchChatRoom(id);
                if (data) {
                    console.log("Fetched chat room:", data);
                    setMessages(data);

                    setChatRoom({ id: parseInt(id, 10), name: `Chat Room ${id}`,  type: ChatRoomType.GROUP, participants: [], createdAt: '', updatedAt: '' });
                } else {
                    setError('Failed to fetch chat room.');
                }
            } catch (err: any) {
                console.error('Error fetching chat room:', err);
                setError('Failed to fetch chat room.');
            }
        };

        if (id) {
            loadChatRoom();
        }
    }, [id]);

    // Listen for new messages via Socket.IO
    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        if (socket) {
            const handleNewMessage = (message: ChatMessage) => {
                console.log('Received newMessage:', message);
                setMessages((prev) => [...prev, message]);
            };

            socket.on('newMessage', handleNewMessage);

            return () => {
                socket.off('newMessage', handleNewMessage);
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

        if (typeof id !== 'string') {
            console.error('Chat room ID is not a string:', id);
            setError('Invalid chat room ID.');
            return;
        }

        try {
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

    // Fetch a single message detail
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

    const handleCloseMessageDetail = () => setSelectedMessage(null);

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

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white p-4 shadow">
                <h2 className="text-2xl font-bold">{chatRoom ? chatRoom.name : 'Chat Room'}</h2>
            </header>

            {/* Messages Section */}
            <main className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">
                            This room doesn't have any messages yet. Start the conversation now!
                        </p>
                    </div>
                ) : (
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
                )}
            </main>

            {/* Footer with Input */}
            <footer className="bg-white p-4 shadow">
                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                    {messages.length === 0 && (
                        <label className="text-gray-500 text-sm">
                            Be the first to send a message in this chat room!
                        </label>
                    )}
                    <div className="flex space-x-2">
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
                    </div>
                </form>
            </footer>

            {/* Selected Message Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-bold mb-2">Message Details</h3>
                        <p><strong>Sender:</strong> {selectedMessage.sender.name} ({selectedMessage.sender.email})</p>
                        <p><strong>Content:</strong> {selectedMessage.content}</p>
                        <p><strong>Sent At:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        <button
                            onClick={() => setSelectedMessage(null)}
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
