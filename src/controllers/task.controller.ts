import { Request, Response } from "express";
import TaskService from "../services/task.service";
import logger from "../utils/logger";

interface AuthenticatedRequest extends Request {
    user: { id: number; email: string };
}

export class TaskController {
    static async getAllTasks(req: Request, res: Response): Promise<void>  {
        try {
            const tasks = await TaskService.getAllTask();
            logger.info("Fetching all tasks");
            res.status(200).json(tasks);
        } catch (error: any) {
            res.status(500).json({ message: 'An error occurred while searching the task.', error: error.message });
        }
    }

    static async getTaskById(req: Request, res: Response): Promise<void>  {
        try {
            const { id } = req.params;
            const taskId = parseInt(id, 10);
            if (isNaN(taskId)) {
                res.status(400).json({ message: "Invalid task ID " });
            }

            const task = await TaskService.getTaskById(taskId);

            if (!task) {
                res.status(404).json({ message: "Task not found" });
                logger.error(`Task with ID ${taskId} doesn't exists in database !`);
            } else {
                logger.info(`Task with ID ${taskId} fetched successfully !`);
            }
            res.status(200).json(task);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async createTask(req: Request, res: Response): Promise<void>  {
        try {
            const { id: userId } = (req as AuthenticatedRequest).user;
            const task = req.body;

            if (!userId) {
                res.status(401).json({ message: "Unauthorized: Login required" });
                return;
            }

            const result = await TaskService.createTask(userId, task);

            const io = req.app.get("io");
            io.emit("taskCreated", result);

            logger.info("Creating tasks successfully");
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ message: 'An error occurred while creating the task.', error: error.message });
        }
    }

    static async updateTask(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const taskId = parseInt(id, 10);
            if (isNaN(taskId)) {
                res.status(400).json({ message: "Invalid task ID !"});
            }

            const result = await TaskService.updateTask(taskId, req.body);
            if (!result) {
                res.status(404).json({ message: "Task not found" });
            }
            const updatedTask = await TaskService.getTaskById(taskId);
            logger.info("Updating tasks");
            res.status(200).json({ data: updatedTask, message: "Task updated successfully." });
        } catch (error: any) {
            res.status(500).json({ message: 'An error occurred while updating the task.', error: error.message });
        }
    }

    static async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const taskId = parseInt(id, 10);
            if (isNaN(taskId)) {
                res.status(400).json({ message: "Invalid task ID !"});
            }

            const task = await TaskService.getTaskById(taskId);

            if (!task) {
                logger.warn(`Task with ID ${id} not found.`);
                res.status(404).json({ message: 'Task not found!' });
            }

            const deleteTask = await TaskService.deleteTask(taskId);
            logger.info("Deleting tasks");
            res.status(200).json({ data: deleteTask, message: 'Task deleted successfully.' });
        } catch (error: any) {
            logger.error(`Error occurred while deleting task: ${error.message}`);
            res.status(500).json({ message: 'An error occurred while deleting the task.', error: error.message });
        }
    }
}
