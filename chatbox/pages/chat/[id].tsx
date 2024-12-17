import { useRouter } from 'next/router';
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import ChatMessageComponent from '../../src/components/ChatMessage';
import { useSocketContext } from '../../src/context/SocketContext';
import { fetchChatRoom } from '../../src/serverside/chatRooms';
import { fetchChatMessage } from '../../src/serverside/chatMessage';
import { ChatMessage, ChatRoom, ChatRoomType } from '../../src/types/Entities'; 
import axiosInstance from '../../src/utils/axiosInstance';

const MAX_IMAGES = 5;

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
    const [images, setImages] = useState<File[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
                    // data is assumed to be the messages since your code indicates that.
                    setMessages(data);
                    setChatRoom({
                        id: parseInt(id, 10),
                        name: `Chat Room ${id}`,
                        type: ChatRoomType.GROUP,
                        participants: [],
                        createdAt: '',
                        updatedAt: ''
                    });
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

    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        if (socket) {
            const handleNewMessage = (message: ChatMessage) => {
                setMessages((prev) => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            };

            socket.on('newMessage', handleNewMessage);

            return () => {
                socket.off('newMessage', handleNewMessage);
            };
        }
    }, [id, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' && images.length === 0 && !file) {
            return;
        }

        if (typeof id !== 'string') {
            console.error('Chat room ID is not a string:', id);
            setError('Invalid chat room ID.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', newMessage);
            
            images.forEach((img) => {
                formData.append('images', img);
            });
            
            if (file) {
                formData.append('file', file);
            }

            const response = await axiosInstance.post(`/chats/${id}/messages`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // const newSentMessage = response.data as ChatMessage;
            // setMessages((prev) => [...prev, newSentMessage]);

            setNewMessage('');
            setImages([]);
            setFile(null);
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setError('Failed to send message.');
        }
    };

    const handleFetchMessage = async (messageId: number) => {
        if (typeof id !== 'string') {
            console.error('Chat room ID is not a string:', id);
            setError('Invalid chat room ID.');
            return;
        }

        const message = await fetchChatMessage(id, messageId.toString());
        if (message) {
            setSelectedMessage(message);
        } else {
            setError('Failed to fetch the selected message.');
        }
    };

    const handleCloseMessageDetail = () => setSelectedMessage(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        const newImages = [...images, ...selectedFiles].slice(0, MAX_IMAGES);
        setImages(newImages);
    };

    const removeImage = (index: number) => {
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
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

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white p-4 shadow flex items-center justify-between">
                <h2 className="text-2xl font-bold">{chatRoom ? chatRoom.name : 'Chat Room'}</h2>
            </header>

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

            <footer className="bg-white p-4 shadow">
                <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
                    {messages.length === 0 && (
                        <label className="text-gray-500 text-sm">
                            Be the first to send a message in this chat room!
                        </label>
                    )}

                    {(images.length > 0 || file) && (
                        <div className="flex flex-col space-y-2 mb-2">
                            {images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm">Selected Images:</h4>
                                    <div className="flex space-x-2">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative w-16 h-16 border rounded overflow-hidden">
                                                <img 
                                                    src={URL.createObjectURL(img)} 
                                                    alt={`selected-${index}`} 
                                                    className="object-cover w-full h-full"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl hover:bg-red-600"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {file && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className="flex-1 border px-3 py-2 rounded"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />

                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          ref={imageInputRef} 
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="p-2 rounded hover:bg-gray-200"
                            title="Attach Images"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-2h10l2 2h2m-2 0h-4.5M12 5v.01M5 7h2m12 0h2M5 7l.01 10M19 7l-.01 10M5 17h14m-7-4.5a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded hover:bg-gray-200"
                            title="Attach File"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 10.29l-7.07 7.07a5.5 5.5 0 01-7.78 0L4.71 14.4a5.5 5.5 0 010-7.78L11.78.64a5.5 5.5 0 017.78 7.78l-6.36 6.36" />
                            </svg>
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </footer>

            {selectedMessage && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-bold mb-2">Message Details</h3>
                        <p><strong>Sender:</strong> {selectedMessage.sender.name} ({selectedMessage.sender.email})</p>
                        <p><strong>Content:</strong> {selectedMessage.content}</p>
                        <p><strong>Sent At:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        {selectedMessage.imagesURL && selectedMessage.imagesURL.length > 0 && (
                            <div className="mt-2">
                                <h4 className="font-semibold mb-1">Images:</h4>
                                <div className="flex space-x-2 flex-wrap">
                                    {selectedMessage.imagesURL.map((url, i) => (
                                        <img key={i} src={url} alt={`detail-${i}`} className="w-24 h-24 object-cover rounded" />
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedMessage.fileURL && (
                            <div className="mt-2">
                                <h4 className="font-semibold mb-1">File:</h4>
                                <a
                                    href={selectedMessage.fileURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Download File
                                </a>
                            </div>
                        )}
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
