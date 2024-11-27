import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { Authenticate } from "../middlewares/authentication.middlewares";

const router = Router();

router.post("/", Authenticate, TaskController.createTask);
router.get("/", TaskController.getAllTasks);
router.get("/:id", TaskController.getTaskById);
router.patch("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;