import { cookieOptions } from "../config/config.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const register_user = wrapAsync(async (req, res) => {
    const { name, email, password } = req.body;
    const { token, user } = await registerUser(name, email, password);

    res.cookie("accessToken", token, cookieOptions);
    res.status(201).json({
        success: true,
        message: "Registration successful",
        user,
        token,
    });
});

export const login_user = wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);

    res.cookie("accessToken", token, cookieOptions);
    res.status(200).json({
        success: true,
        message: "Login successful",
        user,
        token,
    });
});

export const logout_user = wrapAsync(async (req, res) => {
    res.clearCookie("accessToken", cookieOptions);
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

export const get_current_user = wrapAsync(async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user || null,
    });
});