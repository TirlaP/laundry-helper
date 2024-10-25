import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const auth = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		req.user = {
			id: user._id,
			email: user.email,
			username: user.username,
			displayName: user.username || user.email, // Fallback to email if username is not set
		};

		next();
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(401).json({ message: "Invalid or expired token" });
	}
};
