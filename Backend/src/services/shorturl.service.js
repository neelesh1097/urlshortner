import { generateNanoid, isValidUrl, normalizeUrl } from "../utils/helper.js";
import {
    saveShortUrl,
    getShortUrl,
    findShortUrlByCode,
    deleteShortUrlDao,
    checkShortCodeExists
} from "../dao/shorturl.js";
import { getAllUserUrlsDao } from "../dao/user.dao.js";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errorHandler.js";

/**
 * Create a shortened URL without a logged in user
 */
export const createShortUrlWithoutUser = async (rawUrl, customAlias = "", title = "") => {
    const url = normalizeUrl(rawUrl);
    if (!isValidUrl(url)) {
        throw new BadRequestError("Please provide a valid URL");
    }

    let shortCode = customAlias ? customAlias.trim() : "";
    if (shortCode) {
        // Validate custom alias format
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
            throw new BadRequestError("Custom alias must be 3-30 alphanumeric characters or hyphens/underscores");
        }
        const exists = await checkShortCodeExists(shortCode);
        if (exists) {
            throw new ConflictError("Custom alias already in use. Please choose another.");
        }
    } else {
        shortCode = generateNanoid(7);
    }

    const savedDoc = await saveShortUrl(url, shortCode, null, title);
    return savedDoc;
};

/**
 * Create a shortened URL linked to an authenticated user
 */
export const createShortUrlWithUser = async (rawUrl, userId, customAlias = "", title = "") => {
    const url = normalizeUrl(rawUrl);
    if (!isValidUrl(url)) {
        throw new BadRequestError("Please provide a valid URL");
    }

    let shortCode = customAlias ? customAlias.trim() : "";
    if (shortCode) {
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(shortCode)) {
            throw new BadRequestError("Custom alias must be 3-30 alphanumeric characters or hyphens/underscores");
        }
        const exists = await checkShortCodeExists(shortCode);
        if (exists) {
            throw new ConflictError("Custom alias already in use. Please choose another.");
        }
    } else {
        shortCode = generateNanoid(7);
    }

    const savedDoc = await saveShortUrl(url, shortCode, userId, title);
    return savedDoc;
};

/**
 * Resolve short code to target URL and increment clicks
 */
export const resolveShortUrl = async (shortCode, metadata = {}) => {
    const urlDoc = await getShortUrl(shortCode, metadata);
    if (!urlDoc) {
        throw new NotFoundError("Short URL not found");
    }
    return urlDoc;
};

/**
 * Get detailed analytics for a short URL
 */
export const getShortUrlAnalytics = async (shortCode) => {
    const urlDoc = await findShortUrlByCode(shortCode);
    if (!urlDoc) {
        throw new NotFoundError("Short URL not found");
    }
    return urlDoc;
};

/**
 * Delete a user's short URL
 */
export const deleteShortUrl = async (urlId, userId) => {
    const deleted = await deleteShortUrlDao(urlId, userId);
    if (!deleted) {
        throw new NotFoundError("URL not found or unauthorized to delete");
    }
    return deleted;
};

/**
 * Get all URLs for a user
 */
export const getUserUrls = async (userId) => {
    return await getAllUserUrlsDao(userId);
};