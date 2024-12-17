// src/middlewares/cache.middlewares.ts
import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/cache";

interface CustomResponse extends Response {
    sendResponse?: Response["send"];
}

export const cacheMiddleware = async (req: Request, res: CustomResponse, next: NextFunction) => {
    try {
        const cacheData = await redisClient.get(req.originalUrl);
        if (cacheData) {
            res.status(200).json(JSON.parse(cacheData));
        } else {
            res.sendResponse = res.send.bind(res); 
            res.send = ((body: any) => {
                redisClient.setEx(req.originalUrl, 3600, JSON.stringify(body));
                return res.sendResponse?.call(res, body); 
            }) as typeof res.send; 
            next();
        }
    } catch (err) {
        console.error("Error in cache middleware:", err);
        next();
    }
};
