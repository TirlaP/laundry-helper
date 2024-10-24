import { Minus, Plus } from "lucide-react";

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
