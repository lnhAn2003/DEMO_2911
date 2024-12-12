import "reflect-metadata"; //decorator assisstant for TypeOrm
import express from "express";
import cors from "cors";
import { AppDataSource, config } from "./data-source";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";

import UserRouter from "./routes/user.routes";
import TaskRouter from "./routes/task.routes";
import ChatRouter from "./routes/chat.routes";
import jwt from "jsonwebtoken";
import { User } from "./entities/User";
import { ChatRoom } from "./entities/ChatRoom";

const app = express();

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

const httpServer = createServer(app);
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
app.set("io", io);

io.use(async (socket: Socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    logger.info(`Received token: ${token}`);
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string };
    logger.info(`Decoded token: ${decoded}`);

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
    console.error('WebSocket Authentication error:', err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const user = (socket as any).user as User;
  logger.info(`User connected: ${user.email}`);

  socket.join(`user_${user.id}`);
  logger.info(`User ${user.email} joined their personal room: user_${user.id}`);

  user.chatRooms.forEach((chatRoom: ChatRoom) => {
    socket.join(`chatroom_${chatRoom.id}`);
    logger.info(`User ${user.email} joined chat room: chatroom_${chatRoom.id}`);
  });

  socket.on("sendMessage", async (data: { chatRoomId: number; content: string }) => {
    try {
      const ChatService = require("./services/chat.service").default;
      const message = await ChatService.sendMessage({
        chatRoomId: data.chatRoomId,
        senderId: user.id,
        content: data.content,
      });

      io.to(`chatroom_${data.chatRoomId}`).emit("newMessage", message);
      logger.info(`Message sent in chat room ${data.chatRoomId} by ${user.email}`);
    } catch (error: any) {
      logger.error(`Error sending message: ${error.message}`);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("ping", () => {
    console.log("Ping received, sending pong");
    socket.emit("pong");
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${user.email}`);
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    app.use("/users", UserRouter);
    app.use("/tasks", TaskRouter);
    app.use("/chats", ChatRouter);

    httpServer.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
