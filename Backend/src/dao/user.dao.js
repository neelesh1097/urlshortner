import User from "../models/user.model.js";
import ShortUrl from "../models/shorturl.model.js";

/**
 * Create a new user in database
 */
export const createUserDao = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

/**
 * Find user by email
 */
export const findUserByEmailDao = async (email) => {
    return await User.findOne({ email: email.toLowerCase() });
};

/**
 * Find user by ID
 */
export const findUserByIdDao = async (id) => {
    return await User.findById(id).select("-password");
};

/**
 * Get all URLs belonging to a user, sorted newest first
 */
export const getAllUserUrlsDao = async (userId) => {
    return await ShortUrl.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * Get aggregate statistics for a user
 */
export const getUserStatsDao = async (userId) => {
    const urls = await ShortUrl.find({ user: userId });
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    return {
        totalUrls,
        totalClicks,
    };
};
