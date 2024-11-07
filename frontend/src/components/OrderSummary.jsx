import { Loader2, Minus, Plus } from "lucide-react";

export const OrderSummary = ({
	currentOrder,
	products,
	updateItemQuantity,
	handleCancel,
	handleSaveOrder,
	isLoading,
	t,
	i18n,
	isEditMode,
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
										disabled={isLoading}
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
										disabled={isLoading}
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
				onClick={handleCancel}
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
);

