import express from "express";
import { createShortUrl, getUrlStats } from "../controller/shorturl.controller.js";

const router = express.Router();

// Create short URL (works for both guest and authenticated users)
router.post("/", createShortUrl);

// Get analytics for a specific short code
router.get("/analytics/:code", getUrlStats);

export default router;
