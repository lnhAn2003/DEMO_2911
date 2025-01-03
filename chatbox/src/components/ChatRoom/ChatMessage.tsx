import React, { useContext, useState } from 'react';
import { ChatMessageProps } from '../../../src/types/Entities';
import { AuthContext } from '../../../src/context/AuthContext';

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onClick }) => {
  const authContext = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!authContext) {
    return null; 
  }

  const { user } = authContext;
  const isCurrentUser = user?.id === message.sender.id;

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div
        className={`w-full flex pt-3 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        } items-start mb-4`}
      >
        {/* Avatar */}
        {!isCurrentUser && (
          <img
            src={message.sender.profileImageUrl || '/default-avatar.png'}
            alt="Sender Avatar"
            className="w-10 h-10 rounded-full object-cover mr-2 self-start"
          />
        )}

        <div
          onClick={onClick}
          className={`relative max-w-sm p-3 pt-0 rounded shadow hover:shadow-md transition cursor-pointer ${
            isCurrentUser ? 'bg-blue-200 text-left' : 'bg-green-200 text-left'
          }`}
        >
          {/* Sender Info */}
          {!isCurrentUser && (
            <div className="absolute top-0 left-0 -translate-y-full">
              <p className="font-semibold text-gray-800">
                {message.sender.name}
              </p>
            </div>
          )}

          {/* Message Content */}
          <p
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            className="mt-1 break-words text-gray-800"
          >
            {message.content}
          </p>

          {/* Render Images */}
          {message.imagesURL && message.imagesURL.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.imagesURL.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`message-img-${index}`}
                  className="w-50 h-50 object-cover rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleImageClick(url);
                  }}
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

        {/* Avatar (right) if current user */}
        {isCurrentUser && (
          <img
            src={message.sender.profileImageUrl || '/default-avatar.png'}
            alt="Sender Avatar"
            className="w-10 h-10 rounded-full object-cover ml-2 self-start"
          />
        )}
      </div>

      {/* Full-Screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal}  
        >
          <div className="relative max-w-3xl w-auto mx-auto p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full Size"
              className="min-w-[200px] min-h-[200px] sm:min-w-[300px] sm:min-h-[300px] md:min-w-[400px] md:min-h-[400px] max-w-screen max-h-screen rounded"
              />
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded hover:bg-opacity-75"
            >
              X
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessageComponent;
