// src/services/chat.service.ts
import { AppDataSource } from "../data-source";
import { ChatRoom } from "../entities/ChatRoom";
import { ChatMessage } from "../entities/ChatMessage";
import { User } from "../entities/User";
import { In } from "typeorm";

const userRepository = AppDataSource.getRepository(User);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

interface SendMessageParams {
    chatRoomId: number;
    senderId: number;
    content: string;
    imagesURL?: string[];
    fileURL?: string;
  }

class ChatService {
    static async createChatRoom(name: string, participantIds: number[]): Promise<ChatRoom> {
        const uniqueParticipantIds = Array.from(new Set(participantIds));

        const participants = await userRepository.find({
            where: {
                id: In(uniqueParticipantIds),
            },
        });

        if (participants.length !== uniqueParticipantIds.length) {
            const foundIds = participants.map(user => user.id);
            const notFoundIds = uniqueParticipantIds.filter(id => !foundIds.includes(id));
            throw new Error(`Users with IDs ${notFoundIds.join(", ")} not found.`);
        }

        const chatRoom = chatRoomRepository.create({
            name,
            participants,
        });

        return await chatRoomRepository.save(chatRoom);
    }

    static async getChatRoomsForUser(userId: number): Promise<ChatRoom[]> {
        const chatRooms = await chatRoomRepository.find({
            where: {
                participants: {
                    id: userId,
                },
            },
            relations: ["participants", "messages"],
        });

        return chatRooms;
    }

    static async sendMessage({ chatRoomId, senderId, content, imagesURL, fileURL }: SendMessageParams): Promise<ChatMessage> {
        const chatRoom = await chatRoomRepository.findOne({
          where: { id: chatRoomId },
          relations: ["participants"],
        });
    
        if (!chatRoom) {
          throw new Error("Chat room not found.");
        }
    
        const sender = await userRepository.findOne({ where: { id: senderId } });
        if (!sender) {
          throw new Error("Sender not found.");
        }
    
        const isParticipant = chatRoom.participants.some(participant => participant.id === senderId);
        if (!isParticipant) {
          throw new Error("Sender is not a participant of the chat room.");
        }
    
        const message = chatMessageRepository.create({
          content,
          sender,
          chatRoom,
          imagesURL,
          fileURL,
        });
    
        await chatMessageRepository.save(message);
    
        const savedMessage = await chatMessageRepository.findOne({
          where: { id: message.id },
          relations: ["sender"],
        });
    
        if (!savedMessage) {
          throw new Error("Failed to retrieve the saved message.");
        }
    
        return savedMessage;
      }

    static async getMessages(chatRoomId: number): Promise<ChatMessage[]> {
        const messages = await chatMessageRepository
            .createQueryBuilder("message")
            .leftJoinAndSelect("message.sender", "sender") 
            .leftJoinAndSelect("message.chatRoom", "chatRoom")
            .where("message.chatRoom.id = :chatRoomId", { chatRoomId })
            .orderBy("message.createdAt", "ASC")
            .getMany(); 
        return messages;
    }

    static async getMessage(chatRoomId: number, messageId: number): Promise<ChatMessage | null> {
        const chatRoom = await chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ["participants"],
        });

        if (!chatRoom) {
            throw new Error("Chat room not found.");
        }

        const message = await chatMessageRepository.findOne({
            where: { id: messageId, chatRoom: { id: chatRoomId } },
            relations: ["sender", "chatRoom"],
        });

        return message || null;
    }
}

export default ChatService;
