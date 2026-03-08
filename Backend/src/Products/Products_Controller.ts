import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "../config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {AuthRequest,OrderStats,Product,User,UserResponse,} from "../interface";
import { uploadMiddleware, uploadMiddlewareMultiple } from "../uploadMiddleware";
import { sendOrderConfirmation } from "../sendOrderMail";


export const getProducts = async (_req: Request, res: Response) => {
  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      "SELECT product_id, name, description, base_price, in_stock, image_urls FROM Products",
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
      [productId],
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
      ],
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
      [productId],
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