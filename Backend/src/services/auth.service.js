import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserDao, findUserByEmailDao, findUserByIdDao } from "../dao/user.dao.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errorHandler.js";
import { JWT_SECRET } from "../config/config.js";

/**
 * Sign JWT token for a user
 */
export const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

/**
 * Register a new user
 */
export const registerUser = async (name, email, password) => {
    if (!name || !email || !password) {
        throw new BadRequestError("Name, email, and password are required");
    }

    if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters");
    }

    const existingUser = await findUserByEmailDao(email);
    if (existingUser) {
        throw new ConflictError("An account with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUserDao({
        name,
        email,
        password: hashedPassword,
    });

    const token = generateToken(newUser);
    const safeUser = newUser.toJSON();

    return { token, user: safeUser };
};

/**
 * Authenticate existing user
 */
export const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new BadRequestError("Email and password are required");
    }

    const user = await findUserByEmailDao(email);
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateToken(user);
    const safeUser = user.toJSON();

    return { token, user: safeUser };
};

/**
 * Get user profile by ID
 */
export const getUserById = async (id) => {
    const user = await findUserByIdDao(id);
    if (!user) {
        throw new UnauthorizedError("User session not found");
    }
    return user;
};
