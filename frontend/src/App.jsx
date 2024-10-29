import { Toaster } from "react-hot-toast";
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

	if (loading) {
		return <div>Loading...</div>;
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
						<Route path="/orders/:id/edit" element={<EditOrder />} />
						<Route path="products" element={<Products />} />
						<Route path="orders/create" element={<CreateOrder />} />
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
