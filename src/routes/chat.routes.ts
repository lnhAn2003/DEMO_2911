// src/routes/chat.routes.ts
import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";
import ChatController from "../controllers/chat.controller";
import { uploadChatFiles } from "../utils/awsS3Chat";
import { checkMessageOwner } from "../middlewares/chatmessage.middlewares";

const router = Router();

// Chat Routes
router.post("/", Authenticate, ChatController.createChatRoom);
router.post("/:id/messages", Authenticate, uploadChatFiles, ChatController.sendMessage);
router.get("/user/:id", Authenticate, ChatController.getChatRoomsForUser);
router.get("/:id/messages", Authenticate, ChatController.getMessages);
router.get("/:chatRoomId/messages/:messageId", Authenticate, ChatController.getMessage);
router.patch("/delete", Authenticate, checkMessageOwner, ChatController.deleteMessage)

export default router;
