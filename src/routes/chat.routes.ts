import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";
import ChatController from "../controllers/chat.controller";

const router = Router();

router.post("/", ChatController.createChatRoom);
router.get("/user/:id", ChatController.getChatRoomsForUser);
router.get("/:id", ChatController.getMessages);
router.patch("/:id", Authenticate, ChatController.sendMessage);
router.get("/:chatRoomId/messages/:messageId", Authenticate, ChatController.getMessage);

export default router;