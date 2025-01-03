// src/routes/notification.routes.ts
import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { Authenticate } from "../middlewares/authentication.middlewares";

const router = Router();

router.post("/", NotificationController.createNotification);
router.get("/", Authenticate, NotificationController.getNotificationsForUser);
router.post("/:notificationId/read", Authenticate, NotificationController.markAsRead);
router.post("/read-all", Authenticate, NotificationController.markAllAsReadForUser);

export default router;