import Order from "../models/order.model.js";
import User from "../models/user.model.js";

export const getDashboardStats = async (req, res) => {
	try {
		// Get all orders
		const orders = await Order.find();

		// Calculate metrics
		const totalOrders = orders.length;
		const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
		const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		// Get total users count based on user role
		let totalUsers = 0;
		if (req.user.role === "admin") {
			// For admin, count all users
			totalUsers = await User.countDocuments();
		}

		// Get recent orders (last 5)
		const recentOrders = await Order.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.populate("user", "username")
			.populate("items.product");

		res.status(200).json({
			stats: {
				totalOrders,
				totalRevenue,
				averageOrderValue,
				totalUsers,
				isAdmin: req.user.role === "admin",
			},
			recentOrders,
		});
	} catch (error) {
		console.error("Dashboard stats error:", error);
		res.status(500).json({ message: error.message });
	}
};
