// src/entities/ChatRoom.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { ChatMessage } from './ChatMessage';

export enum ChatRoomType {
    DIRECT = "DIRECT",
    GROUP = "GROUP"
}

@Entity()
export class ChatRoom {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({
        type: "enum",
        enum: ChatRoomType,
        default: ChatRoomType.GROUP
    })
    type!: ChatRoomType;

    @ManyToMany(() => User, (user) => user.chatRooms)
    @JoinTable({
        name: 'chatroom_users',
        joinColumn: { name: 'chatroom_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    participants!: User[];

    @OneToMany(() => ChatMessage, (message) => message.chatRoom)
    messages!: ChatMessage[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
