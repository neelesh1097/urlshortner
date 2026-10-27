import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import { findUserByIdDao } from "../dao/user.dao.js";

/**
 * Middleware that inspects incoming cookies or Authorization headers for JWT.
 * If valid, it attaches the user document to req.user.
 * If absent or invalid, it gracefully leaves req.user undefined.
 */
export const attachUser = async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await findUserByIdDao(decoded._id);

        if (user) {
            req.user = user;
        } else {
            req.user = null;
        }
    } catch {
        req.user = null;
    }

    next();
};

/**
 * Middleware to protect routes that require authentication
 */
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
        });
    }
    next();
};
