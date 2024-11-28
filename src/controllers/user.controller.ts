import { Request, Response } from "express";
import UserService from "../services/user.service";
import logger from "../utils/logger";

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
            res.status(500).json({ message: 'An error occurred while searching the users.', error: error.message });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: " Invalid user ID !"});
            }

            const user = await UserService.getUserById(userId);

            if (!user) {
                res.status(404).json({ message: "User not found" });
                logger.error(`User with ID ${userId} doesn't found !`)
            } else {
                logger.info(`User with ID ${userId} fetched successfully !`);
            }
            res.status(200).json(user);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async register(req: Request, res: Response): Promise<void> {
        try {
            const user = req.body;
            const result = await UserService.register(user);
            logger.info("Register new user");
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ message:'An error occurred while register.', error: error.message });
        }    
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { user, token } = await UserService.login( email, password );
            res.status(200).json({ token, user: { ...user, password: undefined } });
        } catch (error: any) {
            res.status(500).json({ message:'An error occurred while login.', error: error.message });
        }   
    }

    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: " Invalid user ID !"});
            }

            const result = await UserService.updateProfile(userId, req.body);
            if (!result) {
                res.status(404).json({ message: "User not found" });
            }
            const updatedProfile = await UserService.getUserById(userId);
            logger.info("Updating profile");
            res.status(200).json({ data: updatedProfile, message: "Profile updated successfully." })
        } catch (error: any) {
            res.status(500).json({ message: 'An error occurred while updating the task.', error: error.message });
        }
    }

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const userId = parseInt(id, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: " Invalid user ID !"});
            }

            const user = await UserService.getUserById(userId);

            if (!user) {
                logger.warn(`User with ID ${id} not found.`);
                res.status(404).json({ message: 'User not found!' });
            }
            const deleteUser = await UserService.deleteUser(userId);
            logger.info("Deleting user");
            res.status(200).json({ data: deleteUser, message: 'User deleted successfully.' });
        } catch (error: any) {
            logger.error(`Error occurred while deleting user: ${error.message}`);
            res.status(500).json({ message: 'An error occurred while deleting the user.', error: error.message });
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
          const { id } = (req as AuthenticatedRequest).user;
          const user = await UserService.getUserById(id);
      
          if (!user) {
            res.status(404).json({ message: "User not found" });
            logger.error(`User with ID ${id} not found!`);
          } else {
            logger.info(`User with ID ${id} fetched successfully!`);
            res.status(200).json(user);
          }
        } catch (error: any) {
          res.status(500).json({ message: error.message });
        }
      }
      
}