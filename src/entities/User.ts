import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Task } from "./Task";
import { ChatRoom } from './ChatRoom';
import { ChatMessage } from './ChatMessage';

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


    @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.participants, {
        eager: true,
    })

    @JoinTable({
        name: "chatroom_users",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "chatroom_id", referencedColumnName: "id" },
    })
    chatRooms!: ChatRoom[];

    @OneToMany(() => ChatMessage, (message) => message.sender)
    chatMessages!: ChatMessage[];

    @OneToMany(() => Task, (task) => task.user)
    tasks!: Task[];
}