import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
	try {
		const { email, username, password } = req.body;

		// Check if request is from an admin
		if (!req.user?.role === "admin") {
			return res.status(403).json({
				message: "Only administrators can create new users",
			});
		}

		// Add input validation
		if (!email || !username || !password) {
			return res.status(400).json({
				message: "All fields are required",
				details: {
					email: !email ? "Email is required" : null,
					username: !username ? "Username is required" : null,
					password: !password ? "Password is required" : null,
				},
			});
		}

		// Case-insensitive email check
		const existingEmail = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, "i") },
		});

		if (existingEmail) {
			return res.status(400).json({
				message: "Email already exists",
				field: "email",
			});
		}

		// Case-insensitive username check
		const existingUsername = await User.findOne({
			username: { $regex: new RegExp(`^${username}$`, "i") },
		});

		if (existingUsername) {
			return res.status(400).json({
				message: "Username already exists",
				field: "username",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new user
		const user = new User({
			email: email.toLowerCase(),
			username,
			password: hashedPassword,
			role: "member", // New users are always members
		});

		await user.save();

		res.status(201).json({
			message: "User created successfully",
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			message: "Registration failed",
			error: error.message,
		});
	}
};

export const login = async (req, res) => {
	try {
		const { login, password } = req.body;

		// Find user by email or username
		const user = await User.findOne({
			$or: [{ email: login }, { username: login }],
		});

		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Check password
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate token
		const token = jwt.sign(
			{
				id: user._id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		res.status(200).json({
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// New endpoint to create initial admin user
export const createInitialAdmin = async (req, res) => {
	try {
		const adminCount = await User.countDocuments({ role: "admin" });
		if (adminCount > 0) {
			return res.status(400).json({ message: "Admin user already exists" });
		}

		const hashedPassword = await bcrypt.hash(
			process.env.INITIAL_ADMIN_PASSWORD,
			12
		);
		const admin = new User({
			email: process.env.INITIAL_ADMIN_EMAIL,
			username: "admin",
			password: hashedPassword,
			role: "admin",
		});

		await admin.save();
		res.status(201).json({ message: "Admin user created successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getUsers = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied" });
		}

		const users = await User.find({}, { password: 0 });
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteUser = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied" });
		}

		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const verifyToken = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
