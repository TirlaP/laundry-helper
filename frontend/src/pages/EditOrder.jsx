import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

const EditOrder = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const [order, setOrder] = useState(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [orderResponse, productsResponse] = await Promise.all([
					apiClient.get(`/orders/${id}`),
					apiClient.get("/products"),
				]);

				setOrder(orderResponse.data);
				setProducts(productsResponse.data);
				setLoading(false);
			} catch (err) {
				setError(t("orders.errorLoadingOrder"));
				setLoading(false);
			}
		};

		fetchData();
	}, [id, t]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await apiClient.put(`/orders/${id}`, order);
			navigate(`/orders/${id}`);
		} catch (err) {
			setError(t("orders.errorUpdatingOrder"));
		}
	};

	const updateItem = (index, field, value) => {
		const newItems = [...order.items];
		newItems[index] = { ...newItems[index], [field]: value };

		// Recalculate total when quantity or product changes
		const total = newItems.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0
		);

		setOrder({
			...order,
			items: newItems,
			total,
		});
	};

	const addItem = () => {
		const defaultProduct = products[0];
		setOrder({
			...order,
			items: [
				...order.items,
				{
					product: defaultProduct._id,
					quantity: 1,
					price: defaultProduct.price,
					name: defaultProduct.name,
					nameEs: defaultProduct.nameEs,
				},
			],
		});
	};

	const removeItem = (index) => {
		const newItems = order.items.filter((_, i) => i !== index);
		const total = newItems.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0
		);
		setOrder({
			...order,
			items: newItems,
			total,
		});
	};

	if (loading) {
		return <div className="p-4">{t("common.loading")}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-500">{error}</div>;
	}

	if (!order) {
		return <div className="p-4">{t("orders.notFound")}</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">
					{t("orders.editOrder")} #{order.orderNumber}
				</h1>
			</div>

			<Card className="p-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Optional Order Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700">
							{t("orders.orderName")}
						</label>
						<input
							type="text"
							value={order.name || ""}
							onChange={(e) => setOrder({ ...order, name: e.target.value })}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					{/* Items */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium">{t("orders.orderItems")}</h2>
							<button
								type="button"
								onClick={addItem}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								{t("orders.addItem")}
							</button>
						</div>

						<div className="space-y-4">
							{order.items.map((item, index) => (
								<div
									key={index}
									className="flex items-center space-x-4 p-4 border rounded-md"
								>
									<div className="flex-1">
										<select
											value={item.product}
											onChange={(e) => {
												const product = products.find(
													(p) => p._id === e.target.value
												);
												updateItem(index, "product", e.target.value);
												updateItem(index, "price", product.price);
												updateItem(index, "name", product.name);
												updateItem(index, "nameEs", product.nameEs);
											}}
											className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
										>
											{products.map((product) => (
												<option key={product._id} value={product._id}>
													{i18n.language === "es"
														? product.nameEs
														: product.name}{" "}
													- ${product.price}
												</option>
											))}
										</select>
									</div>
									<div className="w-32">
										<input
											type="number"
											min="1"
											value={item.quantity}
											onChange={(e) =>
												updateItem(index, "quantity", parseInt(e.target.value))
											}
											className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
										/>
									</div>
									<div className="w-24 text-right">
										${(item.quantity * item.price).toFixed(2)}
									</div>
									<button
										type="button"
										onClick={() => removeItem(index)}
										className="text-red-600 hover:text-red-700"
									>
										{t("common.remove")}
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Total */}
					<div className="flex justify-end space-x-4 items-center">
						<span className="font-medium">{t("common.total")}:</span>
						<span className="text-xl font-bold">${order.total.toFixed(2)}</span>
					</div>

					{/* Actions */}
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={() => navigate(`/orders/${id}`)}
							className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							{t("common.cancel")}
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							{t("common.save")}
						</button>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default EditOrder;
