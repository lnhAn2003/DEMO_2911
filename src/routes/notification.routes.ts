// src/routes/notification.routes.ts
import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { Authenticate } from "../middlewares/authentication.middlewares";

const router = Router();

router.post("/notifications", NotificationController.createNotification);
router.get("/notifications", Authenticate, NotificationController.getNotificationsForUser);
router.post("/notifications/:notificationId/read", Authenticate, NotificationController.markAsRead);
router.post("/notifications/read-all", Authenticate, NotificationController.markAllAsReadForUser);

export default router;