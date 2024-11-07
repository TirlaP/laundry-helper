import { format } from "date-fns";
import { Download, Edit, Eye, Loader2, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

const Orders = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [filters, setFilters] = useState({
		viewAll: true,
		startDate: "",
		endDate: "",
	});
	const loader = useRef(null);
	const navigate = useNavigate();

	const fetchOrders = async (pageNum = 1, append = false) => {
		try {
			const params = new URLSearchParams();
			params.append("page", pageNum);
			params.append("limit", 10);
			if (filters.viewAll) params.append("viewAll", "true");
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);

			const { data } = await apiClient.get(`/orders?${params.toString()}`);
			if (append) {
				setOrders((prev) => [...prev, ...data.orders]);
			} else {
				setOrders(data.orders);
			}
			setHasMore(data.pagination.hasMore);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error(t("orders.fetchError"));
			setLoading(false);
		}
	};

	const handleObserver = useCallback(
		(entries) => {
			const target = entries[0];
			if (target.isIntersecting && hasMore && !loading) {
				setPage((prev) => prev + 1);
			}
		},
		[hasMore, loading]
	);

	useEffect(() => {
		const option = {
			root: null,
			rootMargin: "20px",
			threshold: 0,
		};
		const observer = new IntersectionObserver(handleObserver, option);
		if (loader.current) observer.observe(loader.current);

		return () => {
			if (loader.current) observer.unobserve(loader.current);
		};
	}, [handleObserver]);

	useEffect(() => {
		setLoading(true);
		setPage(1);
		fetchOrders(1, false);
	}, [filters]);

	useEffect(() => {
		if (page > 1) {
			fetchOrders(page, true);
		}
	}, [page]);

	const handleExport = async (order) => {
		try {
			const response = await apiClient.get(`/orders/${order._id}/export`, {
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			const fileName = order.name
				? `Order-${order.name}-${format(new Date(order.createdAt), "MMddyyyy")}`
				: `Order-${order.orderNumber}`;
			link.setAttribute("download", `${fileName}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error("Error exporting order:", err);
			toast.error(t("orders.exportError"));
		}
	};

	const handleDelete = async (orderId) => {
		if (window.confirm(t("orders.confirmDelete"))) {
			try {
				await apiClient.delete(`/orders/${orderId}`);
				setOrders(orders.filter((order) => order._id !== orderId));
				toast.success(t("orders.deleteSuccess"));
			} catch (err) {
				console.error("Error deleting order:", err);
				toast.error(t("orders.deleteError"));
			}
		}
	};

	// Can delete if admin or if it's user's own order
	const canDelete = (order) => {
		return user.role === "admin" || order.user === user.id;
	};

	// Mobile Order Card Component
	const OrderCard = ({ order }) => (
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
						onClick={() => handleExport(order)}
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
			</div>
		</Card>
	);

	const FiltersSection = () => (
		<Card className="p-4 mb-4">
			<div className="flex flex-col md:flex-row gap-4 items-end">
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("orders.viewOption")}
					</label>
					<select
						className="w-full border rounded-md p-2"
						value={filters.viewAll ? "all" : "mine"}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								viewAll: e.target.value === "all",
							}))
						}
					>
						<option value="mine">{t("orders.myOrders")}</option>
						<option value="all">{t("orders.allOrders")}</option>
					</select>
				</div>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("orders.startDate")}
					</label>
					<input
						type="date"
						className="w-full border rounded-md p-2"
						value={filters.startDate}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								startDate: e.target.value,
							}))
						}
					/>
				</div>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("orders.endDate")}
					</label>
					<input
						type="date"
						className="w-full border rounded-md p-2"
						value={filters.endDate}
						onChange={(e) =>
							setFilters((prev) => ({
								...prev,
								endDate: e.target.value,
							}))
						}
					/>
				</div>
			</div>
		</Card>
	);

	if (loading && page === 1) {
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
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{t("orders.title")}</h1>
				<button
					onClick={() => navigate("/orders/create")}
					className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					<Plus className="w-4 h-4 mr-2" />
					{t("orders.newOrder")}
				</button>
			</div>

			<FiltersSection />

			{/* Desktop view */}
			<div className="hidden md:block">
				<Card className="p-6">
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
								{orders.map((order) => (
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
													className="text-gray-600 hover:text-gray-900"
													title={t("common.view")}
												>
													<Eye className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleExport(order)}
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
												{canDelete(order) && (
													<button
														onClick={() => handleDelete(order._id)}
														className="text-red-600 hover:text-red-700"
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
				{orders.map((order) => (
					<OrderCard key={order._id} order={order} />
				))}
			</div>

			{/* Loading indicator and infinite scroll trigger */}
			<div ref={loader} className="h-10 flex items-center justify-center">
				{loading && page > 1 && (
					<div className="flex items-center text-gray-600">
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						{t("common.loading")}
					</div>
				)}
			</div>
		</div>
	);
};

export default Orders;

