import { Request, Response } from "express";
import logger from "../utils/logger";
import ChatService from "../services/chat.service";

interface AuthenticatedRequest extends Request {
    user: { id: number; email: string };
}

class ChatController {
    static async createChatRoom(req: Request, res: Response): Promise<void> {
        try {
            const { name, participantIds } = req.body;

            if (!name || !Array.isArray(participantIds)) {
                res.status(400).json({ message: "Invalid input data" });
            }

            const chatRoom = await ChatService.createChatRoom(name, participantIds);
            logger.info("Created new chat room.");
            res.status(201).json(chatRoom);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getChatRoomsForUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            const userChatRoom = await ChatService.getChatRoomsForUser(userId);
            logger.info("Get new chat room based on user id.");
            res.status(201).json(userChatRoom);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const chatRoomId = parseInt(id, 10);
            const getMessages = await ChatService.getMessages(chatRoomId);
            logger.info("Get all chat room message.");
            res.status(201).json(getMessages);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const chatRoomId = parseInt(id, 10);
            const { id: senderId } = (req as AuthenticatedRequest).user;
            const { content } = req.body;
            const sendMessage = await ChatService.sendMessage(chatRoomId, senderId, content)
            logger.info("Send message from user.");
            res.status(201).json(sendMessage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    
}

export default ChatController;