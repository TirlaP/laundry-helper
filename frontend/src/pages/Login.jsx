import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({ login: "", password: "" });
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isLoading) return;

		setIsLoading(true);
		setError("");

		try {
			await login(formData.login, formData.password);
			navigate("/");
		} catch (err) {
			setError(t("auth.loginError"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						{t("auth.loginTitle")}
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-md bg-red-50 p-4">
							<div className="text-sm text-red-700">{error}</div>
						</div>
					)}
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="login" className="sr-only">
								{t("auth.loginPlaceholder")}
							</label>
							<input
								id="login"
								name="login"
								type="text"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder={t("auth.loginPlaceholder")}
								value={formData.login}
								onChange={(e) =>
									setFormData({ ...formData, login: e.target.value })
								}
								disabled={isLoading}
							/>
						</div>
						<div className="relative">
							<label htmlFor="password" className="sr-only">
								{t("auth.password")}
							</label>
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
								placeholder={t("auth.password")}
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								disabled={isLoading}
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

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : null}
							{isLoading ? t("common.loading") : t("common.login")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
