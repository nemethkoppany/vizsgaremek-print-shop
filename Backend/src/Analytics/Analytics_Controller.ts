import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";


export const getOrderAnalytics = async (req: Request, res: Response) => {
  const { from, to } = req.query;

  const connection = await mysql.createConnection(config.database);

  try {
    let sql = `
      SELECT COUNT(*) AS total_orders,IFNULL(SUM(total_price), 0) AS total_revenue,IFNULL(AVG(total_price), 0) AS avg_order_value FROM Orders`;

    const params: any[] = [];

    if (from && to) {
      sql += " WHERE createdAt BETWEEN ? AND ?";
      params.push(from, to);
    }

    const [rows] = await connection.query(sql, params);
    const stats = rows as OrderStats[];

    return res.status(200).json(stats[0]);
  } catch (err) {
    console.error("Order analytics error:", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getLoginAnalytics = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (!userId || isNaN(userId)) {
    return res.status(400).json("Hiányzó id");
  }
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT last_login FROM Users WHERE user_id = ?",
      [userId],
    );

    const result = rows as User[];

    if (result.length === 0) {
      return res.status(404).json("Felhasználó nem található");
    }

    return res.status(200).json({ last_login: result[0].last_login });
  } catch (err) {
    console.error("Login analytics error: ", err);
    return res.status(500).json("Szerver hiba");
  }
};
