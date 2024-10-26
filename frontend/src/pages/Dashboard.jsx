import { format } from "date-fns";
import { DollarSign, Download, Edit, Eye, Package, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

// Utility function to format numbers with k/m suffix
const formatNumber = (num) => {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}m`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`;
	}
	return num.toFixed(2);
};

// Mobile Order Card Component
const OrderCard = ({ order, onExport, onDelete, navigate, t }) => (
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
				<button
					onClick={() => navigate(`/orders/${order._id}/edit`)}
					className="p-2 text-blue-600 hover:text-blue-700"
					title={t("common.edit")}
				>
					<Edit className="w-4 h-4" />
				</button>
				<button
					onClick={() => onDelete(order._id)}
					className="p-2 text-red-600 hover:text-red-700"
					title={t("common.delete")}
				>
					<Trash className="w-4 h-4" />
				</button>
			</div>
		</div>
	</Card>
);

const Dashboard = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [stats, setStats] = useState({
		totalOrders: 0,
		totalRevenue: 0,
		averageOrderValue: 0,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const { data: orders } = await apiClient.get("/orders");
				const total = orders.reduce((sum, order) => sum + order.total, 0);

				setStats({
					totalOrders: orders.length,
					totalRevenue: total,
					averageOrderValue: orders.length ? total / orders.length : 0,
				});

				setRecentOrders(orders.slice(0, 5));
				setLoading(false);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

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
		}
	};

	const handleDelete = async (orderId) => {
		if (window.confirm(t("orders.confirmDelete"))) {
			try {
				await apiClient.delete(`/orders/${orderId}`);
				setRecentOrders(recentOrders.filter((order) => order._id !== orderId));
			} catch (err) {
				console.error("Error deleting order:", err);
			}
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg">{t("common.loading")}</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
								${formatNumber(stats.totalRevenue)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>

				<Card className="p-6 sm:col-span-2 md:col-span-1">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								{t("dashboard.averageOrderValue")}
							</p>
							<h3 className="text-2xl font-bold mt-1">
								${formatNumber(stats.averageOrderValue)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>
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
												<button
													onClick={() => navigate(`/orders/${order._id}/edit`)}
													className="p-2 text-blue-600 hover:text-blue-700"
													title={t("common.edit")}
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDelete(order._id)}
													className="p-2 text-red-600 hover:text-red-700"
													title={t("common.delete")}
												>
													<Trash className="w-4 h-4" />
												</button>
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
					/>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
