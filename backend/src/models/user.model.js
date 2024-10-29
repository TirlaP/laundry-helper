import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["admin", "member"],
		default: "member",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("User", userSchema);
