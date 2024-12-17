// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import logger from "../utils/logger";
import ChatService from "../services/chat.service";

interface AuthenticatedRequest extends Request {
    user: { id: number; name: string, email: string };
}

class ChatController {
    static async createChatRoom(req: Request, res: Response): Promise<void> {
        try {
            const { name, participantIds } = req.body;

            if (!name || !Array.isArray(participantIds)) {
                res.status(400).json({ message: "Invalid input data" });
                return;
            }

            const chatRoom = await ChatService.createChatRoom(name, participantIds);
            logger.info("Created new chat room.");
            res.status(201).json(chatRoom);
        } catch (error: any) {
            logger.error(`Error creating chat room: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async getChatRoomsForUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: "Invalid user ID" });
                return;
            }

            const userChatRoom = await ChatService.getChatRoomsForUser(userId);
            logger.info(`Fetched chat rooms for user ID ${userId}`);
            res.status(200).json(userChatRoom);
        } catch (error: any) {
            logger.error(`Error fetching chat rooms: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const chatRoomId = parseInt(id, 10);
            if (isNaN(chatRoomId)) {
                res.status(400).json({ message: "Invalid chat room ID" });
                return;
            }

            const getMessages = await ChatService.getMessages(chatRoomId);
            logger.info(`Fetched messages for chat room ID ${chatRoomId}`);
            res.status(200).json(getMessages);
        } catch (error: any) {
            logger.error(`Error fetching messages: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async getMessage(req: Request, res: Response): Promise<void> {
        try {
            const { chatRoomId, messageId } = req.params;
            const parsedChatRoomId = parseInt(chatRoomId, 10);
            const parsedMessageId = parseInt(messageId, 10);

            if (isNaN(parsedChatRoomId) || isNaN(parsedMessageId)) {
                res.status(400).json({ message: "Invalid chat room ID or message ID." });
                return;
            }

            const message = await ChatService.getMessage(parsedChatRoomId, parsedMessageId);

            if (!message) {
                res.status(404).json({ message: "Message not found." });
                return;
            }

            logger.info(`Fetched message ID ${parsedMessageId} from chat room ID ${parsedChatRoomId}.`);
            res.status(200).json(message);
        } catch (error: any) {
            logger.error(`Error fetching message: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }

    static async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const chatRoomId = parseInt(id, 10);
            if (isNaN(chatRoomId)) {
                res.status(400).json({ message: "Invalid chat room ID" });
                return;
            }

            const { id: senderId } = (req as AuthenticatedRequest).user;
            const { content } = req.body;
            const sendMessage = await ChatService.sendMessage({ chatRoomId, senderId, content });
            logger.info(`User ID ${senderId} sent a message to chat room ID ${chatRoomId}`);
            res.status(201).json(sendMessage);
        } catch (error: any) {
            logger.error(`Error sending message: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

export default ChatController;
