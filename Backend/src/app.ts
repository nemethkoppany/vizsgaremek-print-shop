import express from "express";
import cors from "cors";
import router from "./routes";

const app = express();

app.use(cors({origin:"*"}))
app.use(express.json());
app.use("/",router);
app.use("/uploads", express.static("uploads"));

export default app;