import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", auth, getDashboardStats);

export default router;
