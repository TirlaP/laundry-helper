import express from "express";
import {
	createProduct,
	deleteProduct, // Add this
	getProducts,
	updateProduct,
} from "../controllers/product.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getProducts);
router.post("/", auth, createProduct);
router.put("/:id", auth, updateProduct);
router.delete("/:id", auth, deleteProduct); // Add this route

export default router;
