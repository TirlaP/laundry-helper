import { format } from "date-fns";
import { DollarSign, Download, Edit, Eye, Package, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

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
			link.setAttribute("download", `order-${orderNumber}.csv`);
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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
								${stats.totalRevenue.toFixed(2)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600">
								{t("dashboard.averageOrderValue")}
							</p>
							<h3 className="text-2xl font-bold mt-1">
								${stats.averageOrderValue.toFixed(2)}
							</h3>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<DollarSign className="w-6 h-6 text-blue-500" />
						</div>
					</div>
				</Card>
			</div>

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
									<td className="py-3">
										{format(new Date(order.createdAt), "MMM dd, yyyy")}
									</td>
									<td className="py-3">
										{order.items.length} {t("common.items")}
									</td>
									<td className="py-3 text-right">${order.total.toFixed(2)}</td>
									<td className="py-3 text-right">
										<div className="flex justify-end space-x-2">
											<button
												onClick={() => navigate(`/orders/${order._id}`)}
												className="text-gray-600 hover:text-gray-900"
												title={t("common.view")}
											>
												<Eye className="w-4 h-4" />
											</button>
											<button
												onClick={() =>
													handleExport(order._id, order.orderNumber)
												}
												className="text-green-600 hover:text-green-700"
												title={t("orders.export")}
											>
												<Download className="w-4 h-4" />
											</button>
											<button
												onClick={() => navigate(`/orders/${order._id}/edit`)}
												className="text-blue-600 hover:text-blue-700"
												title={t("common.edit")}
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleDelete(order._id)}
												className="text-red-600 hover:text-red-700"
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
	);
};

export default Dashboard;
