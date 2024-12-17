// src/services/notification.service.ts
import { AppDataSource } from "../data-source";
import { Notification, NotificationType } from "../entities/Notification";
import { User } from "../entities/User";

const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(User);

class NotificationService {

    static async createNotification(
        receiverId: number,
        type: NotificationType,
        senderId?: number,
        message?: string,
        chatRoomId?: number
    ): Promise<Notification> {
        const receiver = await userRepository.findOne({ where: { id: receiverId } });
        if (!receiver) {
            throw new Error("Receiver not found.");
        }

        let sender: User | undefined ;
        if (senderId) {
            const foundSender = await userRepository.findOne({ where: { id: senderId } });
            if (!foundSender) {
                throw new Error("Sender not found.");
            }
            sender = foundSender;
        }

        const notification = notificationRepository.create({
            receiver,
            sender,
            type,
            message,
            chatRoomId,
            isRead: false
        });

        return await notificationRepository.save(notification);
    }

    static async getNotificationsForUser(userId: number): Promise<Notification[]> {
        return await notificationRepository.find({
            where: { receiver: { id: userId } },
            relations: ["receiver", "sender"],
            order: { createdAt: "DESC" },
        });
    }

    static async markAsRead(notificationId: number): Promise<Notification | null> {
        const notification = await notificationRepository.findOne({
            where: { id: notificationId },
        });

        if (!notification) {
            return null;
        }

        notification.isRead = true;
        return await notificationRepository.save(notification);
    }

    static async markAllAsReadForUser(userId: number): Promise<void> {
        await notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ isRead: true })
            .where("receiver_id = :userId", { userId })
            .execute();
    }
}

export default NotificationService;
