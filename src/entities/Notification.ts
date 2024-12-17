// src/entities/Notification.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";

export enum NotificationType {
    FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED",
    FRIEND_REQUEST_DECLINED = "FRIEND_REQUEST_DECLINED",
    NEW_MESSAGE = "NEW_MESSAGE",
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "receiver_id"})
    receiver!: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "sender_id" })
    sender?: User;

    @Column({
        type: "enum",
        enum: NotificationType,
    })
    type!: NotificationType;

    @Column({ nullable: true })
    message?: string;

    @Column({ nullable: true })
    chatRoomId?: number;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}