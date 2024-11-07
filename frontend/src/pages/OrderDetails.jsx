import { format } from "date-fns";
import { ArrowLeft, Download, Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

const OrderDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const { data } = await apiClient.get(`/orders/${id}`);
				setOrder(data);
				setLoading(false);
			} catch (err) {
				setError(t("orders.errorLoadingOrder"));
				setLoading(false);
			}
		};

		fetchOrder();
	}, [id, t]);

	const handleDelete = async () => {
		if (window.confirm(t("orders.confirmDelete"))) {
			try {
				await apiClient.delete(`/orders/${id}`);
				navigate("/orders");
			} catch (err) {
				setError(t("orders.errorDeletingOrder"));
			}
		}
	};

	const handleExport = async () => {
		try {
			const response = await apiClient.get(`/orders/${id}/export`, {
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `order-${order.orderNumber}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			setError(t("orders.errorExporting"));
		}
	};

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
	if (error) return <div className="p-4 text-red-500">{error}</div>;
	if (!order) return <div className="p-4">{t("orders.notFound")}</div>;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => navigate("/orders")}
						className="text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="w-6 h-6" />
					</button>
					<div>
						<h1 className="text-2xl font-bold">
							{t("orders.orderNumber")} {order.orderNumber}
						</h1>
						<div className="text-gray-500 space-y-1">
							<p>{format(new Date(order.createdAt), "PPpp")}</p>
							<p>
								{t("common.createdBy")}: {order.createdBy}
							</p>
						</div>
					</div>
				</div>

				<div className="flex space-x-2">
					<button
						onClick={handleExport}
						className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
					>
						<Download className="w-4 h-4 mr-2" />
						{t("orders.export")}
					</button>
					<button
						onClick={() => navigate(`/orders/${id}/edit`)}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
					>
						<Edit className="w-4 h-4 mr-2" />
						{t("common.edit")}
					</button>
					<button
						onClick={handleDelete}
						className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
					>
						<Trash className="w-4 h-4 mr-2" />
						{t("common.delete")}
					</button>
				</div>
			</div>

			<Card className="p-6">
				<div className="space-y-6">
					{order.name && (
						<div>
							<h3 className="text-sm font-medium text-gray-500">
								{t("orders.orderName")}
							</h3>
							<p className="mt-1 text-lg">{order.name}</p>
						</div>
					)}

					<div>
						<h3 className="text-lg font-medium mb-4">
							{t("orders.orderItems")}
						</h3>
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("common.product")}
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("common.quantity")}
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("common.price")}
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t("common.total")}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{order.items.map((item, index) => (
									<tr key={index}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{i18n.language === "es"
														? item.product.nameEs
														: item.product.name}
												</div>
												<div className="text-sm text-gray-500">
													{t(`categories.${item.product.category}`)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
											{item.quantity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
											${item.price.toFixed(2)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
											${(item.price * item.quantity).toFixed(2)}
										</td>
									</tr>
								))}
								<tr className="bg-gray-50">
									<td colSpan="3" className="px-6 py-4 text-right font-medium">
										{t("common.total")}:
									</td>
									<td className="px-6 py-4 text-right text-lg font-bold">
										${order.total.toFixed(2)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default OrderDetails;

