// src/services/friend.service.ts
import { AppDataSource } from "../data-source";
import { Friend, FriendStatus } from "../entities/Friend";
import { User } from "../entities/User";
import ChatService from "./chat.service";
import { Repository } from "typeorm";

const friendRepository: Repository<Friend> = AppDataSource.getRepository(Friend);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

class FriendService {
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

            friendRequest.status = FriendStatus.ACCEPTED;
            const updatedFriendRequest = await transactionalEntityManager.save(friendRequest);

            const chatRoom = await ChatService.createOrGetDirectChatRoom(friendRequest.requester.id, friendRequest.receiver.id);

            return { friend: updatedFriendRequest, chatRoom };
        });
    }

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
