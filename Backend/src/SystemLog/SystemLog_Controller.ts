import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";


export const createSystemLog = async (req: AuthRequest, res: Response) => {
  //AUTOMATIKUS LOGOLÁS
  // await connection.query(
  //   "INSERT INTO Audit_logs (user_id, event_type, message) VALUES (?, ?, ?)",
  //   [req.user!.user_id, "ORDER_STATUS_CHANGED", `Order ${orderId} -> ${status}`]
  // );

  const { userId, eventType, message } = req.body;

  if (!eventType || typeof eventType !== "string") {
    return res.status(400).json("Hiányzó vagy hibás eventType");
  }

  if (!message || typeof message !== "string") {
    return res.status(400).json("Hiányzó vagy hibás message");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [result]: any = await connection.query(
      "INSERT INTO Audit_logs (user_id, event_type, message) VALUE (?,?,?)",
      [userId, eventType, message],
    );

    return res.status(201).json({ log_id: result.insertId });
  } catch (err) {
    console.error("Create system log error", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json("Hibás user id");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows]: any = await connection.query(
      "SELECT log_id, user_id, event_type, message, createdAt FROM Audit_logs WHERE user_id =  ? ORDER BY createdAt DESC",
      [userId],
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Get audit logs error", err);
    return res.status(500).json("Szerver hiba");
  }
};