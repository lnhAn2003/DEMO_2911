// pages/chat/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useSocketContext } from '../../src/context/SocketContext';
import { fetchChatRoom } from '../../src/serverside/chatRooms';
import { fetchChatMessage } from '../../src/serverside/chatMessage';
import { ChatMessage, ChatRoom, ChatRoomType } from '../../src/types/Entities';
import axiosInstance from '../../src/utils/axiosInstance';
import useAuth from '../../src/hooks/useAuth';
import TypingIndicator from '@/components/TypingIndicator';

// Import your splitted components
import ChatMessageComponent from '../../src/components/ChatRoom/ChatMessage';
import MessageInput from '../../src/components/ChatRoom/MessageInput';

const MAX_IMAGES = 5;

const ChatRoomPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { socket } = useSocketContext();
  const { user } = useAuth();

  // Chat room & messages
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  // Input states
  const [newMessage, setNewMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Typing
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Icon picker
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Load chat room
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
    if (id) loadChatRoom();
  }, [id]);

  // 2. Typing events
  useEffect(() => {
    if (!id || typeof id !== 'string' || !socket || !user) return;

    let typingTimeout: NodeJS.Timeout;

    const handleTyping = () => {
      socket.emit("typing", { roomId: id, userName: user.name });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", { roomId: id, userName: user.name });
      }, 1000);
    };

    const inputElement = document.getElementById("message-input");
    inputElement?.addEventListener("input", handleTyping);

    return () => {
      clearTimeout(typingTimeout);
      inputElement?.removeEventListener("input", handleTyping);
    };
  }, [id, socket, user]);

  // 3. Listen for new messages & typing updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };
    const handleUpdateTypingUsers = (users: string[]) => {
      setTypingUsers(users);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on("updateTypingUsers", handleUpdateTypingUsers);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off("updateTypingUsers", handleUpdateTypingUsers);
    };
  }, [socket]);

  // 4. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Sending messages
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' && images.length === 0 && !file) return;
    if (typeof id !== 'string') {
      console.error('Chat room ID is not a string:', id);
      setError('Invalid chat room ID.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      images.forEach((img) => formData.append('images', img));
      if (file) formData.append('file', file);

      await axiosInstance.post(`/chats/${id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset
      setNewMessage('');
      setImages([]);
      setFile(null);

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message.');
    }
  };

  // 6. Single message detail
  const handleFetchMessage = async (messageId: number) => {
    if (typeof id !== 'string') {
      console.error('Chat room ID is not a string:', id);
      setError('Invalid chat room ID.');
      return;
    }
    const message = await fetchChatMessage(id, messageId.toString());
    if (message) setSelectedMessage(message);
    else setError('Failed to fetch the selected message.');
  };
  const handleCloseMessageDetail = () => setSelectedMessage(null);

  // 7. Input logic for images & file
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const newImages = [...images, ...selectedFiles].slice(0, MAX_IMAGES);
    setImages(newImages);
  };
  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };
  const removeFile = () => setFile(null);

  // 8. Icon picker
  const onIconClick = (icon: string) => {
    setNewMessage((prev) => prev + icon);
    setShowIconPicker(false);
  };

  // 9. Error UI
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

  // 10. Render
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white p-4 shadow flex items-center justify-between">
        <h2 className="text-2xl font-bold">{chatRoom ? chatRoom.name : 'Chat Room'}</h2>
      </header>

      {/* MESSAGES */}
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

            {/* TYPING INDICATOR */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-500">
                <TypingIndicator />
                <p className="text-sm">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white p-4 shadow">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleImageChange={handleImageChange}
          handleFileChange={handleFileChange}
          imageInputRef={imageInputRef}
          fileInputRef={fileInputRef}
          showIconPicker={showIconPicker}
          setShowIconPicker={setShowIconPicker}
          onIconClick={onIconClick}
          images={images}
          removeImage={removeImage}
          file={file}
          removeFile={removeFile}
        />
      </footer>

      {/* SELECTED MESSAGE POPUP */}
      {selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-2">Message Details</h3>
            <p>
              <strong>Sender:</strong> {selectedMessage.sender.name} ({selectedMessage.sender.email})
            </p>
            <p>
              <strong>Content:</strong> {selectedMessage.content}
            </p>
            <p>
              <strong>Sent At:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
            </p>

            {selectedMessage.imagesURL && selectedMessage.imagesURL.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold mb-1">Images:</h4>
                <div className="flex space-x-2 flex-wrap">
                  {selectedMessage.imagesURL.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`detail-${i}`}
                      className="w-24 h-24 object-cover rounded"
                    />
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
