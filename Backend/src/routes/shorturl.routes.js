import express from "express";
import { createShortUrl } from "../controller/shorturl.controller.js";

const router = express.Router();

router.post("/", createShortUrl);

export default router;
