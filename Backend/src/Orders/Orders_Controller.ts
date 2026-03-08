import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";


export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Nincsenek termékek a rendeléshez!" });

  const connection = await mysql.createConnection(config.database);

  try {
    const [orderResult]: any = await connection.query(
      `INSERT INTO Orders (user_id, order_date, status, total_price, payment_status) VALUES (?, NOW(), ?, ?, ?)`,
      [req.user!.user_id, "pending", 0, "pending"],
    );

    const orderId = orderResult.insertId;
    let totalPrice = 0;

    for (const item of items) {
      const [productRows]: any = await connection.query(
        "SELECT name, base_price, in_stock FROM Products WHERE product_id = ?",
        [item.productId],
      );

      if (!productRows.length)
        throw new Error(`A termék nem található: id: ${item.productId}`);

      const product = productRows[0];

      if (!productRows[0].in_stock)
        throw new Error(`Az alábbi termék nincs raktáron: ${product.name}`);

      const price = productRows[0].base_price * item.quantity;
      totalPrice += price;

      const [orderItemResult]: any = await connection.query(
        `INSERT INTO Order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, price],
      );

      if (item.fileId) {
        await connection.query(
          `INSERT INTO Tetel_fajlok (order_item_id, file_id) VALUES (?, ?)`,
          [orderItemResult.insertId, item.fileId],
        );
      }
    }

    await connection.query(
      "UPDATE Orders SET total_price = ? WHERE order_id = ?",
      [totalPrice, orderId],
    );

    
    const [userRows]: any = await connection.query(
      "SELECT email FROM Users WHERE user_id = ?",
      [req.user!.user_id],
    );

    const userEmail = userRows[0].email;

    await sendOrderConfirmation(userEmail, orderId, totalPrice);

    return res
      .status(201)
      .json({ order_id: orderId, status: "pending", total_price: totalPrice });
  } catch (err: any) {
    console.error("Create order error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Sikertelen rendelés" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id;

  const connection = await mysql.createConnection(config.database);

  try {
    const [orders]: any = await connection.query(
      "SELECT order_id, status, total_price FROM Orders WHERE order_id = ?",
      [orderId],
    );
    if (orders.length === 0) {
      return res.status(404).json("Rendelés nem található");
    }

    const order = orders[0];

    const [items]: any = await connection.query(
      "SELECT oi.product_id, p.name as product_name, oi.quantity, oi.subtotal FROM Order_items oi JOIN Products p ON oi.product_id = p.product_id WHERE oi.order_id = ?",
      [orderId],
    );

    const response = {
      order_id: order.order_id,
      status: order.status,
      total_price: order.total_price,
      items: items.map((item: any) => ({
        product_id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Get order error", err);
    return res.status(500).json("Hiba a rendelés lekérdezésekor");
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  if (isNaN(orderId)) {
    return res.status(400).json("Hibás rendelés id");
  }

  if (!status || typeof status !== "string") {
    return res.status(400).json("Hiányzó vagy érvénytelen status");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [result]: any = await connection.query(
      "UPDATE Orders SET status = ? WHERE order_id = ?",
      [status, orderId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json("A rendelés nem talákható");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json("Hibás felhasználó id");
  }

  if (req.user!.role !== "admin" && req.user!.user_id !== userId) {
    return res.status(403).json("Nincs jogosultság");
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows]: any = await connection.query(
      "SELECT order_id, status, total_price, order_date AS createdAt FROM Orders WHERE user_id = ? ORDER BY order_date DESC",
      [userId],
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Get user orders error: ", err);
    return res.status(500).json("Szerver hiba");
  }
};