import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource, config } from "../data-source";
import { User } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

class UserService {
    public static async getAllUser(): Promise<User[]> {
        return await userRepository.find();
    }

    public static async getUserById(id: number): Promise<User | null> {
        return await userRepository.findOneOrFail({ where: { id }});
    }

    public static async register(userData: Partial<User>): Promise<User> {
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (existingUser) {
            throw new Error("Email already in use");
        }

        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        return await userRepository.save(userData);
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
            { id: user.id},
            config.jwtSecret,
            { expiresIn: '1h' }
          );
        return { user, token }; 
    }

    public static async updateProfile(id: number, userData: Partial<User>): Promise<User | null> {
        const user = await userRepository.findOne({ where: { id } }); 
        
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        await userRepository.update(id, userData);
        const updateUser = await userRepository.findOne({ where: {id}});
        return updateUser; 
    }

    public static async deleteUser(id: number): Promise<User | null> {
        const userTodelete = await userRepository.findOne({ where: {id} });
        await userRepository.delete(id);
        return userTodelete;
    }

}

export default UserService;