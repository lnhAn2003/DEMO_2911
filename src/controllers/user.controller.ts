// src/controllers/user.controller.ts
import { Request, Response } from "express";
import UserService from "../services/user.service";
import logger from "../utils/logger";
import { User } from "../entities/User";

interface AuthenticatedRequest extends Request {
    user: { id: number; email: string };
}

export class UserController {
    static async getAllUser(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUser();
            logger.info("Fetching all users");
            res.status(200).json(users);
        } catch (error: any) {
            logger.error(`Error fetching all users: ${error.message}`);
            res.status(500).json({ message: 'An error occurred while fetching the users.', error: error.message });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: "Invalid user ID!" });
                return;
            }

            const user = await UserService.getUserById(userId);

            logger.info(`User with ID ${userId} fetched successfully!`);
            res.status(200).json(user);
        } catch (error: any) {
            logger.error(`Error fetching user by ID: ${error.message}`);
            if (error.message.includes("not found")) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
          console.log("Decoded user from token:", (req as AuthenticatedRequest).user); 
          const { id } = (req as AuthenticatedRequest).user;
    
          const user = await UserService.getUserById(id);
          res.status(200).json(user);
        } catch (error: any) {
          console.error('Error in getProfile:', error);
          if (error.message.includes("not found")) {
            res.status(404).json({ message: "User not found" });
          } else {
            res.status(500).json({ message: error.message });
          }
        }
    }

    static async register(req: Request, res: Response): Promise<void> {
        try {
            const user = req.body;
            const result = await UserService.register(user);
            logger.info("Registered new user");
            res.status(201).json(result);
        } catch (error: any) {
            logger.error(`Error registering user: ${error.message}`);
            res.status(500).json({ message:'An error occurred while registering.', error: error.message });
        }    
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { user, token } = await UserService.login(email, password);
            res.status(200).json({ token, user: { ...user, password: undefined } });
        } catch (error: any) {
            logger.error(`Error logging in: ${error.message}`);
            res.status(401).json({ message:'Invalid email or password.', error: error.message });
        }   
    }

    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: "Invalid user ID!" });
            }
    
            let imageUrl: string | undefined;
            if (req.file) {
                const file = req.file as Express.MulterS3.File;
                imageUrl = file.location;
            }
    
            // Prepare update data from req.body
            const updateData: Partial<User> = { ...req.body };
    
            // Remove 'avatar' field if it exists in req.body, since it's not a column in User
            if ('avatar' in updateData) {
                delete (updateData as any).avatar;
            }
    
            // If we uploaded a file, set the profileImageUrl
            if (imageUrl) {
                updateData.profileImageUrl = imageUrl;
            }
    
            await UserService.updateProfile(userId, updateData);
            const updatedProfile = await UserService.getUserById(userId);
            logger.info(`User with ID ${userId} updated successfully.`);
            res.status(200).json({ data: updatedProfile, message: "Profile updated successfully." });
        } catch (error: any) {
            logger.error(`Error updating profile: ${error.message}`);
            if (error.message.includes("User not found")) {
                res.status(404).json({ message: 'User not found!' });
            } else {
                res.status(500).json({ message: 'An error occurred while updating the user.', error: error.message });
            }
        }
    }
    
    

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: "Invalid user ID!"});
                return;
            }

            const user = await UserService.deleteUser(userId);
            logger.info(`User with ID ${userId} deleted successfully.`);
            res.status(200).json({ data: user, message: 'User deleted successfully.' });
        } catch (error: any) {
            logger.error(`Error deleting user: ${error.message}`);
            if (error.message.includes("User not found")) {
                res.status(404).json({ message: 'User not found!' });
            } else {
                res.status(500).json({ message: 'An error occurred while deleting the user.', error: error.message });
            }
        }
    }

    
}
