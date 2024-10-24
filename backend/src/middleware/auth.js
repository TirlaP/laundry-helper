// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const auth = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "Authentication required" });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Get user from database
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
	}
};
