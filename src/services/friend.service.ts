// src/services/friend.service.ts
import { AppDataSource } from "../data-source";
import { Friend, FriendStatus } from "../entities/Friend";
import { User } from "../entities/User";

const friendRepository = AppDataSource.getRepository(Friend);
const userRepository = AppDataSource.getRepository(User);

class FriendService {
    static async sendFriendRequest(requesterId: number, receiverId: number): Promise<Friend> {
        if (requesterId === receiverId) {
            throw new Error("You cannot send a friend request to yourself.");
        }

        const [requester, receiver] = await Promise.all([
            userRepository.findOne({ where: { id: requesterId } }),
            userRepository.findOne({ where: { id: receiverId } }),
        ]);

        if (!requester || !receiver) {
            throw new Error("Requester or Receiver not found.");
        }

        const existingRequest = await friendRepository.findOne({
            where: [
                { requester: { id: requesterId }, receiver: { id: receiverId } },
                { requester: { id: receiverId }, receiver: { id: requesterId } },
            ],
        });

        if (existingRequest) {
            throw new Error("A friend request already exists between these users.");
        }

        const friendRequest = friendRepository.create({
            requester,
            receiver,
            status: FriendStatus.PENDING,
        });

        return await friendRepository.save(friendRequest);
    }

    static async acceptFriendRequest(friendRequestId: number): Promise<Friend> {
        const friendRequest = await friendRepository.findOne({ 
            where: { id: friendRequestId },
            relations: ["requester", "receiver"]
        });
        
        if (!friendRequest) {
            throw new Error("Friend request not found.");
        }

        if (friendRequest.status !== FriendStatus.PENDING) {
            throw new Error("This request is not pending and cannot be accepted.");
        }

        friendRequest.status = FriendStatus.ACCEPTED;
        return await friendRepository.save(friendRequest);
    }

    static async declineFriendRequest(friendRequestId: number): Promise<Friend> {
        const friendRequest = await friendRepository.findOne({ 
            where: { id: friendRequestId },
            relations: ["requester", "receiver"]
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
            relations: ["requester", "receiver"]
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
                { receiver: { id: userId }, status: FriendStatus.ACCEPTED }
            ],
            relations: ["requester", "receiver"]
        });

        const friends = friendRelations.map(fr => {
            return fr.requester.id === userId ? fr.receiver : fr.requester;
        });

        return friends;
    }
}

export default FriendService;
