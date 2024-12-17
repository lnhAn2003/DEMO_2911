// src/services/friend.service.ts
import { AppDataSource } from "../data-source";
import { Friend, FriendStatus } from "../entities/Friend";
import { User } from "../entities/User";
import ChatService from "./chat.service"; // Ensure this service exists
import { Repository } from "typeorm";

const friendRepository: Repository<Friend> = AppDataSource.getRepository(Friend);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

class FriendService {
    /**
     * Sends a friend request from requester to receiver.
     * @param requesterId - ID of the user sending the request.
     * @param receiverId - ID of the user receiving the request.
     * @returns The created Friend entity.
     */
    static async sendFriendRequest(requesterId: number, receiverId: number): Promise<Friend> {
        if (requesterId === receiverId) {
            throw new Error("You cannot send a friend request to yourself.");
        }

        const [requester, receiver] = await Promise.all([
            userRepository.findOne({ where: { id: requesterId } }),
            userRepository.findOne({ where: { id: receiverId } }),
        ]);

        if (!requester) {
            throw new Error("Requester not found.");
        }

        if (!receiver) {
            throw new Error("Receiver not found.");
        }

        const existingRequest = await friendRepository.findOne({
            where: [
                { requester: { id: requesterId }, receiver: { id: receiverId } },
                { requester: { id: receiverId }, receiver: { id: requesterId } },
            ],
        });

        if (existingRequest) {
            if (existingRequest.status === FriendStatus.PENDING) {
                throw new Error("A friend request is already pending between these users.");
            } else if (existingRequest.status === FriendStatus.ACCEPTED) {
                throw new Error("Users are already friends.");
            } else if (existingRequest.status === FriendStatus.BLOCKED) {
                throw new Error("You have blocked this user.");
            }
        }

        const friendRequest = friendRepository.create({
            requester,
            receiver,
            status: FriendStatus.PENDING,
        });

        return await friendRepository.save(friendRequest);
    }

    /**
     * Accepts a friend request.
     * @param friendRequestId - ID of the friend request to accept.
     * @returns An object containing the updated Friend entity and the created ChatRoom.
     */
    static async acceptFriendRequest(friendRequestId: number): Promise<{ friend: Friend; chatRoom: any }> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const friendRequest = await transactionalEntityManager.findOne(Friend, {
                where: { id: friendRequestId },
                relations: ["requester", "receiver"],
            });

            if (!friendRequest) {
                throw new Error("Friend request not found.");
            }

            if (friendRequest.status !== FriendStatus.PENDING) {
                throw new Error("This request is not pending and cannot be accepted.");
            }

            // Update the status to ACCEPTED
            friendRequest.status = FriendStatus.ACCEPTED;
            const updatedFriendRequest = await transactionalEntityManager.save(friendRequest);

            // Create or retrieve the direct chat room between the two users
            const chatRoom = await ChatService.createOrGetDirectChatRoom(friendRequest.requester.id, friendRequest.receiver.id);

            return { friend: updatedFriendRequest, chatRoom };
        });
    }

    /**
     * Declines a friend request.
     * @param friendRequestId - ID of the friend request to decline.
     * @returns The declined Friend entity.
     */
    static async declineFriendRequest(friendRequestId: number): Promise<Friend> {
        const friendRequest = await friendRepository.findOne({
            where: { id: friendRequestId },
            relations: ["requester", "receiver"],
        });

        if (!friendRequest) {
            throw new Error("Friend request not found.");
        }

        if (friendRequest.status !== FriendStatus.PENDING) {
            throw new Error("This request is not pending and cannot be declined.");
        }

        await friendRepository.delete(friendRequestId);
        return friendRequest;
    }

    /**
     * Blocks a user.
     * @param requesterId - ID of the user performing the block.
     * @param userIdToBlock - ID of the user to be blocked.
     * @returns The updated or newly created Friend entity with status BLOCKED.
     */
    static async blockUser(requesterId: number, userIdToBlock: number): Promise<Friend> {
        if (requesterId === userIdToBlock) {
            throw new Error("You cannot block yourself.");
        }

        let friendRelation = await friendRepository.findOne({
            where: [
                { requester: { id: requesterId }, receiver: { id: userIdToBlock } },
                { requester: { id: userIdToBlock }, receiver: { id: requesterId } },
            ],
            relations: ["requester", "receiver"],
        });

        if (!friendRelation) {
            const [requester, receiver] = await Promise.all([
                userRepository.findOne({ where: { id: requesterId } }),
                userRepository.findOne({ where: { id: userIdToBlock } }),
            ]);

            if (!requester || !receiver) {
                throw new Error("Requester or user to block not found.");
            }

            friendRelation = friendRepository.create({
                requester,
                receiver,
                status: FriendStatus.BLOCKED,
            });
        } else {
            friendRelation.status = FriendStatus.BLOCKED;
        }

        return await friendRepository.save(friendRelation);
    }

    /**
     * Retrieves all friends of the authenticated user.
     * @param userId - ID of the authenticated user.
     * @returns An array of User entities representing friends.
     */
    static async getFriends(userId: number): Promise<User[]> {
        const friendRelations = await friendRepository.find({
            where: [
                { requester: { id: userId }, status: FriendStatus.ACCEPTED },
                { receiver: { id: userId }, status: FriendStatus.ACCEPTED },
            ],
            relations: ["requester", "receiver"],
        });

        const friends = friendRelations.map((fr) => {
            return fr.requester.id === userId ? fr.receiver : fr.requester;
        });

        return friends;
    }

    /**
     * Retrieves all received friend requests for the authenticated user.
     * @param userId - ID of the authenticated user.
     * @returns An array of Friend entities representing received friend requests.
     */
    static async getReceivedFriendRequests(userId: number): Promise<Friend[]> {
        const receivedRequests = await friendRepository.find({
            where: {
                receiver: { id: userId },
                status: FriendStatus.PENDING,
            },
            relations: ["requester", "receiver"],
        });
        return receivedRequests;
    }
}

export default FriendService;
