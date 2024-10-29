import express from "express";
import {
	createInitialAdmin,
	deleteUser,
	getUsers,
	login,
	register,
	verifyToken,
} from "../controllers/auth.controller.js";
import { adminAuth, auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", adminAuth, register); // Only admins can register new users
router.get("/users", adminAuth, getUsers);
router.delete("/users/:id", adminAuth, deleteUser);
router.post("/create-admin", createInitialAdmin); // Protected by env variable check in controller
router.get("/verify", auth, verifyToken);

export default router;
