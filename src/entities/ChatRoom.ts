import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { ChatMessage } from './ChatMessage';

@Entity()
export class ChatRoom {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @ManyToMany(() => User, (user) => user.chatRooms, { eager: true })
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
