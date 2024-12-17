// src/routes/friend.routes.ts
import { Router } from "express";
import FriendController from "../controllers/friend.controller";
import { Authenticate } from "../middlewares/authentication.middlewares";

const router = Router();

router.post("/request", Authenticate, FriendController.sendFriendRequest);
router.post("/:friendRequestId/accept", Authenticate, FriendController.acceptFriendRequest);
router.post("/:friendRequestId/decline", Authenticate, FriendController.declineFriendRequest);
router.post("/block", Authenticate, FriendController.blockUser);
router.get("/", Authenticate, FriendController.getFriends);
router.get("/received", Authenticate, FriendController.getReceivedFriendRequests); 

export default router;
