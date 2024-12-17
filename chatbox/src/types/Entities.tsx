// src/Entities.tsx

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  profileDescription?: string;
}

export enum ChatRoomType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export interface ChatRoom {
  id: number;
  name: string;
  type: ChatRoomType;
  participants: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Sender {
  profileImageUrl: string;
  id: number;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  imagesURL?: string[];
  fileURL?: string;
  sender: Sender;
  chatRoom: ChatRoom;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  onClick?: () => void;
}

export enum FriendStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  BLOCKED = "BLOCKED",
}

export interface Friend {
  id: number;
  requester: User;
  receiver: User;
  status: FriendStatus;
}

export enum NotificationType {
  FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
  FRIEND_REQUEST_DECLINED = "FRIEND_REQUEST_DECLINED",
  NEW_MESSAGE = "NEW_MESSAGE",
}

export interface Notification {
  id: number;
  receiver: User;
  sender?: User;
  type: NotificationType;
  message?: string;
  chatRoomId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
