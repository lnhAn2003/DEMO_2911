// src/components/ChatRoom/InputIcon.tsx
import React from 'react';
import { icons } from '../../../styles/emoji';

interface InputIconProps {
  showIconPicker: boolean;
  onIconClick: (icon: string) => void;
  onClose: () => void;
}

const InputIcon: React.FC<InputIconProps> = ({ showIconPicker, onIconClick, onClose }) => {
  if (!showIconPicker) return null;

  return (
    <div className="absolute bottom-12 right-2 bg-white border p-2 rounded shadow z-10 w-64 max-h-56 overflow-y-auto">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">Emoji Picker</span>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {icons.map((icn) => (
          <button
            key={icn}
            type="button"
            onClick={() => onIconClick(icn)}
            className="hover:bg-gray-100 rounded p-1"
          >
            {icn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputIcon;
