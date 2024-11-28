import "reflect-metadata";
import express from "express";
import { AppDataSource, config } from "./data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";

import UserRouter from "./routes/user.routes";
import TaskRouter from "./routes/task.routes";
import ChatRouter from "./routes/chat.routes";
import jwt from 'jsonwebtoken';
import { User } from './entities/User';

const app = express();
app.use(express.json());

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});
app.set("io", io);

io.use(async (socket: Socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.id },
            relations: ["chatRooms"], 
        });

        if (!user) {
            return next(new Error('Authentication error'));
        }

        (socket as any).user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    const user = (socket as any).user as User;
    logger.info(`User connected: ${user.email}`);

    socket.join(`user_${user.id}`);
    logger.info(`User ${user.email} joined their personal room: user_${user.id}`);

    user.chatRooms.forEach((chatRoom) => {
        socket.join(`chatroom_${chatRoom.id}`);
        logger.info(`User ${user.email} joined chat room: chatroom_${chatRoom.id}`);
    });

    socket.on('sendMessage', async (data: { chatRoomId: number; content: string }) => {
        try {
            const ChatService = require('./services/chat.service').default;
            const message = await ChatService.sendMessage({
                chatRoomId: data.chatRoomId,
                senderId: user.id,
                content: data.content,
            });

            io.to(`chatroom_${data.chatRoomId}`).emit('newMessage', message);
            logger.info(`Message sent in chat room ${data.chatRoomId} by ${user.email}`);
        } catch (error: any) {
            logger.error(`Error sending message: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${user.email}`);
    });
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.use("/users", UserRouter);
        app.use("/tasks", TaskRouter);
        app.use("/chats", ChatRouter);

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });

