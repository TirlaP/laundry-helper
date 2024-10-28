import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
	common: {
		login: "Sign in",
		register: "Register",
		logout: "Logout",
		loading: "Loading...",
		save: "Save",
		cancel: "Cancel",
		delete: "Delete",
		edit: "Edit",
		total: "Total",
		actions: "Actions",
		name: "Name",
		price: "Price",
		category: "Category",
		quantity: "Quantity",
		date: "Date",
		items: "Items",
		item: "Item",
		search: "Search",
		filters: "Filters",
		all: "All",
		product: "Product",
		each: "each",
		create: "Create",
		update: "Update",
		appName: "Laundry Helper",
		createdBy: "Created By",
		email: "Email",
		username: "Username",
		yes: "Yes",
		no: "No",
	},
	categories: {
		"Mattress Pads": "Mattress Pads",
		Blankets: "Blankets",
		"Duvet Covers": "Duvet Covers",
		Comforters: "Comforter Inserter",
		"Pillow Shams": "Pillow Shams",
		"Bed Skirts": "Bed Skirts",
		Bathroom: "Bathroom",
		Kitchen: "Kitchen",
		Rugs: "Rugs",
		"Table Cloths": "Table Cloths",
		Curtains: "Curtains",
		Protectors: "Protectors",
		Miscellaneous: "Miscellaneous",
		Services: "Services",
	},
	navigation: {
		dashboard: "Dashboard",
		orders: "Orders",
		products: "Products",
		createOrder: "Create Order",
		language: "Language",
	},
	auth: {
		username: "Username",
		password: "Password",
		email: "Email",
		loginTitle: "Sign in to your account",
		registerTitle: "Create your account",
		loginError: "Invalid credentials",
		registerError: "Registration failed",
		noAccount: "Don't have an account?",
		registerNow: "Register now",
		haveAccount: "Already have an account?",
		loginHere: "Sign in here",
		loginPlaceholder: "Email or username",
	},
	dashboard: {
		title: "Dashboard",
		totalOrders: "Total Orders",
		totalRevenue: "Total Revenue",
		averageOrderValue: "Average Order Value",
		recentOrders: "Recent Orders",
	},
	orders: {
		title: "Orders",
		newOrder: "New Order",
		createOrder: "Create New Order",
		orderName: "Order Name",
		orderNamePlaceholder: "Order Name (optional)",
		orderSummary: "Order Summary",
		orderDetails: "Order Details",
		orderNumber: "Order #",
		status: "Status",
		export: "Export",
		view: "View",
		createdBy: "Created By", // Added here
		availableProducts: "Available Products",
		searchProducts: "Search products...",
		noItems: "No items added",
		errorLoadingProducts: "Error loading products",
		errorCreatingOrder: "Error creating order",
		errorLoadingOrder: "Failed to load order",
		errorDeletingOrder: "Failed to delete order",
		errorExporting: "Failed to export order",
		confirmDelete: "Are you sure you want to delete this order?",
		notFound: "Order not found",
		orderItems: "Order Items",
		viewOption: "View Orders",
		myOrders: "My Orders",
		allOrders: "All Orders",
		startDate: "Start Date",
		endDate: "End Date",
		filterOrders: "Filter Orders",
		confirmCancel:
			"Are you sure you want to cancel this order? All items will be lost.",
		errorSaving: "Error saving order. Please try again.",
	},
	products: {
		title: "Products",
		addProduct: "Add Product",
		editProduct: "Edit Product",
		spanishName: "Spanish Name",
		confirmDelete: "Are you sure you want to delete this product?",
		selectCategory: "Select a category",
	},
};

