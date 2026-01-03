import dotenv from "dotenv";
dotenv.config();

const config = {
    database: {
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE
    },
    jwtSecret: process.env.JWT_SECRET, 
    baseDir: __dirname + "/../",
    uploadDir: "uploads/",
    maxSize: 500 * 1024 * 1024
};

export default config;
