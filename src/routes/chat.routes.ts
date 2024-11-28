import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";
import ChatController from "../controllers/chat.controller";

const router = Router();

router.post("/", Authenticate, ChatController.createChatRoom);
router.get("/user/:id", Authenticate, ChatController.getChatRoomsForUser);
router.get("/:id", Authenticate, ChatController.getMessages);
router.patch("/:id", Authenticate, ChatController.sendMessage);

export default router;