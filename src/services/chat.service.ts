import { AppDataSource } from "../data-source";
import { ChatRoom } from "../entities/ChatRoom";
import { ChatMessage } from "../entities/ChatMessage";
import { User } from "../entities/User";
import { In } from "typeorm";

const userRepository = AppDataSource.getRepository(User);
const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

class ChatService {
    static async createChatRoom(name: string, participantIds: number[]): Promise<ChatRoom> {

        const uniqueParticipantIds = Array.from(new Set(participantIds));

        const participants = await userRepository.find({
            where: {
                id: In(uniqueParticipantIds),
            },
        });

        if(participants.length !== uniqueParticipantIds.length) {
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

    static async sendMessage(chatRoomId: number, senderId: number, content: string): Promise<ChatMessage> {
        const chatRoom = await chatRoomRepository.findOne({
            where: { id: chatRoomId },
            relations: ["participants"],
        });
    
        if (!chatRoom) {
            throw new Error("Chat room not found.");
        }

        const isParticipant = chatRoom.participants.some(participant => participant.id === senderId);
        if (!isParticipant) {
            throw new Error("Sender is not a participant of the chat room.");
        }
    
        const sender = await userRepository.findOne({ where: { id: senderId } });
        if (!sender) {
            throw new Error("Sender not found.");
        }

        const message = chatMessageRepository.create({
            content,
            chatRoom,
            sender,
        });

        return await chatMessageRepository.save(message);
    }

    static async getMessages(chatRoomId: number): Promise<ChatMessage[]> {
        const messages = await chatMessageRepository.find({
            where: {
                chatRoom: {
                    id: chatRoomId,
                },
            },
            relations: ["sender"],
            order: {
                createdAt: "ASC",
            },
        });
    
        return messages;
    }
}

export default ChatService;