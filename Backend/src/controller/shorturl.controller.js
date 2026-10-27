import wrapAsync from "../utils/tryCatchWrapper.js";
import {
    createShortUrlWithoutUser,
    createShortUrlWithUser,
    resolveShortUrl,
    getShortUrlAnalytics,
    deleteShortUrl
} from "../services/shorturl.service.js";
import { APP_URL } from "../config/config.js";
import { BadRequestError } from "../utils/errorHandler.js";

/**
 * Create a new short URL (public or user-linked)
 */
export const createShortUrl = wrapAsync(async (req, res) => {
    const { url, customAlias, title } = req.body;

    if (!url) {
        throw new BadRequestError("Target URL is required");
    }

    let urlDoc;
    if (req.user && req.user._id) {
        urlDoc = await createShortUrlWithUser(url, req.user._id, customAlias, title);
    } else {
        urlDoc = await createShortUrlWithoutUser(url, customAlias, title);
    }

    const shortUrlFull = `${APP_URL}${urlDoc.short_url}`;

    res.status(201).json({
        success: true,
        message: "Short URL created successfully",
        data: {
            ...urlDoc.toObject(),
            shortUrlFull,
        }
    });
});

/**
 * Handle redirection when clicking short URL
 */
export const redirectFromShortUrl = wrapAsync(async (req, res) => {
    const { id } = req.params;

    // Collect analytics metadata
    const metadata = {
        userAgent: req.headers["user-agent"] || "Unknown",
        referrer: req.headers["referer"] || req.headers["referrer"] || "Direct",
    };

    const targetUrlDoc = await resolveShortUrl(id, metadata);

    // 302 Found (temporary redirect) ensures click tracking runs every time
    return res.redirect(targetUrlDoc.full_url);
});

/**
 * Get detailed analytics for a short URL
 */
export const getUrlStats = wrapAsync(async (req, res) => {
    const { code } = req.params;
    const urlDoc = await getShortUrlAnalytics(code);

    res.status(200).json({
        success: true,
        data: {
            ...urlDoc.toObject(),
            shortUrlFull: `${APP_URL}${urlDoc.short_url}`,
        }
    });
});

/**
 * Delete a short URL (requires user ownership)
 */
export const deleteUserShortUrl = wrapAsync(async (req, res) => {
    const { id } = req.params;
    await deleteShortUrl(id, req.user._id);

    res.status(200).json({
        success: true,
        message: "Short URL deleted successfully"
    });
});
