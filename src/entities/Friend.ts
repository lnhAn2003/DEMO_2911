// src/entities/Friend.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./User";

export enum FriendStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    BLOCKED = "BLOCKED"
}

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.sentFriendRequests, { nullable: false })
    requester!: User;

    @ManyToOne(() => User, (user) => user.receivedFriendRequests, { nullable: false })
    receiver!: User;

    @Column({
        type: "enum",
        enum: FriendStatus,
        default: FriendStatus.PENDING
    })
    status!: FriendStatus;
}
