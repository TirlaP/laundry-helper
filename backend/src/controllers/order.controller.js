import { Parser } from "json2csv";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res) => {
	try {
		const { items, name } = req.body;

		// Verify and transform items
		const transformedItems = await Promise.all(
			items.map(async (item) => {
				const product = await Product.findById(item.product); // Changed from item.productId to item.product
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

		// Calculate total
		const total = transformedItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		const order = new Order({
			name: name || undefined, // Added name field
			orderNumber: `ORD${Date.now()}`,
			user: req.user.id,
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
		}).populate("items.product");

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
		}).populate("items.product");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const fields = [
			"orderNumber",
			"name",
			"productName",
			"quantity",
			"price",
			"totalPrice",
			"category",
		];
		const data = order.items.map((item) => ({
			orderNumber: order.orderNumber,
			name: order.name || "N/A",
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
