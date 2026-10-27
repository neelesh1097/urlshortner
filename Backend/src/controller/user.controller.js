import wrapAsync from "../utils/tryCatchWrapper.js";
import { getAllUserUrlsDao, getUserStatsDao } from "../dao/user.dao.js";
import { deleteShortUrlDao } from "../dao/shorturl.js";
import { NotFoundError } from "../utils/errorHandler.js";
import { APP_URL } from "../config/config.js";

export const getAllUserUrls = wrapAsync(async (req, res) => {
    const { _id } = req.user;
    const urls = await getAllUserUrlsDao(_id);

    const formattedUrls = urls.map(u => ({
        ...u.toObject(),
        shortUrlFull: `${APP_URL}${u.short_url}`
    }));

    res.status(200).json({
        success: true,
        message: "User URLs retrieved successfully",
        urls: formattedUrls
    });
});

export const getUserStats = wrapAsync(async (req, res) => {
    const { _id } = req.user;
    const stats = await getUserStatsDao(_id);

    res.status(200).json({
        success: true,
        stats
    });
});

export const deleteUserUrl = wrapAsync(async (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;

    const deleted = await deleteShortUrlDao(id, _id);
    if (!deleted) {
        throw new NotFoundError("URL not found or unauthorized");
    }

    res.status(200).json({
        success: true,
        message: "URL deleted successfully"
    });
});