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

export const loginUser = async(req: Request, res: Response) =>{
  const {email, password} = req.body;

  if(!email ||!password){
    res.status(400).json("Hiányzó adatok!");
  }

  const connection = await mysql.createConnection(config.database);

  try{
    const [rows] = await connection.query(
      "SELECT user_id, name, email, password, role FROM Users WHERE email = ?",[email]
    );

    const users = rows as any[];

    if(users.length === 0){
      return res.status(401).json("Hibás email vagy jelszó");
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json("A jelszó nem lehet ugyan az mint az eredeti jelszó");
    }

    const accessToken = jwt.sign(
      {user_id: user.user_id,
        email:user.email,
        role:user.role
      },
      process.env.JWT_SECRET!,
      {expiresIn:'1h'}
    )

    return res.status(200).json({
      user_id: user.user_id,
      email: user.email,
      full_name: user.name,
      role: user.role,
      accessToken
    })
  }
  catch(err){
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }
  finally{
    await connection.end();
  }
}

export const changePassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Hiányzó adatok" });
  }

  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ message: "Nincs bejelentkezve" });
  }

  const connection = await mysql.createConnection(config.database);

  try {

    const [rows] = await connection.query(
      "SELECT password FROM Users WHERE user_id = ?",
      [userId]
    );

    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ message: "Felhasználó nem található" });
    }

    const existingHashedPassword = users[0].password;


    const isMatch = await bcrypt.compare(oldPassword, existingHashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "A régi jelszó hibás" });
    }


    const newHashedPassword = await bcrypt.hash(newPassword, 10);


    await connection.query(
      "UPDATE Users SET password = ? WHERE user_id = ?",
      [newHashedPassword, userId]
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({ message: "Szerver hiba" });
  } finally {
    await connection.end();
  }
};
