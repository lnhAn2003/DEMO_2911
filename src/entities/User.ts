import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from "typeorm";
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


    @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.participants)
    chatRooms!: ChatRoom[];

    @OneToMany(() => ChatMessage, (message) => message.sender)
    chatMessages!: ChatMessage[];

    @OneToMany(() => Task, (task) => task.user)
    tasks!: Task[];
}