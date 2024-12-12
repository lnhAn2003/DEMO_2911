import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @ManyToOne(() => User, (user) => user.chatMessages, { eager: true })
    @JoinColumn({ name: 'sender_id' })
    sender!: User;

    @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
    @JoinColumn({ name: 'chat_room_id' })
    chatRoom!: ChatRoom;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
