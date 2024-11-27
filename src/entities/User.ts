import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Task } from "./Task";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name?: string;

    @Column()
    email?: string;

    @Column()
    password?: string;

    @OneToMany(() => Task, (task) => task.user)
    tasks?: Task[];
}