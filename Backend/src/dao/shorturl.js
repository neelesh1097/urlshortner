import ShortUrl from "../models/shorturl.model.js";

/**
 * Save a new short URL to MongoDB
 */
export const saveShortUrl = async (url, shortUrlCode, userId = null, title = "") => {
    const newUrl = new ShortUrl({
        full_url: url,
        short_url: shortUrlCode,
        title: title || url,
        user: userId || null,
    });

    return await newUrl.save();
};

/**
 * Find short URL by code, increment clicks, and record click log
 */
export const getShortUrl = async (shortUrlCode, metadata = {}) => {
    const update = {
        $inc: { clicks: 1 }
    };

    if (metadata.userAgent || metadata.referrer) {
        update.$push = {
            clickLogs: {
                $each: [{
                    timestamp: new Date(),
                    userAgent: metadata.userAgent || "Unknown",
                    referrer: metadata.referrer || "Direct",
                }],
                $slice: -100 // Keep the last 100 click events for analytics
            }
        };
    }

    return await ShortUrl.findOneAndUpdate(
        { short_url: shortUrlCode },
        update,
        { new: true }
    );
};

/**
 * Find short URL without incrementing clicks (for read/analytics)
 */
export const findShortUrlByCode = async (shortUrlCode) => {
    return await ShortUrl.findOne({ short_url: shortUrlCode }).populate("user", "name email");
};

/**
 * Delete a short URL belonging to a user
 */
export const deleteShortUrlDao = async (id, userId) => {
    return await ShortUrl.findOneAndDelete({ _id: id, user: userId });
};

/**
 * Check if a short code or custom alias already exists
 */
export const checkShortCodeExists = async (code) => {
    const existing = await ShortUrl.findOne({ short_url: code });
    return !!existing;
};