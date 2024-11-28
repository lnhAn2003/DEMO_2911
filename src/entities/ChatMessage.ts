import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { ChatRoom } from './ChatRoom';

@Entity()
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @ManyToOne(() => User, (user) => user.chatMessages, { eager: true, nullable: false })
    sender!: User;

    @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, { nullable: false })
    chatRoom!: ChatRoom;

    @CreateDateColumn()
    createdAt!: Date;
}
