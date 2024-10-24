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
import Register from "./pages/Register";

const PrivateRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	return user ? children : <Navigate to="/login" />;
};

const App = () => {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
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
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
