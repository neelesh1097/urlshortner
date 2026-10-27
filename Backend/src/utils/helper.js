import { nanoid } from "nanoid";

export const generateNanoid = (length = 7) => {
    return nanoid(length);
};

export const isValidUrl = (string) => {
    try {
        const parsed = new URL(string);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

export const normalizeUrl = (string) => {
    let trimmed = string.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = "https://" + trimmed;
    }
    return trimmed;
};