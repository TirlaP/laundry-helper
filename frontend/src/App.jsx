import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n";
import CreateOrder from "./pages/CreateOrder";
import Dashboard from "./pages/Dashboard";
import EditOrder from "./pages/EditOrder";
import Login from "./pages/Login";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Users from "./pages/Users";

const PrivateRoute = ({ children, requireAdmin = false }) => {
	const { user, loading } = useAuth();
	const { t } = useTranslation();

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

	if (!user) {
		return <Navigate to="/login" />;
	}

	if (requireAdmin && user.role !== "admin") {
		return <Navigate to="/" />;
	}

	return children;
};

const App = () => {
	return (
		<AuthProvider>
			<Toaster position="top-center" />
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						<Route index element={<Dashboard />} />
						<Route path="orders" element={<Orders />} />
						<Route path="/orders/:id" element={<OrderDetails />} />
						<Route
							path="/orders/:id/edit"
							element={
								<PrivateRoute>
									<EditOrder />
								</PrivateRoute>
							}
						/>
						<Route path="products" element={<Products />} />
						<Route
							path="orders/create"
							element={
								<PrivateRoute>
									<CreateOrder />
								</PrivateRoute>
							}
						/>
						<Route
							path="users"
							element={
								<PrivateRoute requireAdmin={true}>
									<Users />
								</PrivateRoute>
							}
						/>
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;

