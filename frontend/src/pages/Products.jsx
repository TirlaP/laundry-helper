import { Dialog, Transition } from "@headlessui/react";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

const Products = () => {
	const { t, i18n } = useTranslation();
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		nameEs: "",
		price: "",
		category: "",
	});

	// Get categories from translation file
	const categories = Object.keys(t("categories", { returnObjects: true }));

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const { data } = await apiClient.get("/products");
			setProducts(data);
		} catch (error) {
			console.error("Error fetching products:", error);
			toast.error(t("products.fetchError"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleOpenModal = (product = null) => {
		if (!isAdmin) return;

		if (product) {
			setEditingProduct(product);
			setFormData({
				name: product.name,
				nameEs: product.nameEs,
				price: product.price,
				category: product.category,
			});
		} else {
			setEditingProduct(null);
			setFormData({
				name: "",
				nameEs: "",
				price: "",
				category: "",
			});
		}
		setIsModalOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isAdmin) return;

		setIsSubmitting(true);
		try {
			if (editingProduct) {
				await apiClient.put(`/products/${editingProduct._id}`, formData);
				toast.success(t("products.updateSuccess"));
			} else {
				await apiClient.post("/products", formData);
				toast.success(t("products.createSuccess"));
			}
			setIsModalOpen(false);
			fetchProducts();
		} catch (error) {
			console.error("Error saving product:", error);
			toast.error(error.response?.data?.message || t("products.saveError"));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id) => {
		if (!isAdmin) return;

		if (window.confirm(t("products.confirmDelete"))) {
			try {
				await apiClient.delete(`/products/${id}`);
				toast.success(t("products.deleteSuccess"));
				fetchProducts();
			} catch (error) {
				console.error("Error deleting product:", error);
				toast.error(t("products.deleteError"));
			}
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

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{t("products.title")}</h1>
				{isAdmin && (
					<button
						onClick={() => handleOpenModal()}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						<Plus className="w-4 h-4 mr-2" />
						{t("products.addProduct")}
					</button>
				)}
			</div>

			<Card className="p-6">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="text-left border-b">
								<th className="pb-3 font-semibold">{t("common.name")}</th>
								<th className="pb-3 font-semibold">
									{t("products.spanishName")}
								</th>
								<th className="pb-3 font-semibold">{t("common.category")}</th>
								<th className="pb-3 font-semibold text-right">
									{t("common.price")}
								</th>
								{isAdmin && (
									<th className="pb-3 font-semibold text-right">
										{t("common.actions")}
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<tr key={product._id} className="border-b last:border-b-0">
									<td className="py-3">{product.name}</td>
									<td className="py-3">{product.nameEs}</td>
									<td className="py-3">
										{t(`categories.${product.category}`)}
									</td>
									<td className="py-3 text-right">
										${product.price.toFixed(2)}
									</td>
									{isAdmin && (
										<td className="py-3 text-right">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => handleOpenModal(product)}
													className="text-blue-600 hover:text-blue-700"
													title={t("common.edit")}
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDelete(product._id)}
													className="text-red-600 hover:text-red-700"
													title={t("common.delete")}
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>

			<Transition appear show={isModalOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => !isSubmitting && setIsModalOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<div className="flex justify-between items-center mb-6">
										<Dialog.Title
											as="h3"
											className="text-lg font-semibold leading-6 text-gray-900"
										>
											{editingProduct
												? t("products.editProduct")
												: t("products.addProduct")}
										</Dialog.Title>
										<button
											onClick={() => !isSubmitting && setIsModalOpen(false)}
											className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
											disabled={isSubmitting}
										>
											<X className="w-5 h-5" />
										</button>
									</div>

									<form onSubmit={handleSubmit} className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{t("common.name")}
											</label>
											<input
												type="text"
												value={formData.name}
												onChange={(e) =>
													setFormData({ ...formData, name: e.target.value })
												}
												className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
												required
												disabled={isSubmitting}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{t("products.spanishName")}
											</label>
											<input
												type="text"
												value={formData.nameEs}
												onChange={(e) =>
													setFormData({ ...formData, nameEs: e.target.value })
												}
												className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
												required
												disabled={isSubmitting}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{t("common.category")}
											</label>
											<select
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
												required
												disabled={isSubmitting}
											>
												<option value="">{t("products.selectCategory")}</option>
												{categories.map((category) => (
													<option key={category} value={category}>
														{t(`categories.${category}`)}
													</option>
												))}
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{t("common.price")}
											</label>
											<div className="relative rounded-lg">
												<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
													<span className="text-gray-500 sm:text-sm">$</span>
												</div>
												<input
													type="number"
													step="0.01"
													value={formData.price}
													onChange={(e) =>
														setFormData({ ...formData, price: e.target.value })
													}
													className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
													required
													disabled={isSubmitting}
												/>
											</div>
										</div>

										<div className="flex justify-end space-x-3 pt-4">
											<button
												type="button"
												onClick={() => setIsModalOpen(false)}
												className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
												disabled={isSubmitting}
											>
												{t("common.cancel")}
											</button>
											<button
												type="submit"
												className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
												disabled={isSubmitting}
											>
												{isSubmitting && (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												)}
												{editingProduct ? t("common.save") : t("common.create")}
											</button>
										</div>
									</form>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	);
};

export default Products;

