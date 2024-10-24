import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { errorLogger, loggerMiddleware } from "./src/middleware/logger.js";
import authRoutes from "./src/routes/auth.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import productRoutes from "./src/routes/product.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
	process.env.FRONTEND_URL,
	"https://laundry-helper.netlify.app",
	"http://localhost:5173",
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg =
					"The CORS policy for this site does not allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		credentials: true,
	})
);

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

// Self-ping function to keep the server alive
const PING_INTERVAL = 30000; // 30 seconds

function pingServer() {
	const healthCheckUrl = `${process.env.BACKEND_URL}/api/health-check`;
	console.log(`Performing health check on: ${healthCheckUrl}`);

	axios
		.get(healthCheckUrl)
		.then((response) => {
			console.log(
				`Health check at ${new Date().toISOString()}: Status ${response.status}`
			);
		})
		.catch((error) => {
			console.error(
				`Health check failed at ${new Date().toISOString()}:`,
				error.message
			);
		});
}

// Start server function
async function startServer() {
	try {
		const PORT = process.env.PORT || 5000;

		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
			setInterval(pingServer, PING_INTERVAL);
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
