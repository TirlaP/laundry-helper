// src/pages/EditOrder.js
import { ArrowLeft, Filter, Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { MobileOrderSummary } from "../components/MobileOrderSummary";
import { OrderSummary } from "../components/OrderSummary";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

const EditOrder = () => {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();
	const { id } = useParams();

	// Core state
	const [orderName, setOrderName] = useState("");
	const [currentOrder, setCurrentOrder] = useState({ items: [], total: 0 });
	const [products, setProducts] = useState([]);

	// UI state
	const [loading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [error, setError] = useState(null);

	// Fetch order and products data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [orderResponse, productsResponse] = await Promise.all([
					apiClient.get(`/orders/${id}`),
					apiClient.get("/products"),
				]);

				const orderData = orderResponse.data;

				// Authorization Check: Only admin or owner can edit
				if (user.role !== "admin" && orderData.user._id !== user.id) {
					toast.error(t("orders.notAuthorized"));
					navigate("/orders");
					return;
				}

				setOrderName(orderData.name || "");
				setCurrentOrder({
					items: orderData.items.map((item) => ({
						product: item.product._id,
						name:
							i18n.language === "es" ? item.product.nameEs : item.product.name,
						price: item.price,
						quantity: item.quantity,
					})),
					total: orderData.total,
				});

				setProducts(productsResponse.data);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError(t("orders.errorLoadingOrder"));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id, i18n.language, t, user.role, user.id, navigate]);

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
						return quantity > 0 ? { ...item, quantity } : null;
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
					quantity,
				});
			}

			const newTotal = updatedItems.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);

			return { items: updatedItems, total: newTotal };
		});
	};

	const handleCancel = () => {
		if (currentOrder.items.length > 0) {
			toast(
				(toastData) => (
					<div className="flex flex-col gap-2">
						<div>{t("orders.confirmCancel")}</div>
						<div className="flex justify-end gap-2">
							<button
								className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
								onClick={() => toast.dismiss(toastData.id)}
							>
								{t("common.no")}
							</button>
							<button
								className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
								onClick={() => {
									toast.dismiss(toastData.id);
									navigate("/orders");
								}}
							>
								{t("common.yes")}
							</button>
						</div>
					</div>
				),
				{ duration: Infinity }
			);
		} else {
			navigate("/orders");
		}
	};

	const handleSaveOrder = async () => {
		if (isSaving) return;

		setIsSaving(true);
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

			await apiClient.put(`/orders/${id}`, orderData);
			toast.success(t("orders.orderUpdated"));
			navigate("/orders");
		} catch (error) {
			console.error("Error updating order:", error);
			toast.error(t("orders.errorSaving"));
		} finally {
			setIsSaving(false);
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
	if (!currentOrder) return <div className="p-4">{t("orders.notFound")}</div>;

	return (
		<div className="h-full max-w-[1800px] mx-auto px-4 md:px-6 pb-24 lg:pb-6">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<button
							onClick={() => navigate("/orders")}
							className="flex items-center text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft className="w-6 h-6 mr-2" />
							<span className="text-sm font-medium">{t("common.back")}</span>
						</button>
						<div>
							<h1 className="text-2xl font-bold">
								{t("orders.editOrder")} #{id}
							</h1>
							{orderName && (
								<div className="text-gray-500 mt-1">{orderName}</div>
							)}
						</div>
					</div>
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
										disabled={isSaving}
										className="w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:bg-gray-100"
									/>

									<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
										<div className="flex-1 relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
											<input
												type="text"
												placeholder={t("orders.searchProducts")}
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												disabled={isSaving}
												className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:bg-gray-100"
											/>
										</div>
										<button
											onClick={() => setShowFilters(!showFilters)}
											disabled={isSaving}
											className="px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors sm:w-auto disabled:opacity-50 disabled:bg-gray-100"
										>
											<Filter className="w-4 h-4" />
											{t("common.filters")}
										</button>
									</div>

									{showFilters && (
										<div className="flex flex-wrap gap-2 p-3 md:p-4 bg-gray-50 rounded-lg">
											<button
												onClick={() => setSelectedCategory("all")}
												disabled={isSaving}
												className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
													selectedCategory === "all"
														? "bg-blue-600 text-white"
														: "bg-white border hover:bg-gray-50"
												} disabled:opacity-50`}
											>
												{t("common.all")}
											</button>
											{Object.keys(organizedProducts).map((category) => (
												<button
													key={category}
													onClick={() => setSelectedCategory(category)}
													disabled={isSaving}
													className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
														selectedCategory === category
															? "bg-blue-600 text-white"
															: "bg-white border hover:bg-gray-50"
													} disabled:opacity-50`}
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
																		disabled={
																			getItemQuantity(product._id) === 0 ||
																			isSaving
																		}
																		className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
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
																		disabled={isSaving}
																		className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
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
								handleCancel={handleCancel}
								handleSaveOrder={handleSaveOrder}
								isLoading={isSaving}
								t={t}
								i18n={i18n}
								isEditMode={true}
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
							isLoading={isSaving}
							t={t}
							i18n={i18n}
							isEditMode={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditOrder;

