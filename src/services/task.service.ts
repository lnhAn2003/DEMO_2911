import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";

const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);

class TaskService {
    public static async getAllTask(): Promise<Task[]> {
        return await taskRepository.find();
    }

    public static async getTaskById(id: number): Promise<Task | null> {
        return await taskRepository.findOne({ where: { id } });
    }

    public static async createTask(userId: number, taskData: Partial<Task>): Promise<Task> {
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new Error("User not found");
        }

        const task = taskRepository.create({
            user, 
            ...taskData,
        });

        return await taskRepository.save(task);
    }

    public static async updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
        await taskRepository.update(id, taskData);
        const updateTask = await taskRepository.findOne({ where: { id } });
        return updateTask;
    }

    public static async deleteTask(id: number): Promise<Task | null> { 
        const taskToDelete = await taskRepository.findOne({ where: { id } }); 
        await taskRepository.delete(id); 
        return taskToDelete; }
}

export default TaskService;