import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

const logStream = fs.createWriteStream(path.join(logsDir, "app.log"), {
	flags: "a",
});

export const loggerMiddleware = (req, res, next) => {
	const timestamp = new Date().toISOString();
	const log = `[${timestamp}] ${req.method} ${req.url}\n`;
	logStream.write(log);

	// Capture response
	const oldWrite = res.write;
	const oldEnd = res.end;

	const chunks = [];

	res.write = function (chunk) {
		chunks.push(chunk);
		return oldWrite.apply(res, arguments);
	};

	res.end = function (chunk) {
		if (chunk) chunks.push(chunk);

		const responseBody = Buffer.concat(chunks).toString("utf8");
		const responseLog = `[${timestamp}] Response: ${res.statusCode} ${responseBody}\n`;
		logStream.write(responseLog);

		oldEnd.apply(res, arguments);
	};

	next();
};

export const errorLogger = (err, req, res, next) => {
	const timestamp = new Date().toISOString();
	const errorLog = `[${timestamp}] ERROR: ${err.stack}\n`;
	logStream.write(errorLog);

	res.status(500).json({
		message: err.message || "Something went wrong!",
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
	});
};
