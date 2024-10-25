import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
	try {
		const { email, username, password } = req.body;

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

		// Log incoming request data (remove in production)
		console.log("Registration attempt:", { email, username });

		// Case-insensitive email check
		const existingEmail = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, "i") },
		});

		if (existingEmail) {
			console.log("Email collision found:", {
				attempted: email,
				existing: existingEmail.email,
			});
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
			console.log("Username collision found:", {
				attempted: username,
				existing: existingUsername.username,
			});
			return res.status(400).json({
				message: "Username already exists",
				field: "username",
			});
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new user
		const user = new User({
			email: email.toLowerCase(), // Store email in lowercase
			username,
			password: hashedPassword,
		});

		await user.save();
		console.log("User created successfully:", {
			id: user._id,
			email: user.email,
		});

		// Generate token
		const token = jwt.sign(
			{
				id: user._id,
				email: user.email,
				username: user.username,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1d" }
		);

		res.status(201).json({
			message: "User created successfully",
			token,
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
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
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
