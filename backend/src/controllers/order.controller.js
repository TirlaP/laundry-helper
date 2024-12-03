// controllers/order.controller.js

import ExcelJS from "exceljs";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/**
 * Create a new order.
 */
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

/**
 * Retrieve orders with optional filters and pagination.
 * All authenticated users can view all orders.
 */
export const getOrders = async (req, res) => {
	try {
		const query = {};
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Optional: Filter by specific user if provided
		if (req.query.userId) {
			query.user = req.query.userId;
		}

		// Add date filters if provided
		if (req.query.startDate) {
			query.createdAt = {
				...query.createdAt,
				$gte: new Date(req.query.startDate),
			};
		}
		if (req.query.endDate) {
			query.createdAt = {
				...query.createdAt,
				$lte: new Date(req.query.endDate),
			};
		}

		// Get total count for pagination
		const total = await Order.countDocuments(query);

		// Get paginated orders
		const orders = await Order.find(query)
			.populate("items.product")
			.populate("user", "displayName username email")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		res.status(200).json({
			orders,
			pagination: {
				total,
				page,
				pages: Math.ceil(total / limit),
				hasMore: skip + orders.length < total,
			},
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		res.status(500).json({ message: error.message });
	}
};

/**
 * Update an existing order.
 * - Admins can update any order.
 * - Regular members can only update their own orders.
 */
export const updateOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const { items, name } = req.body;

		// Find the order first
		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Authorization Check: Admins can edit any order; members can edit only their own
		if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ message: "Forbidden: You cannot edit this order" });
		}

		// Transform and verify items, similar to create
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

		// Recalculate total
		const total = transformedItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);

		// Update the order with the new data
		const updatedOrderData = {
			name: name || undefined,
			items: transformedItems,
			total,
			lastModifiedBy: req.user.username || req.user.email || "Anonymous",
			lastModifiedAt: new Date(),
		};

		// Find and update the order
		const updatedOrder = await Order.findByIdAndUpdate(id, updatedOrderData, {
			new: true,
		})
			.populate("items.product")
			.populate("user", "displayName username email");

		res.status(200).json(updatedOrder);
	} catch (error) {
		console.error("Update error:", error);
		res.status(500).json({ message: error.message });
	}
};

/**
 * Retrieve a single order by ID.
 * All authenticated users can view any order.
 */
export const getOrderById = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the order
		const order = await Order.findById(id)
			.populate("items.product")
			.populate("user", "displayName username email");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json(order);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Delete an existing order.
 * - Admins can delete any order.
 * - Regular members can only delete their own orders.
 */
export const deleteOrder = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the order first
		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Authorization Check: Admins can delete any order; members can delete only their own
		if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ message: "Forbidden: You cannot delete this order" });
		}

		// Delete the order
		await Order.findByIdAndDelete(id);

		res.status(200).json({ message: "Order deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Export an order to Excel.
 * - Admins can export any order.
 * - Regular members can only export their own orders.
 */
export const exportOrder = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the order
		const order = await Order.findById(id)
			.populate("items.product")
			.populate("user", "displayName username email");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Authorization Check: Admins can export any order; members can export only their own
		if (
			req.user.role !== "admin" &&
			order.user._id.toString() !== req.user.id
		) {
			return res
				.status(403)
				.json({ message: "Forbidden: You cannot export this order" });
		}

		// Group items by category
		const groupedItems = order.items.reduce((acc, item) => {
			const category = item.product.category;
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(item);
			return acc;
		}, {});

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Order Details");

		// Set columns
		worksheet.columns = [
			{ header: "Order Number", width: 20 },
			{ header: "Order Name", width: 15 },
			{ header: "Created By", width: 25 },
			{ header: "Category", width: 15 },
			{ header: "Product Name", width: 30 },
			{ header: "Quantity", width: 10 },
			{ header: "Price", width: 12 },
			{ header: "Total Price", width: 12 },
		];

		// Style headers
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).alignment = {
			vertical: "middle",
			horizontal: "center",
		};

		// Add data
		let rowIndex = 2;
		const firstDataRow = rowIndex;

		Object.entries(groupedItems).forEach(([category, items]) => {
			const categoryStartRow = rowIndex;

			items.forEach((item) => {
				const row = worksheet.addRow([
					rowIndex === firstDataRow ? order.orderNumber : "",
					rowIndex === firstDataRow ? order.name || "N/A" : "",
					rowIndex === firstDataRow ? order.createdBy : "",
					category,
					item.name,
					item.quantity,
					`$${(item.price * item.quantity).toFixed(2)}`,
					rowIndex === firstDataRow ? `$${order.total.toFixed(2)}` : "",
				]);

				// Center align all cells in the row
				row.eachCell((cell) => {
					cell.alignment = { vertical: "middle", horizontal: "center" };
				});

				rowIndex++;
			});

			// Merge category cells if multiple items
			if (items.length > 1) {
				worksheet.mergeCells(categoryStartRow, 4, rowIndex - 1, 4);
			}
		});

		const lastDataRow = rowIndex - 1;

		// Merge repeating info cells
		worksheet.mergeCells(firstDataRow, 1, lastDataRow, 1); // Order Number
		worksheet.mergeCells(firstDataRow, 2, lastDataRow, 2); // Order Name
		worksheet.mergeCells(firstDataRow, 3, lastDataRow, 3); // Created By
		worksheet.mergeCells(firstDataRow, 8, lastDataRow, 8); // Total Price

		// Add borders to all cells
		worksheet.eachRow((row) => {
			row.eachCell((cell) => {
				cell.border = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" },
				};
			});
		});

		// Generate buffer
		const buffer = await workbook.xlsx.writeBuffer();

		// Send response
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=order-${order.orderNumber}.xlsx`
		);
		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);
		res.send(buffer);
	} catch (error) {
		console.error("Export error:", error);
		res.status(500).json({ message: error.message });
	}
};

