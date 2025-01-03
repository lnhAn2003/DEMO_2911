import { Request, Response, NextFunction } from "express";
import { ChatMessage } from "../entities/ChatMessage";
import logger from "../utils/logger";
import { AppDataSource } from "../data-source";

const chatMessageRepository = AppDataSource.getRepository(ChatMessage);

export interface messageUserRequest extends Request {
    user?: any;
    messageId?: any;
}

export const checkMessageOwner = async (req: messageUserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const message = await chatMessageRepository
        .createQueryBuilder("chatMessage")
        .where("chatMessage.id = :id", { id: req.body.messageId })
        .leftJoinAndSelect("chatMessage.sender", "user")
        .getOne( )

        if (!message) {
            res.status(404).json({ message: 'message not found' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const isOwner = message.sender.id === req.user.id;
        if (isOwner) {
            console.log(message.sender.id);
            console.log(req.user.id);
            console.log(isOwner);
            return next();
        } else {
            console.log(message.sender.id);
            console.log(req.user.id);
            console.log(isOwner);
            res.status(403).json({ message: 'Forbidden: You do not own this resource.' });
        }

    } catch (error: any) {
        logger.error("Checking message owner error !")
        res.status(500).json({ message: 'Server error (checkMessageOwner)'})
    }
}