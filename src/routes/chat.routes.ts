// src/routes/chat.routes.ts
import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";
import ChatController from "../controllers/chat.controller";

const router = Router();

// Chat Routes
router.post("/", Authenticate, ChatController.createChatRoom);
router.get("/user/:id", Authenticate, ChatController.getChatRoomsForUser);
router.get("/:id/messages", Authenticate, ChatController.getMessages);
router.get("/:chatRoomId/messages/:messageId", Authenticate, ChatController.getMessage);
router.post("/:id/messages", Authenticate, ChatController.sendMessage);

export default router;