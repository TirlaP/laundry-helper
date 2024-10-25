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
					// Optional: Verify token with backend
					// const { data } = await apiClient.get("/auth/verify");
					// setUser(data.user);

					// For now, just set a basic user object if token exists
					setUser({ username: "User" }); // You might want to store username in localStorage too
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

	const register = useCallback(async (email, username, password) => {
		try {
			const { data } = await apiClient.post("/auth/register", {
				email,
				username,
				password,
			});
			localStorage.setItem("token", data.token);
			setUser(data.user);
			return true;
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	}, []);

	return (
		<AuthContext.Provider value={{ user, login, logout, register, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
