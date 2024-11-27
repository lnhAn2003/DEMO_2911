import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: true,
    entities: [__dirname + "/entities/*.ts"],
    migrations: [__dirname + "/migrations/*.ts"],
    subscribers: [__dirname + "/subscribers/*.ts"],
    
    driver: require('mysql2'),
    
});

export const config = {
    jwtSecret: process.env.JWT_SECRET || 'defaultSecret',
};