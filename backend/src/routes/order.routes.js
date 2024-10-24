import express from "express";
import {
	createOrder,
	deleteOrder,
	exportOrder,
	getOrderById,
	getOrders,
	updateOrder,
} from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getOrders);
router.get("/:id", auth, getOrderById);
router.post("/", auth, createOrder);
router.put("/:id", auth, updateOrder);
router.delete("/:id", auth, deleteOrder);
router.get("/:id/export", auth, exportOrder);

export default router;
