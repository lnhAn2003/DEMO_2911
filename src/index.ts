import "reflect-metadata"; 
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { createServer } from "http";
import logger from "./utils/logger";

import UserRouter from "./routes/user.routes";
import ChatRouter from "./routes/chat.routes";
import FriendRouter from "./routes/friend.routes";
import NotificationRouter from "./routes/notification.routes";

import { initializeSocketIO } from "./SocketIO";

const app = express();

const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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

const io = initializeSocketIO(httpServer);
app.set("io", io);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.use("/users", UserRouter);
        app.use("/chats", ChatRouter);
        app.use("/friends", FriendRouter);
        app.use("/notifications", NotificationRouter);

        httpServer.listen(4000, () => {
            console.log("Server is running on port 4000");
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
