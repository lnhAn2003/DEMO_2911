// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { ChatRoom } from './ChatRoom';
import { ChatMessage } from './ChatMessage';
import { Friend } from "./Friend";
import { Notification } from "./Notification";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({ nullable: true})
    profileImageUrl?: string;

    @Column({ nullable: true})
    profileDescription?: string;

    @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.participants, {
        eager: true,
    })
    chatRooms!: ChatRoom[];

    @OneToMany(() => ChatMessage, (message) => message.sender)
    chatMessages!: ChatMessage[];

    @OneToMany(() => Friend, (friend) => friend.requester)
    sentFriendRequests!: Friend[];

    @OneToMany(() => Friend, (friend) => friend.receiver)
    receivedFriendRequests!: Friend[];

    @OneToMany(() => Notification, (notification) => notification.receiver)
    notifications!: Notification[];
}