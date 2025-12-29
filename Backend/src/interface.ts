import { Request } from "express";

//User interface
export interface User {
  user_id: number;
  name: string;
  email: string;
  password: string; 
  role: string;
  registration_date: Date;
  last_login?: Date | null;
}

//JWTPayload interface
export interface JwtPayload {
  user_id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface UserResponse {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_urls?: string[];
}

export interface FileData {
  file_id: number;
  original_name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
}

export interface Order {
  order_id: number;
  user_id: number;
  status: string;
  total_price: number;
  createdAt: Date;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  fileId?: number;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface AuditLog {
  log_id: number;
  user_id?: number;
  event_type: string;
  message: string;
  createdAt: Date;
}
