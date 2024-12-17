// src/controllers/notification.controller.ts
import { Request, Response } from "express";
import NotificationService from "../services/notification.service";
import { NotificationType } from "../entities/Notification";
import logger from "../utils/logger";

interface AuthenticatedRequest extends Request {
    user: { id: number; email: string };
}

class NotificationController {
    static async createNotification(req: Request, res: Response): Promise<void> {
        try {
            const { receiverId, type, senderId, message, chatRoomId } = req.body;

            if (!receiverId || !type) {
                res.status(400).json({ message: "Receiver ID and notification type are required." });
                return;
            }

            if (!Object.values(NotificationType).includes(type)) {
                res.status(400).json({ message: "Invalid notification type." });
                return;
            }

            const notification = await NotificationService.createNotification(receiverId, type, senderId, message, chatRoomId);
            logger.info(`Created notification for receiver ID ${receiverId}`);
            res.status(201).json(notification);
        } catch (error: any) {
            logger.error(`Error creating notification: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async getNotificationsForUser(req: Request, res: Response): Promise<void> {
        try {
            const { id: userId } = (req as AuthenticatedRequest).user;
            const notifications = await NotificationService.getNotificationsForUser(userId);
            logger.info(`Fetched notifications for user ID ${userId}`);
            res.status(200).json(notifications);
        } catch (error: any) {
            logger.error(`Error fetching notifications: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const parsedNotificationId = parseInt(notificationId, 10);
            if (isNaN(parsedNotificationId)) {
                res.status(400).json({ message: "Invalid notification ID." });
                return;
            }

            const updatedNotification = await NotificationService.markAsRead(parsedNotificationId);
            if (!updatedNotification) {
                res.status(404).json({ message: "Notification not found." });
                return;
            }

            logger.info(`Marked notification ID ${parsedNotificationId} as read.`);
            res.status(200).json(updatedNotification);
        } catch (error: any) {
            logger.error(`Error marking notification as read: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    static async markAllAsReadForUser(req: Request, res: Response): Promise<void> {
        try {
            const { id: userId } = (req as AuthenticatedRequest).user;
            await NotificationService.markAllAsReadForUser(userId);
            logger.info(`Marked all notifications as read for user ID ${userId}`);
            res.status(200).json({ message: "All notifications marked as read." });
        } catch (error: any) {
            logger.error(`Error marking all notifications as read: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

export default NotificationController;
