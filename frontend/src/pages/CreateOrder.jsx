import { Filter, Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

// OrderSummary Component
const OrderSummary = ({
	currentOrder,
	products,
	updateItemQuantity,
	handleSaveOrder,
	navigate,
	t,
}) => (
	<>
		<h2 className="text-lg font-semibold mb-4">{t("orders.orderSummary")}</h2>
		<div className="max-h-[calc(100vh-300px)] overflow-y-auto">
			<div className="space-y-3">
				{currentOrder.items.map((item) => (
					<div
						key={item.product}
						className="flex items-center justify-between py-2 border-b"
					>
						<div className="flex-1">
							<div className="font-medium">{item.name}</div>
							<div className="text-sm text-gray-500">
								${item.price.toFixed(2)} {t("common.each")}
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<button
								onClick={() => {
									const product = products.find((p) => p._id === item.product);
									updateItemQuantity(product, item.quantity - 1);
								}}
								className="p-1 rounded-full hover:bg-gray-100"
							>
								<Minus className="w-4 h-4 text-gray-600" />
							</button>
							<span className="w-8 text-center">{item.quantity}</span>
							<button
								onClick={() => {
									const product = products.find((p) => p._id === item.product);
									updateItemQuantity(product, item.quantity + 1);
								}}
								className="p-1 rounded-full hover:bg-gray-100"
							>
								<Plus className="w-4 h-4 text-gray-600" />
							</button>
							<div className="w-20 text-right">
								${(item.price * item.quantity).toFixed(2)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>

		<div className="pt-4 mt-4 border-t bg-white">
			{currentOrder.items.length > 0 && (
				<div className="flex justify-between font-bold text-lg mb-4">
					<span>{t("common.total")}:</span>
					<span>${currentOrder.total.toFixed(2)}</span>
				</div>
			)}

			<div className="flex space-x-3">
				<button
					onClick={() => navigate("/orders")}
					className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
				>
					{t("common.cancel")}
				</button>
				<button
					onClick={handleSaveOrder}
					disabled={currentOrder.items.length === 0}
					className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
				>
					{t("common.save")}
				</button>
			</div>
		</div>
	</>
);

// Main CreateOrder Component
const CreateOrder = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [orderName, setOrderName] = useState("");
	const [currentOrder, setCurrentOrder] = useState({
		items: [],
		total: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const { data } = await apiClient.get("/products");
				setProducts(data);
				setLoading(false);
			} catch (err) {
				setError(t("orders.errorLoadingProducts"));
				setLoading(false);
			}
		};

		fetchProducts();
	}, [t]);

	const categories = useMemo(() => {
		const cats = new Set(products.map((product) => product.category));
		return ["all", ...Array.from(cats)];
	}, [products]);

	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const name = i18n.language === "es" ? product.nameEs : product.name;
			const matchesSearch = name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || product.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [products, searchQuery, selectedCategory, i18n.language]);

	const updateItemQuantity = (product, newQuantity) => {
		setCurrentOrder((prev) => {
			const updatedItems = prev.items.filter(
				(item) => item.product !== product._id
			);

			if (newQuantity > 0) {
				updatedItems.push({
					product: product._id,
					name: i18n.language === "es" ? product.nameEs : product.name,
					price: product.price,
					quantity: newQuantity,
				});
			}

			return {
				...prev,
				items: updatedItems,
				total: updatedItems.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				),
			};
		});
	};

	const getItemQuantity = (productId) => {
		return (
			currentOrder.items.find((item) => item.product === productId)?.quantity ||
			0
		);
	};

	const handleSaveOrder = async () => {
		try {
			const orderData = {
				name: orderName,
				items: currentOrder.items,
			};

			await apiClient.post("/orders", orderData);
			navigate("/orders");
		} catch (err) {
			setError(t("orders.errorCreatingOrder"));
			console.error("Error creating order:", err);
		}
	};

	if (loading) return <div className="p-4">{t("common.loading")}</div>;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{t("orders.createOrder")}</h1>
			</div>

			{/* Mobile Order Summary */}
			<div className="lg:hidden">
				<Card className="p-6 sticky top-0 z-10 bg-white">
					<OrderSummary
						currentOrder={currentOrder}
						products={products}
						updateItemQuantity={updateItemQuantity}
						handleSaveOrder={handleSaveOrder}
						navigate={navigate}
						t={t}
					/>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card className="p-6">
						<div className="space-y-4">
							<input
								type="text"
								placeholder={t("orders.orderNamePlaceholder")}
								value={orderName}
								onChange={(e) => setOrderName(e.target.value)}
								className="w-full px-4 py-2 border rounded-md"
							/>

							<div className="flex flex-wrap gap-4">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
										<input
											type="text"
											placeholder={t("orders.searchProducts")}
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border rounded-md"
										/>
									</div>
								</div>
								<button
									onClick={() => setShowFilters(!showFilters)}
									className="px-4 py-2 border rounded-md flex items-center gap-2"
								>
									<Filter className="w-4 h-4" />
									{t("common.filters")}
								</button>
							</div>

							{showFilters && (
								<div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-md">
									{categories.map((category) => (
										<button
											key={category}
											onClick={() => setSelectedCategory(category)}
											className={`px-3 py-1 rounded-full text-sm ${
												selectedCategory === category
													? "bg-blue-600 text-white"
													: "bg-white border hover:bg-gray-50"
											}`}
										>
											{category === "all"
												? t("common.all")
												: t(`categories.${category}`)}
										</button>
									))}
								</div>
							)}

							<div className="max-h-[calc(100vh-400px)] overflow-y-auto">
								<table className="w-full">
									<thead className="sticky top-0 bg-white">
										<tr className="border-b">
											<th className="text-left py-2 w-1/2">
												{t("common.product")}
											</th>
											<th className="text-right py-2 w-1/4">
												{t("common.price")}
											</th>
											<th className="text-right py-2 w-1/4">
												{t("common.quantity")}
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredProducts.map((product) => {
											const quantity = getItemQuantity(product._id);
											return (
												<tr key={product._id} className="border-b">
													<td className="py-3">
														<div>
															<div className="font-medium">
																{i18n.language === "es"
																	? product.nameEs
																	: product.name}
															</div>
															<div className="text-sm text-gray-500">
																{t(`categories.${product.category}`)}
															</div>
														</div>
													</td>
													<td className="text-right py-3">
														${product.price.toFixed(2)}
													</td>
													<td className="text-right py-3">
														<div className="flex items-center justify-end space-x-2">
															<button
																onClick={() =>
																	updateItemQuantity(product, quantity - 1)
																}
																className="p-1 rounded-full hover:bg-gray-100"
																disabled={quantity === 0}
															>
																<Minus className="w-4 h-4 text-gray-600" />
															</button>
															<span className="w-8 text-center">
																{quantity}
															</span>
															<button
																onClick={() =>
																	updateItemQuantity(product, quantity + 1)
																}
																className="p-1 rounded-full hover:bg-gray-100"
															>
																<Plus className="w-4 h-4 text-gray-600" />
															</button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</Card>
				</div>

				{/* Desktop Order Summary */}
				<div className="hidden lg:block">
					<Card className="p-6 sticky top-6">
						<OrderSummary
							currentOrder={currentOrder}
							products={products}
							updateItemQuantity={updateItemQuantity}
							handleSaveOrder={handleSaveOrder}
							navigate={navigate}
							t={t}
						/>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CreateOrder;
