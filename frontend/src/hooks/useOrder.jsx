import { useCallback, useState } from "react";
import apiClient from "../utils/apiClient";

export const useOrders = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await apiClient.get("/orders");
			setOrders(data);
			setError(null);
		} catch (err) {
			setError("Failed to fetch orders");
			console.error("Error fetching orders:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const createOrder = useCallback(async (orderData) => {
		try {
			const { data } = await apiClient.post("/orders", orderData);
			setOrders((prev) => [...prev, data]);
			return data;
		} catch (err) {
			throw new Error(err.response?.data?.message || "Failed to create order");
		}
	}, []);

	const updateOrder = useCallback(async (orderId, orderData) => {
		try {
			const { data } = await apiClient.put(`/orders/${orderId}`, orderData);
			setOrders((prev) =>
				prev.map((order) => (order._id === orderId ? data : order))
			);
			return data;
		} catch (err) {
			throw new Error(err.response?.data?.message || "Failed to update order");
		}
	}, []);

	const deleteOrder = useCallback(async (orderId) => {
		try {
			await apiClient.delete(`/orders/${orderId}`);
			setOrders((prev) => prev.filter((order) => order._id !== orderId));
		} catch (err) {
			throw new Error(err.response?.data?.message || "Failed to delete order");
		}
	}, []);

	return {
		orders,
		loading,
		error,
		fetchOrders,
		createOrder,
		updateOrder,
		deleteOrder,
	};
};
