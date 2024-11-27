import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User
    
 } from "./User";
@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    title?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: false })
    isCompleted?: boolean;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @ManyToOne(() => User, (user) => user.tasks, { nullable: false })
    @JoinColumn({ name: "userId" })
    user?: User;
}