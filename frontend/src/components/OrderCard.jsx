import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";

const OrderCard = ({ order, onEdit, onDelete }) => {
	return (
		<Card className="p-4 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="font-medium flex items-center">
						<span>Order #{order.orderNumber}</span>
						{order.status && (
							<span
								className={`ml-2 px-2 py-1 text-xs rounded ${
									order.status === "completed"
										? "bg-green-100 text-green-800"
										: order.status === "pending"
										? "bg-yellow-100 text-yellow-800"
										: "bg-gray-100 text-gray-800"
								}`}
							>
								{order.status.toUpperCase()}
							</span>
						)}
					</h3>
					<p className="text-sm text-gray-500">
						{new Date(order.createdAt).toLocaleDateString()} at{" "}
						{new Date(order.createdAt).toLocaleTimeString()}
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => onEdit(order)}
						className="p-1 hover:bg-gray-100 rounded"
						title="Edit order"
					>
						<Edit2 className="w-4 h-4 text-gray-500" />
					</button>
					<button
						onClick={() => onDelete(order._id)}
						className="p-1 hover:bg-gray-100 rounded"
						title="Delete order"
					>
						<Trash2 className="w-4 h-4 text-red-500" />
					</button>
					<div className="font-bold ml-4">${order.total.toFixed(2)}</div>
				</div>
			</div>

			<div className="mt-4">
				<h4 className="text-sm font-medium mb-2">Items:</h4>
				<div className="space-y-2">
					{order.items.map((item, index) => (
						<div key={index} className="flex justify-between text-sm">
							<span>
								{item.quantity}x {item.name}
							</span>
							<span>${(item.price * item.quantity).toFixed(2)}</span>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
};

export default OrderCard;
