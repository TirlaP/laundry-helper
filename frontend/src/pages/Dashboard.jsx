// src/pages/Dashboard.js

import { format } from "date-fns";
import {
	DollarSign,
	Download,
	Edit,
	Eye,
	Package,
	Trash,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

/**
 * Mobile Order Card Component
 * Now includes authorization checks for edit and delete buttons.
 */
const OrderCard = ({ order, onExport, onDelete, navigate, t, user }) => {
	/**
	 * Determine if the current user can delete the order.
	 * Admins can delete any order; members can delete only their own.
	 */
	const canDelete = () => {
		return user.role === "admin" || order.user._id === user.id;
	};

	/**
	 * Determine if the current user can edit the order.
	 * Admins can edit any order; members can edit only their own.
	 */
	const canEdit = () => {
		return user.role === "admin" || order.user._id === user.id;
	};

	return (
		<Card className="mb-4 p-4">
			<div className="space-y-2">
				<div className="flex justify-between items-start">
					<div>
						<div className="space-y-1">
							<p className="text-sm text-gray-600">#{order.orderNumber}</p>
							<h3 className="font-semibold">{order.name || "-"}</h3>
						</div>
						<p className="text-sm text-gray-500 mt-1">
							{format(new Date(order.createdAt), "MMM dd, yyyy")}
						</p>
						<p className="text-sm text-gray-600 mt-1">
							{t("common.by")} {order.createdBy}
						</p>
					</div>
					<div className="text-right">
						<div className="font-bold">${order.total.toFixed(2)}</div>
						<div className="text-sm text-gray-500">
							{order.items.length}{" "}
							{order.items.length === 1 ? t("common.item") : t("common.items")}
						</div>
					</div>
				</div>

				<div className="flex justify-end space-x-2 pt-2">
					<button
						onClick={() => navigate(`/orders/${order._id}`)}
						className="p-2 text-gray-600 hover:text-gray-900"
						title={t("common.view")}
					>
						<Eye className="w-4 h-4" />
					</button>
					<button
						onClick={() => onExport(order._id, order.orderNumber)}
						className="p-2 text-green-600 hover:text-green-700"
						title={t("orders.export")}
					>
						<Download className="w-4 h-4" />
					</button>
					{canEdit() && (
						<button
							onClick={() => navigate(`/orders/${order._id}/edit`)}
							className="p-2 text-blue-600 hover:text-blue-700"
							title={t("common.edit")}
						>
							<Edit className="w-4 h-4" />
						</button>
					)}
					{canDelete() && (
						<button
							onClick={() => onDelete(order._id)}
							className="p-2 text-red-600 hover:text-red-700"
							title={t("common.delete")}
						>
							<Trash className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</Card>
	);
};

/**
 * Dashboard Component
 * Now includes authorization checks for edit and delete buttons on recent orders.
 */
const Dashboard = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [stats, setStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		averageOrderValue: 0,
		totalUsers: 0,
		isAdmin: false,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	/**
	 * Fetch dashboard statistics and recent orders.
	 */
	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const { data } = await apiClient.get("/dashboard/stats");

				setStats({
					totalOrders: Math.floor(data.stats.totalOrders),
					totalRevenue: data.stats.totalRevenue,
					averageOrderValue: data.stats.averageOrderValue,
					totalUsers: data.stats.totalUsers,
					isAdmin: data.stats.isAdmin,
				});

				setRecentOrders(data.recentOrders);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				toast.error(t("dashboard.fetchError"));
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [t]);

	/**
	 * Export an order as an Excel file.
	 */
	const handleExport = async (orderId, orderNumber) => {
		try {
			const response = await apiClient.get(`/orders/${orderId}/export`, {
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `order-${orderNumber}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error("Error exporting order:", err);
			toast.error(t("dashboard.exportError"));
		}
	};

	/**
	 * Delete an order after confirmation.
	 * - Admins can delete any order.
	 * - Members can delete only their own orders.
	 */
	const handleDelete = async (orderId) => {
		if (window.confirm(t("orders.confirmDelete"))) {
			try {
				await apiClient.delete(`/orders/${orderId}`);
				setRecentOrders(recentOrders.filter((order) => order._id !== orderId));
				// Update total orders count
				setStats((prev) => ({
					...prev,
					totalOrders: prev.totalOrders - 1,
				}));
				toast.success(t("orders.deleteSuccess"));
			} catch (err) {
				console.error("Error deleting order:", err);
				toast.error(t("orders.deleteError"));
			}
		}
	};

	/**
	 * Format currency values for display.
	 */
	const formatCurrency = (value) => {
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(1)}K`;
		}
		return `$${value.toFixed(2)}`;
	};

	/**
	 * Determine if the current user can delete the order.
	 * Admins can delete any order; members can delete only their own.
	 */
	const canDelete = (order) => {
		return user.role === "admin" || order.user._id === user.id;
	};

	/**
	 * Determine if the current user can edit the order.
	 * Admins can edit any order; members can edit only their own.
	 */
	const canEdit = (order) => {
		return user.role === "admin" || order.user._id === user.id;
	};

	/**
	 * Render loading indicator.
	 */
	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg flex items-center">
					<div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
					{t("common.loading")}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

			<div
				className={`grid grid-cols-1 gap-4 ${
					stats.isAdmin
						? "sm:grid-cols-2 lg:grid-cols-4"
						: "sm:grid-cols-2 lg:grid-cols-3"
				}`}
			>
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								{t("dashboard.totalOrders")}
							</p>
							<h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<Package className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								{t("dashboard.totalRevenue")}
							</p>
							<h3 className="text-2xl font-bold mt-1">
								{formatCurrency(stats.totalRevenue)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>

				<Card
					className={`p-6 ${!stats.isAdmin && "sm:col-span-2 lg:col-span-1"}`}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								{t("dashboard.averageOrderValue")}
							</p>
							<h3 className="text-2xl font-bold mt-1">
								{formatCurrency(stats.averageOrderValue)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>

				{/* Only show total users card for admin */}
				{stats.isAdmin && (
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">
									{t("dashboard.totalUsers")}
								</p>
								<h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
							</div>
							<div className="p-3 bg-blue-50 rounded-full">
								<Users className="w-6 h-6 text-blue-500" />
							</div>
						</div>
					</Card>
				)}
			</div>

			{/* Desktop view */}
			<div className="hidden md:block">
				<Card className="p-6">
					<h2 className="text-lg font-semibold mb-4">
						{t("dashboard.recentOrders")}
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left border-b">
									<th className="pb-3 font-semibold">
										{t("orders.orderNumber")}
									</th>
									<th className="pb-3 font-semibold">{t("common.name")}</th>
									<th className="pb-3 font-semibold">{t("common.date")}</th>
									<th className="pb-3 font-semibold">
										{t("orders.createdBy")}
									</th>
									<th className="pb-3 font-semibold">{t("common.items")}</th>
									<th className="pb-3 font-semibold text-right">
										{t("common.total")}
									</th>
									<th className="pb-3 font-semibold text-right">
										{t("common.actions")}
									</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map((order) => (
									<tr
										key={order._id}
										className="border-b last:border-b-0 hover:bg-gray-50"
									>
										<td className="py-3">#{order.orderNumber}</td>
										<td className="py-3">{order.name || "-"}</td>
										<td className="py-3">
											{format(new Date(order.createdAt), "MMM dd, yyyy")}
										</td>
										<td className="py-3">{order.createdBy}</td>
										<td className="py-3">
											{order.items.length}{" "}
											{order.items.length === 1
												? t("common.item")
												: t("common.items")}
										</td>
										<td className="py-3 text-right">
											${order.total.toFixed(2)}
										</td>
										<td className="py-3 text-right">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => navigate(`/orders/${order._id}`)}
													className="p-2 text-gray-600 hover:text-gray-900"
													title={t("common.view")}
												>
													<Eye className="w-4 h-4" />
												</button>
												<button
													onClick={() =>
														handleExport(order._id, order.orderNumber)
													}
													className="p-2 text-green-600 hover:text-green-700"
													title={t("orders.export")}
												>
													<Download className="w-4 h-4" />
												</button>
												{canEdit(order) && (
													<button
														onClick={() =>
															navigate(`/orders/${order._id}/edit`)
														}
														className="p-2 text-blue-600 hover:text-blue-700"
														title={t("common.edit")}
													>
														<Edit className="w-4 h-4" />
													</button>
												)}
												{canDelete(order) && (
													<button
														onClick={() => handleDelete(order._id)}
														className="p-2 text-red-600 hover:text-red-700"
														title={t("common.delete")}
													>
														<Trash className="w-4 h-4" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			</div>

			{/* Mobile view */}
			<div className="md:hidden">
				<h2 className="text-lg font-semibold mb-4">
					{t("dashboard.recentOrders")}
				</h2>
				{recentOrders.map((order) => (
					<OrderCard
						key={order._id}
						order={order}
						onExport={handleExport}
						onDelete={handleDelete}
						navigate={navigate}
						t={t}
						user={user}
					/>
				))}
			</div>
		</div>
	);
};

export default Dashboard;

