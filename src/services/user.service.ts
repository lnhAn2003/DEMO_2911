// src/services/user.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource, config } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

class UserService {
    public static async getAllUser(): Promise<User[]> {
        return await userRepository.find();
    }

    public static async getUserById(id: number): Promise<User> {
        const user = await userRepository.findOne({ where: { id }});
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    public static async register(userData: Partial<User>): Promise<User> {
        if (!userData.email) {
            throw new Error("Email is required");
        }
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (existingUser) {
            throw new Error("Email already in use");
        }

        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const newUser = userRepository.create(userData);
        return await userRepository.save(newUser);
    }

    public static async login(email: string, password: string): Promise<{ user: User, token: string }> { 
        const user = await userRepository.findOne({ where: { email } }); 
        if (!user || !user.password) { 
            throw new Error('Invalid email or password'); 
        } 
        
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) { 
            throw new Error('Invalid email or password'); 
        } 

        if (!config.jwtSecret) {
            throw new Error("JWT secret is not defined");
        }

        const token = jwt.sign(
            { id: user.id },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        return { user, token }; 
    }

    public static async updateProfile(id: number, userData: Partial<User>): Promise<User> {
        const user = await userRepository.findOne({ where: { id } }); 
        if (!user) {
            throw new Error("User not found");
        }

        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        await userRepository.update(id, userData);
        const updatedUser = await userRepository.findOne({ where: { id } });
        if (!updatedUser) {
            throw new Error("User not found after update");
        }
        return updatedUser; 
    }

    // public static async updateUserAvatar(id: number, imageUrl: string): Promise<User> {
    //     const user = await userRepository.findOne({ where: { id } });
    //     if (!user) {
    //         throw new Error("User not found");
    //     }

    //     user.profileImageUrl = imageUrl;
    //     await userRepository.save(user);

    //     return user;
    // }

    public static async deleteUser(id: number): Promise<User> {
        const userToDelete = await userRepository.findOne({ where: { id } });
        if (!userToDelete) {
            throw new Error("User not found");
        }
        await userRepository.delete(id);
        return userToDelete;
    }

}

export default UserService;
