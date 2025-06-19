import { DataSource } from "typeorm";
import { Contact } from "../entities/Contact";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "bitespeed",
    synchronize: true,
    logging: true,
    entities: [Contact],
    subscribers: [],
    migrations: [],
}); 