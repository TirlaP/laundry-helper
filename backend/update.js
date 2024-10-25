// updateSpanishNames.js
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mexicanSpanishUpdates = {
	"Protector de Colchón": "Protector de Colchón", // Same
	Manta: "Cobija",
	Cobijas: "Cobijas", // Same
	"Funda Nórdica": "Cobertor",
	Edredón: "Edredón", // Same
	"Funda de Almohada Decorativa": "Funda Decorativa",
	"Falda de Cama": "Volante de Cama",
	"Juego de Cortinas de Ducha": "Set de Cortinas de Baño",
	"Manteles Individuales y Agarraderas": "Manteles Individuales y Agarraderas", // Same
	"Caminos de Mesa y Delantales": "Caminos de Mesa y Mandiles",
	"Servilletas de Tela": "Servilletas de Tela", // Same
	"Alfombra/Tapete de Baño": "Tapete de Baño",
	Mantel: "Mantel", // Same
	"Cortinas Por Pie Cuadrado": "Cortinas Por Pie Cuadrado", // Same
	"Juego de Cortinas": "Set de Cortinas",
	"Paneles y Cortinas Individual": "Panel o Cortina Individual",
	Batas: "Batas", // Same
	Toallas: "Toallas", // Same
	Protector: "Protector", // Same
	"Almohada Decorativa": "Cojín Decorativo",
	"Precio por Libra": "Precio por Libra", // Same
	"Cargo Mínimo por Reparación o Planchado":
		"Cargo Mínimo por Compostura o Planchado",
};

async function updateSpanishNames() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		const Product = mongoose.model(
			"Product",
			new mongoose.Schema({
				name: String,
				nameEs: String,
				price: Number,
				category: String,
			})
		);

		const products = await Product.find({});

		for (const product of products) {
			for (const [oldTerm, newTerm] of Object.entries(mexicanSpanishUpdates)) {
				if (product.nameEs.includes(oldTerm)) {
					product.nameEs = product.nameEs.replace(oldTerm, newTerm);
					await product.save();
					console.log(`Updated: ${product.name} -> ${product.nameEs}`);
				}
			}
		}

		console.log("Spanish names update completed");
	} catch (error) {
		console.error("Error updating Spanish names:", error);
	} finally {
		await mongoose.connection.close();
	}
}

updateSpanishNames();
