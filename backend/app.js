import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { errorLogger, loggerMiddleware } from "./src/middleware/logger.js";
import authRoutes from "./src/routes/auth.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import productRoutes from "./src/routes/product.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Updated CORS configuration
app.use(
	cors({
		origin: [
			"https://laundry-helper.netlify.app",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
);

// Add OPTIONS handling for all routes
app.options("*", cors());

// Add headers middleware
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.header("origin"));
	res.header("Access-Control-Allow-Credentials", true);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
});

// rest of your middleware
app.use(express.json());
app.use(loggerMiddleware);

// Database connection
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check route
app.get("/api/health-check", (req, res) => {
	res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Custom error handling middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	if (!res.headersSent) {
		res.status(500).json({
			message: err.message || "Something went wrong!",
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		});
	}
});

// Handle 404 errors
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Start server function
async function startServer() {
	try {
		const PORT = process.env.PORT || 5000;

		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);

			// Only start health checks in production
			if (process.env.NODE_ENV === "production") {
				const PING_INTERVAL = 30000;
				setInterval(() => {
					const healthCheckUrl = `${process.env.BACKEND_URL}/api/health-check`;
					axios
						.get(healthCheckUrl)
						.then((response) => console.log("Health check OK"))
						.catch((error) =>
							console.error("Health check failed:", error.message)
						);
				}, PING_INTERVAL);
			}
		});

		// Graceful shutdown
		process.on("SIGTERM", () => {
			console.log("SIGTERM signal received: closing HTTP server");
			server.close(() => {
				console.log("HTTP server closed");
				mongoose.connection.close(false, () => {
					console.log("MongoDB connection closed");
					process.exit(0);
				});
			});
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();

export default app;
