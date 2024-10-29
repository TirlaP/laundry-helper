import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import apiClient from "../utils/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Initialize auth state
	useEffect(() => {
		const initializeAuth = async () => {
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const { data } = await apiClient.get("/auth/verify");
					setUser(data.user);
				} catch (error) {
					console.error("Token verification failed:", error);
					localStorage.removeItem("token");
				}
			}
			setLoading(false);
		};

		initializeAuth();
	}, []);

	const login = useCallback(async (login, password) => {
		try {
			const { data } = await apiClient.post("/auth/login", {
				login,
				password,
			});
			localStorage.setItem("token", data.token);
			setUser(data.user);
			return true;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		setUser(null);
	}, []);

	const isAdmin = useCallback(() => {
		return user?.role === "admin";
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
