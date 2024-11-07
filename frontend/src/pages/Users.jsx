import { Dialog, Transition } from "@headlessui/react";
import { Eye, EyeOff, Loader2, Plus, Trash2, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/Card";
import apiClient from "../utils/apiClient";

const Users = () => {
	const { t } = useTranslation();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
	});

	const fetchUsers = async () => {
		try {
			const { data } = await apiClient.get("/auth/users");
			setUsers(data);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error(t("users.fetchError"));
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await apiClient.post("/auth/register", formData);
			setIsModalOpen(false);
			toast.success(t("users.createSuccess"));
			fetchUsers();
			setFormData({ email: "", username: "", password: "" });
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error(error.response?.data?.message || t("users.createError"));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (userId) => {
		if (window.confirm(t("users.confirmDelete"))) {
			try {
				await apiClient.delete(`/auth/users/${userId}`);
				toast.success(t("users.deleteSuccess"));
				fetchUsers();
			} catch (error) {
				console.error("Error deleting user:", error);
				toast.error(t("users.deleteError"));
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
				<h1 className="text-2xl font-bold">{t("users.title")}</h1>
				<button
					onClick={() => setIsModalOpen(true)}
					className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					<Plus className="w-4 h-4 mr-2" />
					{t("users.addUser")}
				</button>
			</div>

			<Card className="p-6">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="text-left border-b">
								<th className="pb-3 font-semibold">{t("users.username")}</th>
								<th className="pb-3 font-semibold">{t("users.email")}</th>
								<th className="pb-3 font-semibold">{t("users.createdAt")}</th>
								<th className="pb-3 font-semibold text-right">
									{t("common.actions")}
								</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user._id} className="border-b last:border-b-0">
									<td className="py-3">{user.username}</td>
									<td className="py-3">{user.email}</td>
									<td className="py-3">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td className="py-3 text-right">
										<button
											onClick={() => handleDelete(user._id)}
											className="text-red-600 hover:text-red-700"
											title={t("common.delete")}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</td>
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
											{t("users.addUser")}
										</Dialog.Title>
										<button
											onClick={() => !isSubmitting && setIsModalOpen(false)}
											className="text-gray-400 hover:text-gray-500"
											disabled={isSubmitting}
										>
											<X className="w-5 h-5" />
										</button>
									</div>

									<form onSubmit={handleSubmit} className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												{t("users.email")}
											</label>
											<input
												type="email"
												required
												value={formData.email}
												onChange={(e) =>
													setFormData({ ...formData, email: e.target.value })
												}
												className="block w-full rounded-md border border-gray-300 px-3 py-2"
												placeholder="john@example.com"
												disabled={isSubmitting}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												{t("users.username")}
											</label>
											<input
												type="text"
												required
												value={formData.username}
												onChange={(e) =>
													setFormData({ ...formData, username: e.target.value })
												}
												className="block w-full rounded-md border border-gray-300 px-3 py-2"
												placeholder="johndoe"
												disabled={isSubmitting}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												{t("users.password")}
											</label>
											<div className="relative">
												<input
													type={showPassword ? "text" : "password"}
													required
													value={formData.password}
													onChange={(e) =>
														setFormData({
															...formData,
															password: e.target.value,
														})
													}
													className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
													placeholder="••••••••"
													disabled={isSubmitting}
												/>
												<button
													type="button"
													className="absolute inset-y-0 right-0 pr-3 flex items-center"
													onClick={() => setShowPassword(!showPassword)}
													tabIndex={-1}
												>
													{showPassword ? (
														<EyeOff className="h-5 w-5 text-gray-400" />
													) : (
														<Eye className="h-5 w-5 text-gray-400" />
													)}
												</button>
											</div>
										</div>

										<div className="flex justify-end space-x-3 mt-6">
											<button
												type="button"
												onClick={() => setIsModalOpen(false)}
												className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
												disabled={isSubmitting}
											>
												{t("common.cancel")}
											</button>
											<button
												type="submit"
												className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
												disabled={isSubmitting}
											>
												{isSubmitting && (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												)}
												{t("common.create")}
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

export default Users;

