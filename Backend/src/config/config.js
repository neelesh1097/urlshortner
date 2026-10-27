import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MONGO_URL = process.env.MONGO_URL;
export const APP_URL = process.env.APP_URL || `http://localhost:${PORT}/`;
export const JWT_SECRET = process.env.JWT_SECRET || "urlshortener_secret_jwt_key_default_2026";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};
