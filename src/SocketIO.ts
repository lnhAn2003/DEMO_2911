// src/SocketIO.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AppDataSource, config } from "./data-source";
import logger from "./utils/logger";
import { User } from "./entities/User";
import { ChatRoom } from "./entities/ChatRoom";

export function initializeSocketIO(httpServer: HttpServer) {
    const allowedOrigins = ["http://localhost:3000"];
    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 30000,
        transports: ['websocket', 'polling'],
    });

    // Authentication Middleware
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            logger.info(`Received token: ${token}`);
            if (!token) {
                return next(new Error("Authentication error: Token missing"));
            }

            const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string };
            logger.info(`Decoded token: ${JSON.stringify(decoded)}`);

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: { id: decoded.id },
                relations: ["chatRooms"],
            });

            if (!user) {
                return next(new Error("Authentication error"));
            }

            (socket as any).user = user;
            next();
        } catch (err: any) {
            logger.error(`WebSocket Authentication error: ${err.message}`);
            next(new Error("Authentication error"));
        }
    });

    // Connection Event
    io.on("connection", (socket) => {
        const user = (socket as any).user as User;
        logger.info(`User connected: ${user.email}`);

        // Join personal room and chat rooms
        socket.join(`user_${user.id}`);
        logger.info(`User ${user.email} joined their personal room: user_${user.id}`);

        user.chatRooms.forEach((chatRoom: ChatRoom) => {
            socket.join(`chatroom_${chatRoom.id}`);
            logger.info(`User ${user.email} joined chat room: chatroom_${chatRoom.id}`);
        });

        // Handle send message event
        socket.on("sendMessage", async (data: { chatRoomId: number; content: string }) => {
            try {
                const ChatService = require("./services/chat.service").default;
                const NotificationService = require("./services/notification.service").default;

                const message = await ChatService.sendMessage({
                    chatRoomId: data.chatRoomId,
                    senderId: user.id,
                    content: data.content,
                });

                io.to(`chatroom_${data.chatRoomId}`).emit("newMessage", message);
                logger.info(`Message sent in chat room ${data.chatRoomId} by ${user.email}`);

                // Send notification to other participants
                const chatRoomRepository = AppDataSource.getRepository(ChatRoom);
                const chatRoom = await chatRoomRepository.findOne({
                    where: { id: data.chatRoomId },
                    relations: ["participants"],
                });

                if (chatRoom) {
                    for (const participant of chatRoom.participants) {
                        if (participant.id !== user.id) {
                            const notification = await NotificationService.createNotification(
                                participant.id,
                                "NEW_MESSAGE",
                                user.id,
                                `New message in ${chatRoom.name}`,
                                chatRoom.id
                            );
                            io.to(`user_${participant.id}`).emit("newNotification", notification);
                        }
                    }
                }
            } catch (error: any) {
                logger.error(`Error sending message: ${error.message}`);
                socket.emit("error", { message: error.message });
            }
        });

        // Friend Request Event Example
        socket.on("sendFriendRequest", async (data: { receiverId: number }) => {
            try {
                const FriendService = require("./services/friend.service").default;
                const NotificationService = require("./services/notification.service").default;

                const friendRequest = await FriendService.sendFriendRequest(user.id, data.receiverId);

                // Notify the receiver
                io.to(`user_${data.receiverId}`).emit("newFriendRequest", friendRequest);

                const notification = await NotificationService.createNotification(
                    data.receiverId,
                    "FRIEND_REQUEST_RECEIVED",
                    user.id,
                    `You have a new friend request from ${user.email}`
                );

                io.to(`user_${data.receiverId}`).emit("newNotification", notification);
            } catch (error: any) {
                logger.error(`Error sending friend request: ${error.message}`);
                socket.emit("error", { message: error.message });
            }
        });

        socket.on("ping", () => {
            socket.emit("pong");
        });

        socket.on("disconnect", () => {
            logger.info(`User disconnected: ${user.email}`);
        });
    });

    return io;
}
