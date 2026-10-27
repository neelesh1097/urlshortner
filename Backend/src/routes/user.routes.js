import express from "express";
import { getAllUserUrls, getUserStats, deleteUserUrl } from "../controller/user.controller.js";
import { requireAuth } from "../utils/attachUser.js";

const router = express.Router();

// Require authentication for all user endpoints
router.use(requireAuth);

router.get("/urls", getAllUserUrls);
router.get("/stats", getUserStats);
router.delete("/urls/:id", deleteUserUrl);

export default router;
