import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";




export const createRating = async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const userId = req.user!.user_id;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Az értékelésnek 1 és 5 között kell lennie." });
  }

  const connection = await mysql.createConnection(config.database);

  try {
    await connection.query(
      "INSERT INTO Ratings (user_id, rating, comment) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating),comment = VALUES(comment)",
      [userId, rating, comment || null],
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("Create rating error:", err);
    return res
      .status(500)
      .json({ error: "Nem sikerült menteni az értékelést." });
  }
  finally {
    await connection.end(); 
  }
};

export const getRatingAverage = async (_req: any, res: Response) => {
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows]: any = await connection.query(
      "SELECT COUNT(*) AS total_ratings, ROUND(AVG(RATING),1) AS average_rating FROM Ratings",
    );

    return res.status(200).json({
      total_ratings: rows[0].total_ratings,
      average_rating: rows[0].average_rating || 0,
    });
  } catch (err) {
    console.error("GET average rating error: ", err);
    return res.status(500).json("Nem sikerült lekérni az értékeléseket");
  }
  finally {
    await connection.end(); 
  }
};

export const getAllratings = async (_req: Request, res: Response) => {
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows]: any = await connection.query(
      "SELECT r.rating_id, r.rating, r.comment, r.createdAt, u.user_id, u.name AS user_name FROM Ratings r JOIN Users u ON r.user_id = u.user_id ORDER BY r.createdAt DESC",
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Get ratings error: ", err);
    return res.status(500).json("Szerver hiba");
  }
  finally {
    await connection.end(); 
  }
};
