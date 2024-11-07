import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const MobileOrderSummary = ({
	currentOrder,
	products,
	updateItemQuantity,
	handleSaveOrder,
	isLoading,
	t,
	i18n,
	isEditMode,
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
											? t("orders.clickToMinimize")
											: t("orders.clickToExpand")}
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
															disabled={isLoading}
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
															disabled={isLoading}
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
								disabled={isLoading}
								className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{t("common.cancel")}
							</button>
							<button
								onClick={handleSaveOrder}
								disabled={currentOrder.items.length === 0 || isLoading}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
							>
								{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
								{isLoading
									? t("orders.saving")
									: isEditMode
									? t("common.update")
									: t("common.save")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

