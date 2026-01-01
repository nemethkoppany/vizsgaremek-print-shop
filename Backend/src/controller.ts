import { Request, Response } from "express";
import mysql from "mysql2/promise";
import config from "./config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest,Product,User, UserResponse } from "./interface";
import { parse } from "dotenv";


//Egyenlőre itt lehet megadni a role-t, ez később még változhat
export const registerUser = async (req: Request, res: Response) => {
  const { email, full_name, password, role } = req.body; 

  if (!email || !full_name || !password) {
    return res.status(400).json( "Hiányzó adatok" );
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [existing] = await connection.query(
      "SELECT user_id FROM Users WHERE email = ?", [email]
    );

    if ((existing as any[]).length > 0) {
      return res.status(409).json(  "Ez az email már foglalt." );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role && typeof role === "string" ? role : "user";
    const now = new Date();

    const [result] = await connection.query(
      `INSERT INTO Users (name, email, password, registration_date, role) VALUES (?, ?, ?, ?, ?)`,[full_name, email, hashedPassword, now, userRole]
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
      accessToken
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json(  "Szerver hiba" );
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

    const users = rows as User[];

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
}

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
      "SELECT password FROM Users WHERE user_id = ?",[userId]
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

    await connection.query(
      "UPDATE Users SET password = ? WHERE user_id = ?",[newHashedPassword, userId]
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json("Szerver hiba");
  }
};


export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json( "Hibás user ID" );
  }

  const connection = await mysql.createConnection(config.database);

  try {
    const [rows] = await connection.query(
      `SELECT user_id, email, name AS full_name, role, registration_date AS createdAt, last_login AS lastLogin FROM Users WHERE user_id = ?`,[userId]
    ) 
    const users = rows as UserResponse[];

   if (users.length === 0) {
  return res.status(404).json("Felhasználó nem található");
}

return res.status(200).json(users[0]);

  } catch (err) {
    console.error( err);
    return res.status(500).json(  "Szerver hiba" );
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
    const values = keys.map(key => fieldsToUpdate[key]);
    values.push(userId); 

    const sql = `UPDATE Users SET ${keys.map(k => `${k} = ?`).join(", ")} WHERE user_id = ?`;

    const [result] = await connection.query(sql, values) as any;

    if (result.affectedRows === 0) {
      return res.status(404).json( "Felhasználó nem található" );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Szerver hiba" );
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
      "DELETE FROM Users WHERE user_id = ?",[id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json( "Felhasználó nem található!" );
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json("Szerver hiba" );
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

    const products: Product[] = (rows as any[]).map(p => ({
      product_id: p.product_id,
      name: p.name,
      description: p.description,
      base_price: p.base_price,
      in_stock: p.in_stock,
      image_urls: p.image_urls ? JSON.parse(p.image_urls) : []
    }));

    return res.status(200).json(products);
  } catch (err) {
    console.error("Get products error: ", err);
    return res.status(500).json("Szerver hiba");
  }
};

export const getProductById = async (req:Request, res: Response) =>{
  const productId = parseInt(req.params.id);
  
  if(isNaN(productId)){
    return res.status(400).json("Hibás product ID");
  }

  const connection = await mysql.createConnection(config.database);
  
  try{
    const [rows] = await connection.query(
      "SELECT product_id, name, description, base_price, in_stock, image_urls FROM Products WHERE product_id = ? ",[productId]
    )
    const products = rows as any[];

    if(products.length === 0){
      return res.status(404).json("Termék nem található!");
    }

    const product: Product = {
      product_id: products[0].product_id,
      name: products[0].name,
      description: products[0].description,
      base_price: products[0].base_price,
      in_stock: products[0].in_stock,
      image_urls: products[0].image_urls ? JSON.parse(products[0].image_urls) : []
    }
    return res.status(200).json(product);
  }
  catch (err){
    console.error("Get product by ID error",err)
    return res.status(500).json("Szerver hiba");
  }
}

export const createProduct = async (req:AuthRequest, res:Response) =>{
  const {name, description, base_price,in_stock, image_urls} = req.body;

  if(!name || !description || base_price == null  || in_stock == null ){
    return res.status(400).json("Hiányzó adatok");
  }

  const connection = await mysql.createConnection(config.database);

  try{
    await connection.query(
      "INSERT INTO Products (name, description, base_price, in_stock, image_urls) VALUES (?,?,?,?,?)",[name,description,base_price,in_stock,image_urls ? JSON.stringify(image_urls) : null]
    )

    return res.status(201).json({success:true});
  }
  catch(err){
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }

}

export const updateProduct = async (req:Request, res:Response) =>{
  const productId = parseInt(req.params.id);
  const {name, description, base_price, in_stock, image_urls} = req.body;

  if(isNaN(productId)){
    return res.status(400).json("Hibás product ID");
  }

  const fields: any = {};
    if (name !== undefined) fields.name = name;
  if (description !== undefined) fields.description = description;
  if (base_price !== undefined) fields.base_price = base_price;
  if (in_stock !== undefined) fields.in_stock = in_stock;
  if (image_urls !== undefined) fields.image_urls = JSON.stringify(image_urls);

  if(Object.keys(fields).length === 0){
    return res.status(400).json("nincs frissítendő adat");
  }

  const connection = await mysql.createConnection(config.database);

  try{
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const sql = `UPDATE Products SET ${keys.map(k => `${k} =?`).join(', ')} WHERE product_id = ?`;

    values.push(productId);

    const [result]: any = await connection.query(sql, values);

    if(result.affectedRows === 0){
      return res.status(404).json("A termék nem található");
    }

    return res.status(200).json({success: true});
  }
  catch(err){
    console.error(err);
    return res.status(500).json("Szerver hiba");
  }
}