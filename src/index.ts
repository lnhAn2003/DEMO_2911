import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { createServer } from "http";
import { Server } from "socket.io";
import logger from "./utils/logger";

import UserRouter from "./routes/user.routes";
import TaskRouter from "./routes/task.routes";

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
const io = new Server(httpServer);
app.set("io", io);

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.use("/users", UserRouter);
        app.use("/tasks", TaskRouter);        

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });

