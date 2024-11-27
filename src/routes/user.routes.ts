import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { Authenticate } from "../middlewares/authentication.middlewares";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/list/", UserController.getAllUser);
router.get("/profile/:id", UserController.getUserById);
router.patch("/profile/:id", Authenticate, UserController.updateProfile);
router.patch("/delete/:id", Authenticate, UserController.deleteUser);

export default router;