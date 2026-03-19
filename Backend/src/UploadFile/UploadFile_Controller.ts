
import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    await uploadMiddleware(req, res);

    if (!req.file)
      return res.status(400).json({ error: "Nem lett fájl feltöltve!" });

    const { originalname, mimetype, size, filename } = req.file;
    const connection = await mysql.createConnection(config.database);

    const [result]: any = await connection.query(
      `INSERT INTO Files (user_id, file_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?)`,
      [req.user!.user_id, filename, mimetype, size, "uploaded"],
    );

    await connection.end();

    return res.status(201).json({
      file_id: result.insertId,
      original_name: originalname,
      url: `/uploads/${filename}`,
      mime_type: mimetype,
      size_bytes: size,
    });
  } catch (err) {
    console.error("File upload error:", err);
    return res.status(500).json({ error: "Fájl feltöltési hiba" });
  }
  
};

export const uploadFilesMultiple = async (req: AuthRequest, res: Response) => {
  try {
    await uploadMiddlewareMultiple(req, res);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0)
      return res.status(400).json({ error: "Nem lett fájl feltöltve!" });

    const connection = await mysql.createConnection(config.database);
    const savedFiles: any[] = [];

    for (const file of req.files as Express.Multer.File[]) {
      const { originalname, mimetype, size, filename } = file;

      const [result]: any = await connection.query(
        `INSERT INTO Files (user_id, file_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?)`,
        [req.user!.user_id, filename, mimetype, size, "uploaded"],
      );

      savedFiles.push({
        file_id: result.insertId,
        original_name: originalname,
        url: `/uploads/${filename}`,
        mime_type: mimetype,
        size_bytes: size,
      });
    }

    await connection.end();

    return res.status(201).json({ message: "Fájlok feltöltve", savedFiles });
  } catch (err) {
    console.error("Multiple file upload error:", err);
    return res.status(500).json({ error: "Fájlok feltöltési hiba" });
  }
};

export const downloadFile = async (req: any, res: any) => {
  const fileId = req.params.id;
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows]: any = await connection.query(
      "SELECT file_name FROM Files WHERE file_id = ?",
      [fileId],
    );

    if (!rows.length) {
      return res.status(404).json("A fájl nem található!");
    }

    const fileName = rows[0].file_name;
    const filePath = config.baseDir + config.uploadDir + fileName;

    return res.download(filePath, fileName);
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ error: "A fájl nem tölthető le!" });
  }finally {
    await connection.end(); 
  }
};


export const deleteFile = async (req: Request, res: Response) => {
  const fileId = req.params.id;

  const connection = await mysql.createConnection(config.database);

  try {
    const [results]: any = await connection.query(
      "SELECT file_name FROM Files WHERE file_id = ?",
      [fileId],
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "A fájl nem található!" });
    }

    await connection.query("DELETE FROM Tetel_fajlok WHERE file_id = ?", [
      fileId,
    ]);
    await connection.query("DELETE FROM Files WHERE file_id = ?", [fileId]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }finally {
    await connection.end(); 
  }
};
