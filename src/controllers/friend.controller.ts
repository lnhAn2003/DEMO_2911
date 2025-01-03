// src/controllers/friend.controller.ts
import { Request, Response } from "express";
import FriendService from "../services/friend.service";
import logger from "../utils/logger";

interface AuthenticatedRequest extends Request {
    user: { id: number; email: string };
}

class FriendController {
    static async sendFriendRequest(req: Request, res: Response): Promise<void> {
        try {
            const { id: requesterId } = (req as AuthenticatedRequest).user;
            const { receiverId } = req.body;

            if (typeof receiverId !== "number") {
                res.status(400).json({ message: "Invalid receiver ID." });
                return;
            }

            const friendRequest = await FriendService.sendFriendRequest(requesterId, receiverId);
            
            logger.info(`User ID ${requesterId} sent a friend request to user ID ${receiverId}.`);
            res.status(201).json(friendRequest);
        } catch (error: any) {
            logger.error(`Error sending friend request: ${error.message}`);

            if (error.message.includes("cannot send a friend request to yourself")) {
                res.status(400).json({ message: error.message });
            } else if (error.message.includes("already")) {
                res.status(400).json({ message: error.message });
            } else if (error.message.includes("not found")) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Internal server error." });
            }
        }
    }

    static async acceptFriendRequest(req: Request, res: Response): Promise<void> {
        try {
            const { friendRequestId } = req.params;
            const requestId = parseInt(friendRequestId, 10);
            if (isNaN(requestId)) {
                res.status(400).json({ message: "Invalid friend request ID." });
                return;
            }

            const { friend, chatRoom } = await FriendService.acceptFriendRequest(requestId);
            logger.info(`Friend request ID ${requestId} accepted. Direct chat room ID ${chatRoom.id} created.`);
            res.status(200).json({ friend, chatRoom });
        } catch (error: any) {
            logger.error(`Error accepting friend request: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }

    static async declineFriendRequest(req: Request, res: Response): Promise<void> {
        try {
            const { friendRequestId } = req.params;
            const requestId = parseInt(friendRequestId, 10);
            if (isNaN(requestId)) {
                res.status(400).json({ message: "Invalid friend request ID." });
                return;
            }

            const declinedRequest = await FriendService.declineFriendRequest(requestId);
            logger.info(`Friend request ID ${requestId} declined.`);
            res.status(200).json(declinedRequest);
        } catch (error: any) {
            logger.error(`Error declining friend request: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }

    /**
     * Handles blocking a user.
     * Route: POST /friends/block
     */
    static async blockUser(req: Request, res: Response): Promise<void> {
        try {
            const { id: requesterId } = (req as AuthenticatedRequest).user;
            const { userIdToBlock } = req.body;
            if (typeof userIdToBlock !== "number") {
                res.status(400).json({ message: "Invalid user ID to block." });
                return;
            }

            const blocked = await FriendService.blockUser(requesterId, userIdToBlock);
            logger.info(`User ID ${requesterId} blocked user ID ${userIdToBlock}.`);
            res.status(200).json(blocked);
        } catch (error: any) {
            logger.error(`Error blocking user: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }

    static async getFriends(req: Request, res: Response): Promise<void> {
        try {
            const { id: userId } = (req as AuthenticatedRequest).user;
            const friends = await FriendService.getFriends(userId);
            logger.info(`Fetched friends for user ID ${userId}`);
            res.status(200).json(friends);
        } catch (error: any) {
            logger.error(`Error fetching friends: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }

    static async getReceivedFriendRequests(req: Request, res: Response): Promise<void> {
        try {
            const { id: userId } = (req as AuthenticatedRequest).user;
            const receivedRequests = await FriendService.getReceivedFriendRequests(userId);
            logger.info(`Fetched received friend requests for user ID ${userId}`);
            res.status(200).json(receivedRequests);
        } catch (error: any) {
            logger.error(`Error fetching received friend requests: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    }
}

export default FriendController;
