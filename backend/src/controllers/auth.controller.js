// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const register = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ message: "Username already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new user
		const user = new User({
			username,
			password: hashedPassword,
		});

		await user.save();

		// Generate token
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.status(201).json({
			message: "User created successfully",
			token,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Find user
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Check password
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate token
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		res.status(200).json({
			token,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
