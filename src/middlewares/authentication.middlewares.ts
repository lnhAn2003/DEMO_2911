import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../data-source";

interface AuthenticatedRequest extends Request {
    user? : { id: number, email: string};
}

export const Authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: Invalid token format" });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string };
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(403).json({ message: "Unauthorized: Invalid token" });
        return;
    }
};