// src/components/ChatRoom/MessageInput.tsx
import React from 'react';
import InputIcon from './InputIcon';

import { MessageInputProps } from '../../../src/types/ChatMessage';

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleImageChange,
  handleFileChange,
  imageInputRef,
  fileInputRef,
  showIconPicker,
  setShowIconPicker,
  onIconClick,
  images,
  removeImage,
  file,
  removeFile,
}) => {
  return (
    <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
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

      <div className="flex items-center space-x-2 relative">
        <textarea
          id="message-input"
          className="flex-1 border px-3 py-2 rounded pr-3"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={2}
          // SHIFT+Enter => newline, Enter => send
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />

        {/* EMOJI BUTTON */}
        <button
          type="button"
          onClick={() => setShowIconPicker((prev) => !prev)}
          className="p-2 rounded hover:bg-gray-200"
          title="Add Emoji"
        >
          😀
        </button>

        {/* ICON PICKER (conditionally rendered) */}
        <InputIcon
          showIconPicker={showIconPicker}
          onIconClick={onIconClick}
          onClose={() => setShowIconPicker(false)}
        />

        {/* IMAGES BUTTON */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 rounded hover:bg-gray-200"
          title="Attach Images"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7h2l2-2h10l2 2h2m-2 0h-4.5M12 5v.01M5 7h2m12 0h2M5 7l.01 10M19 7l-.01 10M5 17h14m-7-4.5a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
        </button>

        {/* FILE BUTTON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-gray-200"
          title="Attach File"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 10.29l-7.07 7.07a5.5 5.5 0 01-7.78 0L4.71 14.4a5.5 5.5 0 010-7.78L11.78.64a5.5 5.5 0 017.78 7.78l-6.36 6.36" />
          </svg>
        </button>

        {/* SEND BUTTON */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      {/* Hidden File Inputs */}
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
    </form>
  );
};

export default MessageInput;
