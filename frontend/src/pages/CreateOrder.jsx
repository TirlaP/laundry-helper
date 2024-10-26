import { Filter, Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

// OrderSummary Component with quantity controls
const OrderSummary = ({
	currentOrder,
	products,
	updateItemQuantity,
	handleSaveOrder,
	t,
	i18n,
}) => (
	<div className="space-y-4">
		<h2 className="text-lg font-semibold">{t("orders.orderSummary")}</h2>

		{currentOrder.items.length === 0 ? (
			<div className="text-center py-6 space-y-2">
				<div className="text-4xl mb-2">🛍️</div>
				<p className="text-gray-500">{t("orders.noItems")}</p>
				<p className="text-sm text-gray-400">{t("orders.availableProducts")}</p>
			</div>
		) : (
			<>
				<div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
					{currentOrder.items.map((item) => (
						<div
							key={item.product}
							className="space-y-2 pb-4 border-b last:border-b-0"
						>
							<div className="font-medium text-lg">
								{i18n.language === "es"
									? products.find((p) => p._id === item.product)?.nameEs
									: products.find((p) => p._id === item.product)?.name}
							</div>
							<div className="text-gray-500">
								${item.price.toFixed(2)} {t("common.each")}
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2 bg-gray-50 rounded-full border p-1">
									<button
										onClick={() => {
											const product = products.find(
												(p) => p._id === item.product
											);
											updateItemQuantity(product, item.quantity - 1);
										}}
										className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
									>
										<Minus className="w-4 h-4 text-gray-600" />
									</button>
									<span className="w-8 text-center font-medium">
										{item.quantity}
									</span>
									<button
										onClick={() => {
											const product = products.find(
												(p) => p._id === item.product
											);
											updateItemQuantity(product, item.quantity + 1);
										}}
										className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
									>
										<Plus className="w-4 h-4 text-gray-600" />
									</button>
								</div>
								<div className="font-medium">
									${(item.price * item.quantity).toFixed(2)}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="pt-4 border-t">
					<div className="flex justify-between text-lg font-bold">
						<span>{t("common.total")}</span>
						<span>${currentOrder.total.toFixed(2)}</span>
					</div>
				</div>
			</>
		)}

		<div className="flex gap-3 mt-4">
			<button
				onClick={() => window.history.back()}
				className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
			>
				{t("common.cancel")}
			</button>
			<button
				onClick={handleSaveOrder}
				disabled={currentOrder.items.length === 0}
				className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
			>
				{t("common.save")}
			</button>
		</div>
	</div>
);

// MobileOrderSummary Component
const MobileOrderSummary = ({
	currentOrder,
	products,
	updateItemQuantity,
	handleSaveOrder,
	t,
	i18n,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (isExpanded && !e.target.closest(".mobile-summary-content")) {
				setIsExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isExpanded]);

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
			<div className="max-w-[1200px] mx-auto mobile-summary-content">
				<div className="border-t">
					<div
						className={`px-6 py-4 flex items-center justify-between ${
							currentOrder.items.length > 0 ? "cursor-pointer" : ""
						}`}
						onClick={() =>
							currentOrder.items.length > 0 && setIsExpanded(!isExpanded)
						}
					>
						<div className="flex items-center gap-2">
							<span className="font-semibold">{t("orders.orderSummary")}</span>
							<div className="flex items-center text-sm">
								<span className="text-gray-500">
									({currentOrder.items.length}{" "}
									{currentOrder.items.length === 1
										? t("common.item")
										: t("common.items")}
									)
								</span>
								{currentOrder.items.length > 0 && (
									<span className="ml-2 text-blue-600">
										{isExpanded
											? "Click outside to minimize"
											: "Click to view details"}
									</span>
								)}
							</div>
						</div>
						<span className="font-bold">${currentOrder.total.toFixed(2)}</span>
					</div>

					{currentOrder.items.length > 0 && (
						<div
							className={`overflow-hidden transition-all duration-300
              ${isExpanded ? "border-t" : ""}`}
						>
							<div
								className={`transition-all duration-300 ${
									isExpanded ? "max-h-[40vh] opacity-100" : "max-h-0 opacity-0"
								}`}
							>
								<div className="px-6 overflow-y-auto max-h-[40vh]">
									<div className="py-4 space-y-3">
										{currentOrder.items.map((item) => (
											<div
												key={item.product}
												className="flex items-center justify-between py-2 border-b last:border-b-0"
											>
												<div className="flex-1 min-w-0 pr-4">
													<div className="font-medium truncate">
														{i18n.language === "es"
															? products.find((p) => p._id === item.product)
																	?.nameEs
															: products.find((p) => p._id === item.product)
																	?.name}
													</div>
													<div className="text-sm text-gray-500">
														${item.price.toFixed(2)} {t("common.each")}
													</div>
												</div>
												<div className="flex items-center gap-4">
													<div className="flex items-center bg-gray-50 rounded-full border p-1">
														<button
															onClick={(e) => {
																e.stopPropagation();
																const product = products.find(
																	(p) => p._id === item.product
																);
																updateItemQuantity(product, item.quantity - 1);
															}}
															className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
														>
															<Minus className="w-4 h-4 text-gray-600" />
														</button>
														<span className="w-8 text-center font-medium">
															{item.quantity}
														</span>
														<button
															onClick={(e) => {
																e.stopPropagation();
																const product = products.find(
																	(p) => p._id === item.product
																);
																updateItemQuantity(product, item.quantity + 1);
															}}
															className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
														>
															<Plus className="w-4 h-4 text-gray-600" />
														</button>
													</div>
													<div className="w-20 text-right font-medium">
														${(item.price * item.quantity).toFixed(2)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="px-6 py-4 border-t">
						<div className="flex gap-3 max-w-md mx-auto">
							<button
								onClick={() => window.history.back()}
								className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
							>
								{t("common.cancel")}
							</button>
							<button
								onClick={handleSaveOrder}
								disabled={currentOrder.items.length === 0}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
							>
								{t("common.save")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const CreateOrder = () => {
	const { user } = useAuth();
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [orderName, setOrderName] = useState("");
	const [currentOrder, setCurrentOrder] = useState({ items: [], total: 0 });
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const { data } = await apiClient.get("/products");
				setProducts(data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching products:", error);
				setLoading(false);
			}
		};
		fetchProducts();
	}, []);

	const organizedProducts = useMemo(() => {
		const organized = {};
		products.forEach((product) => {
			if (!organized[product.category]) {
				organized[product.category] = [];
			}
			organized[product.category].push(product);
		});
		return organized;
	}, [products]);

	const filteredCategories = useMemo(() => {
		if (!searchQuery && selectedCategory === "all") {
			return Object.keys(organizedProducts);
		}

		return Object.keys(organizedProducts).filter((category) => {
			if (selectedCategory !== "all" && category !== selectedCategory) {
				return false;
			}

			return organizedProducts[category].some((product) => {
				const name = i18n.language === "es" ? product.nameEs : product.name;
				return name.toLowerCase().includes(searchQuery.toLowerCase());
			});
		});
	}, [organizedProducts, searchQuery, selectedCategory, i18n.language]);

	const getItemQuantity = (productId) => {
		const item = currentOrder.items.find((item) => item.product === productId);
		return item ? item.quantity : 0;
	};

	const updateItemQuantity = (product, quantity) => {
		setCurrentOrder((prev) => {
			const updatedItems = prev.items
				.map((item) => {
					if (item.product === product._id) {
						return quantity > 0
							? {
									...item,
									quantity: quantity,
							  }
							: null;
					}
					return item;
				})
				.filter(Boolean);

			if (
				!prev.items.find((item) => item.product === product._id) &&
				quantity > 0
			) {
				updatedItems.push({
					product: product._id,
					name: i18n.language === "es" ? product.nameEs : product.name,
					price: product.price,
					quantity: quantity,
				});
			}

			const newTotal = updatedItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			return {
				items: updatedItems,
				total: newTotal,
			};
		});
	};

	const handleSaveOrder = async () => {
		try {
			const orderData = {
				name: orderName,
				items: currentOrder.items.map((item) => ({
					product: item.product,
					quantity: item.quantity,
					price: item.price,
				})),
				createdBy: user?.username || user?.email || "Anonymous",
			};

			const response = await apiClient.post("/orders", orderData);
			if (response.data) {
				navigate("/orders");
			}
		} catch (error) {
			console.error("Error saving order:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				{t("common.loading")}
			</div>
		);
	}

	return (
		<div className="h-full max-w-[1800px] mx-auto px-4 md:px-6 pb-24 lg:pb-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-xl md:text-2xl font-bold">
					{t("orders.createOrder")}
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
				<div className="lg:col-span-2">
					<Card className="p-4 md:p-6 h-[calc(100vh-200px)]">
						<div className="h-full flex flex-col">
							<div className="space-y-4 mb-4">
								<input
									type="text"
									placeholder={t("orders.orderNamePlaceholder")}
									value={orderName}
									onChange={(e) => setOrderName(e.target.value)}
									className="w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
								/>

								<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
									<div className="flex-1 relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
										<input
											type="text"
											placeholder={t("orders.searchProducts")}
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
										/>
									</div>
									<button
										onClick={() => setShowFilters(!showFilters)}
										className="px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors sm:w-auto"
									>
										<Filter className="w-4 h-4" />
										{t("common.filters")}
									</button>
								</div>

								{showFilters && (
									<div className="flex flex-wrap gap-2 p-3 md:p-4 bg-gray-50 rounded-lg">
										<button
											onClick={() => setSelectedCategory("all")}
											className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
												selectedCategory === "all"
													? "bg-blue-600 text-white"
													: "bg-white border hover:bg-gray-50"
											}`}
										>
											{t("common.all")}
										</button>
										{Object.keys(organizedProducts).map((category) => (
											<button
												key={category}
												onClick={() => setSelectedCategory(category)}
												className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
													selectedCategory === category
														? "bg-blue-600 text-white"
														: "bg-white border hover:bg-gray-50"
												}`}
											>
												{t(`categories.${category}`)}
											</button>
										))}
									</div>
								)}
							</div>

							<div className="flex-1 overflow-y-auto">
								{filteredCategories.map((category) => (
									<div key={category} className="mb-6 last:mb-0">
										<h3 className="text-base md:text-lg font-semibold mb-3">
											{t(`categories.${category}`)}
										</h3>
										<div className="bg-white rounded-lg border divide-y">
											{organizedProducts[category]
												.filter((product) => {
													if (!searchQuery) return true;
													const name =
														i18n.language === "es"
															? product.nameEs
															: product.name;
													return name
														.toLowerCase()
														.includes(searchQuery.toLowerCase());
												})
												.map((product) => (
													<div
														key={product._id}
														className="flex items-center justify-between py-2 px-3 md:px-4"
													>
														<div className="flex-1 min-w-0 pr-4">
															<span className="text-sm md:text-base">
																{i18n.language === "es"
																	? product.nameEs
																	: product.name}
															</span>
														</div>
														<div className="flex items-center gap-3 md:gap-8">
															<div className="w-20 text-right font-medium text-sm md:text-base">
																${product.price.toFixed(2)}
															</div>
															<div className="flex items-center bg-gray-50 rounded-full border p-1">
																<button
																	onClick={() =>
																		updateItemQuantity(
																			product,
																			getItemQuantity(product._id) - 1
																		)
																	}
																	className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
																	disabled={getItemQuantity(product._id) === 0}
																>
																	<Minus className="w-4 h-4 text-gray-600" />
																</button>
																<span className="w-8 text-center font-medium text-sm md:text-base">
																	{getItemQuantity(product._id)}
																</span>
																<button
																	onClick={() =>
																		updateItemQuantity(
																			product,
																			getItemQuantity(product._id) + 1
																		)
																	}
																	className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors"
																>
																	<Plus className="w-4 h-4 text-gray-600" />
																</button>
															</div>
														</div>
													</div>
												))}
										</div>
									</div>
								))}
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
							t={t}
							i18n={i18n}
						/>
					</Card>
				</div>

				{/* Mobile Order Summary */}
				<div className="lg:hidden">
					<MobileOrderSummary
						currentOrder={currentOrder}
						products={products}
						updateItemQuantity={updateItemQuantity}
						handleSaveOrder={handleSaveOrder}
						t={t}
						i18n={i18n}
					/>
				</div>
			</div>
		</div>
	);
};

export default CreateOrder;
