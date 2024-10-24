import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

const Products = () => {
	const { t, i18n } = useTranslation();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		nameEs: "",
		price: "",
		category: "",
	});

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

	useEffect(() => {
		fetchProducts();
	}, []);

	const handleOpenModal = (product = null) => {
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
		try {
			if (editingProduct) {
				await apiClient.put(`/products/${editingProduct._id}`, formData);
			} else {
				await apiClient.post("/products", formData);
			}
			setIsModalOpen(false);
			fetchProducts();
		} catch (error) {
			console.error("Error saving product:", error);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm(t("products.confirmDelete"))) {
			try {
				await apiClient.delete(`/products/${id}`);
				fetchProducts();
			} catch (error) {
				console.error("Error deleting product:", error);
			}
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg">{t("common.loading")}</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{t("products.title")}</h1>
				<Button onClick={() => handleOpenModal()}>
					<Plus className="w-4 h-4 mr-2" />
					{t("products.addProduct")}
				</Button>
			</div>

			<Card className="p-6">
				<div className="max-h-[70vh] overflow-y-auto">
					<table className="w-full">
						<thead className="sticky top-0 bg-white">
							<tr className="text-left border-b">
								<th className="pb-3 font-semibold">{t("common.name")}</th>
								<th className="pb-3 font-semibold">
									{t("products.spanishName")}
								</th>
								<th className="pb-3 font-semibold">{t("common.category")}</th>
								<th className="pb-3 font-semibold text-right">
									{t("common.price")}
								</th>
								<th className="pb-3 font-semibold text-right">
									{t("common.actions")}
								</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<tr key={product._id} className="border-b last:border-b-0">
									<td className="py-3">{product.name}</td>
									<td className="py-3">{product.nameEs}</td>
									<td className="py-3">{product.category}</td>
									<td className="py-3 text-right">
										${product.price.toFixed(2)}
									</td>
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
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>

			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">
							{editingProduct
								? t("products.editProduct")
								: t("products.addProduct")}
						</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									{t("common.name")}
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									{t("products.spanishName")}
								</label>
								<input
									type="text"
									value={formData.nameEs}
									onChange={(e) =>
										setFormData({ ...formData, nameEs: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									{t("common.category")}
								</label>
								<input
									type="text"
									value={formData.category}
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									{t("common.price")}
								</label>
								<input
									type="number"
									step="0.01"
									value={formData.price}
									onChange={(e) =>
										setFormData({ ...formData, price: e.target.value })
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									required
								/>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="secondary"
									onClick={() => setIsModalOpen(false)}
									type="button"
								>
									{t("common.cancel")}
								</Button>
								<Button type="submit">
									{editingProduct ? t("common.save") : t("common.create")}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Products;
