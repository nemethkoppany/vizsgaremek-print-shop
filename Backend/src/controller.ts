import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "./config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { email, full_name, password } = req.body;

  if (!email || !full_name || !password) {
    return res.status(400).json({ message: "Hiányzó adatok" });
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [existing] = await connection.query(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );

    if ((existing as any[]).length > 0) {
      return res.status(409).json({ message: "Ez az email már foglalt." });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "user";
    const now = new Date();

    const [result] = await connection.query(
      `INSERT INTO Users (name, email, password, registration_date, role)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, now, role]
    );

    const user_id = (result as any).insertId;

    const accessToken = jwt.sign(
      { user_id, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      user_id,
      email,
      full_name,
      role,
      accessToken
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Szerver hiba" });
  } finally {
    await connection.end();
  }
};
