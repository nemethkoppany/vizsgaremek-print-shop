import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "./config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  AuthRequest,
  OrderStats,
  Product,
  User,
  UserResponse,
} from "./interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "./uploadMiddleware";
import { domainToASCII } from "url";
import { stat } from "fs";
import { types } from "util";

//Egyenlőre itt lehet megadni a role-t, ez később még változhat
export const registerUser = async (req: Request, res: Response) => {
  const { email, full_name, password, role } = req.body;

  if (!email || !full_name || !password) {
    return res.status(400).json("Hiányzó adatok");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [existing] = await connection.query(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );

    if ((existing as any[]).length > 0) {
      return res.status(409).json("Ez az email már foglalt.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role && typeof role === "string" ? role : "user";
    const now = new Date();

    const [result] = await connection.query(
      `INSERT INTO Users (name, email, password, registration_date, role) VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, now, userRole]
    );

    const user_id = (result as any).insertId;

    const accessToken = jwt.sign(
      { user_id, email, role: userRole },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      user_id,
      email,
      full_name,
      role: userRole,
      accessToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json("Szerver hiba");
  } finally {
    await connection.end();
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json("Hiányzó adatok!");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT user_id, name, email, password, role FROM Users WHERE email = ?",
      [email]
    );

    const users = rows as User[];

    if (users.length === 0) {
      return res.status(401).json("Hibás email vagy jelszó");
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json("A jelszó nem lehet ugyan az mint az eredeti jelszó");
    }

    await connection.query(
      "UPDATE Users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      user_id: user.user_id,
      email: user.email,
      full_name: user.name,
      role: user.role,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json("Hiányzó adatok");
  }

  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json("Nincs bejelentkezve");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT password FROM Users WHERE user_id = ?",
      [userId]
    );

    const users = rows as User[];

    if (users.length === 0) {
      return res.status(404).json("Felhasználó nem található");
    }

    const existingHashedPassword = users[0].password;

    const isMatch = await bcrypt.compare(oldPassword, existingHashedPassword);
    if (!isMatch) {
      return res.status(401).json("A régi jelszó hibás");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query("UPDATE Users SET password = ? WHERE user_id = ?", [
      newHashedPassword,
      userId,
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json("Hibás user ID");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      `SELECT user_id, email, name AS full_name, role, registration_date AS createdAt, last_login AS lastLogin FROM Users WHERE user_id = ?`,
      [userId]
    );
    const users = rows as UserResponse[];

    if (users.length === 0) {
      return res.status(404).json("Felhasználó nem található");
    }

    return res.status(200).json(users[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  } finally {
    await connection.end();
  }
};

export const updateUser = async (req: any, res: Response) => {
  const userId = parseInt(req.params.id);
  const { full_name, email } = req.body;

  if (isNaN(userId)) return res.status(400).json({ message: "Hibás user ID" });

  const fieldsToUpdate: any = {};
  if (full_name) fieldsToUpdate.name = full_name;
  if (email) fieldsToUpdate.email = email;

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ message: "Nincs frissítendő mező" });
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const keys = Object.keys(fieldsToUpdate);
    const values = keys.map((key) => fieldsToUpdate[key]);
    values.push(userId);

    const sql = `UPDATE Users SET ${keys
      .map((k) => `${k} = ?`)
      .join(", ")} WHERE user_id = ?`;

    const [result] = (await connection.query(sql, values)) as any;

    if (result.affectedRows === 0) {
      return res.status(404).json("Felhasználó nem található");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  } finally {
    await connection.end();
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Hiányzó felhasználó ID!" });
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [result]: any = await connection.execute(
      "DELETE FROM Users WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json("Felhasználó nem található!");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json("Szerver hiba");
  } finally {
    await connection.end();
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT product_id, name, description, base_price, in_stock, image_urls FROM Products"
    );

    const products: Product[] = (rows as any[]).map((p) => ({
      product_id: p.product_id,
      name: p.name,
      description: p.description,
      base_price: p.base_price,
      in_stock: p.in_stock,
      image_urls: p.image_urls ? JSON.parse(p.image_urls) : [],
    }));

    return res.status(200).json(products);
  } catch (err) {
    console.error("Get products error: ", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json("Hibás product ID");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT product_id, name, description, base_price, in_stock, image_urls FROM Products WHERE product_id = ? ",
      [productId]
    );
    const products = rows as any[];

    if (products.length === 0) {
      return res.status(404).json("Termék nem található!");
    }

    const product: Product = {
      product_id: products[0].product_id,
      name: products[0].name,
      description: products[0].description,
      base_price: products[0].base_price,
      in_stock: products[0].in_stock,
      image_urls: products[0].image_urls
        ? JSON.parse(products[0].image_urls)
        : [],
    };
    return res.status(200).json(product);
  } catch (err) {
    console.error("Get product by ID error", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, base_price, in_stock, image_urls } = req.body;

  if (!name || !description || base_price == null || in_stock == null) {
    return res.status(400).json("Hiányzó adatok");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    await connection.query(
      "INSERT INTO Products (name, description, base_price, in_stock, image_urls) VALUES (?,?,?,?,?)",
      [
        name,
        description,
        base_price,
        in_stock,
        image_urls ? JSON.stringify(image_urls) : null,
      ]
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);
  const { name, description, base_price, in_stock, image_urls } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json("Hibás product ID");
  }

  const fields: any = {};
  if (name !== undefined) fields.name = name;
  if (description !== undefined) fields.description = description;
  if (base_price !== undefined) fields.base_price = base_price;
  if (in_stock !== undefined) fields.in_stock = in_stock;
  if (image_urls !== undefined) fields.image_urls = JSON.stringify(image_urls);

  if (Object.keys(fields).length === 0) {
    return res.status(400).json("nincs frissítendő adat");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const sql = `UPDATE Products SET ${keys
      .map((k) => `${k} =?`)
      .join(", ")} WHERE product_id = ?`;

    values.push(productId);

    const [result]: any = await connection.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json("A termék nem található");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json("Hibás Product ID");
  }
  const connection = await mysql.createConnection(config.database);

  try {
    const [result]: any = await connection.query(
      "DELETE FROM Products WHERE product_id = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json("A termék nem található");
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete product error: ", err);
    return res.status(500).json("Szerver hiba");
  }
};

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


export const getLoginAnalytics = async (req:Request, res:Response) =>{
  const userId = Number(req.params.id);

  if(!userId || isNaN(userId)){
    return res.status(400).json("Hiányzó id");
  }
  const connection = await mysql.createConnection(config.database);

    try{
      const [rows] = await connection.query(
        "SELECT last_login FROM Users WHERE user_id = ?",[userId]
      );

      const result = rows as User[];

      if(result.length === 0){
        return res.status(404).json("Felhasználó nem található");
      }

      return res.status(200).json({last_login: result[0].last_login});
    }
    catch(err){
      console.error("Login analytics error: ",err)
      return res.status(500).json("Szerver hiba");
    }
}

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    await uploadMiddleware(req, res);

    if (!req.file) return res.status(400).json({ error: "Nem lett fájl feltöltve!" });

    const { originalname, mimetype, size, filename } = req.file;
    const connection = await mysql.createConnection(config.database);

    const [result]: any = await connection.query(
      `INSERT INTO Files (user_id, file_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?)`,[req.user!.user_id, filename, mimetype, size, "uploaded"]
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
        `INSERT INTO Files (user_id, file_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?)`,[req.user!.user_id, filename, mimetype, size, "uploaded"]
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
      "SELECT file_name FROM Files WHERE file_id = ?",[fileId]
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
  }
};

//Ez egyenlőre csak az adatbázisból törli az feltöltött fájlokat, az uploads mappból nem
export const deleteFile = async (req: Request, res: Response) => {
  const fileId = req.params.id;

  const connection = await mysql.createConnection(config.database);

  try {
    const [results]: any = await connection.query(
      "SELECT file_name FROM Files WHERE file_id = ?",[fileId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "A fájl nem található!" });
    }

    await connection.query("DELETE FROM Tetel_fajlok WHERE file_id = ?", [fileId]);
    await connection.query("DELETE FROM Files WHERE file_id = ?", [fileId]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json( "Szerver hiba");
  }
};


export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items } = req.body; 

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Nincsenek termékek a rendeléshez!" });

  const connection = await mysql.createConnection(config.database);

  try {
    const [orderResult]: any = await connection.query(
      `INSERT INTO Orders (user_id, order_date, status, total_price, payment_status) VALUES (?, NOW(), ?, ?, ?)`,[req.user!.user_id, "pending", 0, "pending"]
    );

    const orderId = orderResult.insertId;
    let totalPrice = 0;

    for (const item of items) {
      const [productRows]: any = await connection.query(
        "SELECT name, base_price, in_stock FROM Products WHERE product_id = ?",[item.productId]
      );

      if (!productRows.length)
        throw new Error(`A termék nem található: id: ${item.productId}`);

      const product = productRows[0];

      if (!productRows[0].in_stock)
        throw new Error(`Az alábbi termék nincs raktáron: ${product.name}`);

      const price = productRows[0].base_price * item.quantity;
      totalPrice += price;

      const [orderItemResult]: any = await connection.query(
        `INSERT INTO Order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)`,[orderId, item.productId, item.quantity, price]
      );

      if (item.fileId) {
        await connection.query(
          `INSERT INTO Tetel_fajlok (order_item_id, file_id) VALUES (?, ?)`,[orderItemResult.insertId, item.fileId]
        );
      }
    }

    await connection.query("UPDATE Orders SET total_price = ? WHERE order_id = ?", [totalPrice, orderId]);

    return res.status(201).json({ order_id: orderId, status: "pending", total_price: totalPrice });
  } catch (err: any) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: err.message || "Sikertelen rendelés" });
  }
};

export const getOrder = async (req: Request, res: Response) =>{
  const orderId = req.params.id;

  const connection = await mysql.createConnection(config.database);

  try{
    const [orders]: any = await connection.query(
      "SELECT order_id, status, total_price FROM Orders WHERE order_id = ?",[orderId]
    );
    if(orders.length === 0){
      return res.status(404).json("Rendelés nem található");
    }

    const order = orders[0];

    const [items]: any = await connection.query(
      "SELECT oi.product_id, p.name as product_name, oi.quantity, oi.subtotal FROM Order_items oi JOIN Products p ON oi.product_id = p.product_id WHERE oi.order_id = ?",[orderId]
    );

     const response = {
      order_id: order.order_id,
      status: order.status,
      total_price: order.total_price,
      items: items.map((item: any) => ({
        product_id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        subtotal: item.subtotal
      }))
    };

    return res.status(200).json(response);
  }
  catch(err){
    console.error("Get order error",err);
    return res.status(500).json("Hiba a rendelés lekérdezésekor");
  }
}

export const updateOrderStatus = async (req:AuthRequest, res: Response) => {
  const orderId = parseInt(req.params.id);
  const {status} = req.body;

  if(isNaN(orderId)){
    return res.status(400).json("Hibás rendelés id");
  }

  if(!status || typeof status !== "string"){
    return res.status(400).json("Hiányzó vagy érvénytelen status");
  }

  const connection = await mysql.createConnection(config.database);

  try{
    const [result]: any = await connection.query(
      "UPDATE Orders SET status = ? WHERE order_id = ?",[status, orderId]
    );

    if(result.affectedRows === 0){
      return res.status(404).json("A rendelés nem talákható");
    }

    return res.status(200).json({success:true});
  }
  catch(err){
    console.error("Update order status error:", err);
    return res.status(500).json("Szerver hiba");
  }
}