const es = {
	common: {
		login: "Iniciar sesión",
		register: "Registrarse",
		logout: "Cerrar sesión",
		loading: "Cargando...",
		save: "Guardar",
		cancel: "Cancelar",
		delete: "Borrar", // Changed from Eliminar
		edit: "Editar",
		total: "Total",
		actions: "Acciones",
		name: "Nombre",
		price: "Precio",
		category: "Categoría",
		quantity: "Cantidad",
		date: "Fecha",
		items: "Artículos",
		item: "Artículo",
		search: "Buscar",
		filters: "Filtros",
		all: "Todo", // Changed from Todos
		product: "Producto",
		each: "cada uno",
		create: "Crear",
		update: "Actualizar",
		appName: "Laundry Helper",
		yes: "Sí",
		no: "No",
	},
	categories: {
		"Mattress Pads": "Protectores de Colchón",
		Blankets: "Cobijas", // Changed from Mantas
		"Duvet Covers": "Fundas de Edredón", // Changed from Fundas Nórdicas
		Comforters: "Edredones",
		"Pillow Shams": "Fundas Decorativas", // Changed from Fundas de Almohada
		"Bed Skirts": "Volantes de Cama", // Changed from Faldones de Cama
		Bathroom: "Baño",
		Kitchen: "Cocina",
		Rugs: "Tapetes", // Changed from Alfombras
		"Table Cloths": "Manteles",
		Curtains: "Cortinas",
		Protectors: "Protectores",
		Miscellaneous: "Varios",
		Services: "Servicios",
	},
	navigation: {
		dashboard: "Tablero", // Changed from Panel
		orders: "Pedidos",
		products: "Productos",
		createOrder: "Crear Pedido",
		language: "Idioma",
	},
	auth: {
		username: "Usuario",
		password: "Contraseña",
		loginTitle: "Inicia sesión en tu cuenta", // More informal, Mexican style
		registerTitle: "Crea tu cuenta", // More informal, Mexican style
		loginError: "Datos incorrectos", // Changed from Credenciales inválidas
		registerError: "Error al registrarse", // Changed from Error en el registro
	},
	dashboard: {
		title: "Tablero", // Changed from Panel
		totalOrders: "Total de Pedidos",
		totalRevenue: "Ingresos Totales",
		averageOrderValue: "Valor Promedio por Pedido", // Changed wording
		recentOrders: "Pedidos Recientes",
	},
	orders: {
		title: "Pedidos",
		newOrder: "Nuevo Pedido",
		createOrder: "Crear Nuevo Pedido",
		orderName: "Nombre del Pedido",
		orderNamePlaceholder: "Nombre del Pedido (opcional)",
		orderSummary: "Resumen del Pedido",
		orderDetails: "Detalles del Pedido",
		orderNumber: "Pedido #",
		status: "Estado",
		export: "Exportar",
		view: "Ver",
		createdBy: "Creado Por", // Added here
		availableProducts: "Productos Disponibles",
		searchProducts: "Buscar productos...",
		noItems: "Sin artículos",
		errorLoadingProducts: "Error al cargar los productos",
		errorCreatingOrder: "Error al crear el pedido",
		errorLoadingOrder: "Error al cargar el pedido",
		errorDeletingOrder: "Error al borrar el pedido",
		errorExporting: "Error al exportar el pedido",
		confirmDelete: "¿Seguro que quieres borrar este pedido?",
		notFound: "Pedido no encontrado",
		orderItems: "Artículos del Pedido",
		viewOption: "Ver Pedidos",
		myOrders: "Mis Pedidos",
		allOrders: "Todos los Pedidos",
		startDate: "Fecha Inicial",
		endDate: "Fecha Final",
		filterOrders: "Filtrar Pedidos",
		confirmCancel:
			"¿Estás seguro de que quieres cancelar este pedido? Se perderán todos los artículos.",
		errorSaving: "Error al guardar el pedido. Por favor, inténtalo de nuevo.",
	},
	products: {
		title: "Productos",
		addProduct: "Agregar Producto",
		editProduct: "Editar Producto",
		spanishName: "Nombre en Español",
		confirmDelete: "¿Seguro que quieres borrar este producto?", // More informal, Mexican style
	},
};

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		es: { translation: es },
	},
	lng: localStorage.getItem("language") || "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
});

export default i18n;
