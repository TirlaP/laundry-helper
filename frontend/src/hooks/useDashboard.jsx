import { useCallback, useState } from "react";
import apiClient from "../utils/apiClient";

export const useDashboard = () => {
	const [stats, setStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		averageOrderValue: 0,
		recentOrders: [],
		dailyRevenue: [],
		topProducts: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const processDailyRevenue = (orders) => {
		const dailyMap = orders.reduce((acc, order) => {
			const date = new Date(order.createdAt).toLocaleDateString();
			acc[date] = (acc[date] || 0) + order.total;
			return acc;
		}, {});

		return Object.entries(dailyMap)
			.slice(-7)
			.map(([date, value]) => ({
				date,
				revenue: value,
			}));
	};

	const processTopProducts = (orders) => {
		const productMap = new Map();

		orders.forEach((order) => {
			order.items.forEach((item) => {
				const current = productMap.get(item.name) || {
					revenue: 0,
					quantity: 0,
				};
				productMap.set(item.name, {
					revenue: current.revenue + item.price * item.quantity,
					quantity: current.quantity + item.quantity,
				});
			});
		});

		return Array.from(productMap.entries())
			.map(([name, { revenue, quantity }]) => ({
				name,
				revenue,
				quantity,
			}))
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);
	};

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await apiClient.get("/orders");

			const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
			const averageOrderValue =
				data.length > 0 ? totalRevenue / data.length : 0;

			setStats({
				totalOrders: data.length,
				totalRevenue,
				averageOrderValue,
				recentOrders: data.slice(-5).reverse(),
				dailyRevenue: processDailyRevenue(data),
				topProducts: processTopProducts(data),
			});

			setError(null);
		} catch (err) {
			setError("Failed to fetch dashboard data");
			console.error("Error fetching dashboard data:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		stats,
		loading,
		error,
		fetchDashboardData,
	};
};
