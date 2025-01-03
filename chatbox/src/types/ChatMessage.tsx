import { ChangeEvent, FormEvent } from "react";

export interface MessageInputProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: FormEvent) => void;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  showIconPicker: boolean;
  setShowIconPicker: React.Dispatch<React.SetStateAction<boolean>>;
  onIconClick: (icon: string) => void;
  images: File[];
  removeImage: (index: number) => void;
  file: File | null;
  removeFile: () => void;
}