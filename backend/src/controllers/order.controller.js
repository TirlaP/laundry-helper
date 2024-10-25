import { Parser } from "json2csv";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res) => {
	try {
		const { items, name } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		// Verify and transform items
		const transformedItems = await Promise.all(
			items.map(async (item) => {
				const product = await Product.findById(item.product);
				if (!product) {
					throw new Error(`Product not found with id: ${item.product}`);
				}

				return {
					product: product._id,
					name: product.name,
					quantity: item.quantity,
					price: product.price,
				};
			})
		);

		const total = transformedItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		// Create new order using the user's actual username
		const order = new Order({
			name: name || undefined,
			orderNumber: `ORD${Date.now()}`,
			user: userId,
			createdBy: req.user.username || req.user.email || "Anonymous",
			items: transformedItems,
			total,
		});

		await order.save();
		await order.populate("items.product");
		res.status(201).json(order);
	} catch (error) {
		console.error("Order creation error:", error);
		res.status(500).json({ message: error.message });
	}
};

export const getOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user.id })
			.populate("items.product")
			.populate("user", "displayName") // Add this to get user info
			.sort({ createdAt: -1 });
		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const order = await Order.findOneAndUpdate(
			{ _id: id, user: req.user.id },
			req.body,
			{ new: true }
		).populate("items.product");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}
		res.status(200).json(order);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getOrderById = async (req, res) => {
	try {
		const order = await Order.findOne({
			_id: req.params.id,
			user: req.user.id,
		})
			.populate("items.product")
			.populate("user", "displayName"); // Add this to get user info

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json(order);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteOrder = async (req, res) => {
	try {
		const order = await Order.findOneAndDelete({
			_id: req.params.id,
			user: req.user.id,
		});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json({ message: "Order deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const exportOrder = async (req, res) => {
	try {
		const order = await Order.findOne({
			_id: req.params.id,
			user: req.user.id,
		})
			.populate("items.product")
			.populate("user", "displayName");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const fields = [
			"orderNumber",
			"name",
			"createdBy",
			"productName",
			"quantity",
			"price",
			"totalPrice",
			"category",
		];

		const data = order.items.map((item) => ({
			orderNumber: order.orderNumber,
			name: order.name || "N/A",
			createdBy: order.createdBy,
			productName: item.name,
			quantity: item.quantity,
			price: item.price,
			totalPrice: item.price * item.quantity,
			category: item.product.category,
		}));

		const json2csvParser = new Parser({ fields });
		const csv = json2csvParser.parse(data);

		res.header("Content-Type", "text/csv");
		res.attachment(`order-${order.orderNumber}.csv`);
		res.send(csv);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
