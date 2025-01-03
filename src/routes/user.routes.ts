// src/routes/user.routes.ts
import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";
import { upload } from "../utils/awsS3";

const router = Router();

router.get("/profile", Authenticate, UserController.getProfile);
router.get("/", UserController.getAllUser);
router.get("/:id", UserController.getUserById);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.patch("/:id", Authenticate, upload.single('avatar'), UserController.updateProfile);
router.delete("/:id", Authenticate, UserController.deleteUser);

export default router;
