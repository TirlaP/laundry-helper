import {
	ChevronLeft,
	ChevronRight,
	FileText,
	Globe,
	Home,
	LogOut,
	Menu,
	Package,
	Plus,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
	const { logout, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { t, i18n } = useTranslation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(
		window.innerWidth >= 768 && window.innerWidth < 992
	);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width >= 768 && width < 992) {
				setIsCollapsed(true);
			} else if (width >= 992) {
				setIsCollapsed(false);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const toggleLanguage = () => {
		const newLang = i18n.language === "en" ? "es" : "en";
		i18n.changeLanguage(newLang);
		localStorage.setItem("language", newLang);
	};

	// Define navigation items with role-based access
	const getNavigationItems = () => {
		const items = [
			{ name: t("navigation.dashboard"), href: "/", icon: Home },
			{ name: t("navigation.orders"), href: "/orders", icon: FileText },
			{ name: t("navigation.products"), href: "/products", icon: Package },
			{ name: t("navigation.createOrder"), href: "/orders/create", icon: Plus },
		];

		// Add Users page for admin users
		if (user?.role === "admin") {
			items.push({ name: t("navigation.users"), href: "/users", icon: Users });
		}

		return items;
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const navigation = getNavigationItems();

	const Sidebar = ({ isMobile = false }) => (
		<div className="flex flex-col h-full bg-white">
			{/* App Title */}
			<div
				className={`p-4 border-b flex items-center ${
					isCollapsed && !isMobile ? "justify-center h-16" : ""
				}`}
			>
				<h1
					className={`text-xl font-bold text-gray-800 transition-all duration-300 ${
						isCollapsed && !isMobile ? "w-0 opacity-0" : "opacity-100"
					}`}
				>
					{t("common.appName")}
				</h1>
				{!isCollapsed && !isMobile && (
					<span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
						{user?.role === "admin" ? t("common.admin") : t("common.member")}
					</span>
				)}
			</div>

			{/* Collapse Button */}
			{!isMobile && (
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="absolute -right-3 top-5 bg-white border rounded-full p-1 shadow-md z-40 hover:bg-gray-50"
				>
					{isCollapsed ? (
						<ChevronRight className="w-4 h-4" />
					) : (
						<ChevronLeft className="w-4 h-4" />
					)}
				</button>
			)}

			{/* Navigation */}
			<div className="flex-1 overflow-y-auto">
				<nav className="p-2 space-y-1">
					{navigation.map((item) => {
						const isActive =
							location.pathname === item.href ||
							(item.href !== "/" && location.pathname.startsWith(item.href));

						return (
							<Link
								key={item.name}
								to={item.href}
								className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
									isCollapsed && !isMobile ? "justify-center" : ""
								} ${
									isActive
										? "bg-blue-50 text-blue-700"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								}`}
								onClick={() => isMobile && setIsMobileMenuOpen(false)}
							>
								<item.icon
									className={`w-5 h-5 ${
										isActive ? "text-blue-500" : "text-gray-400"
									} ${!isCollapsed && !isMobile ? "mr-3" : ""}`}
								/>
								<span
									className={`${isCollapsed && !isMobile ? "hidden" : "block"}`}
								>
									{item.name}
								</span>
							</Link>
						);
					})}

					{/* Language Toggle */}
					<button
						onClick={toggleLanguage}
						className={`flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 ${
							isCollapsed && !isMobile ? "justify-center" : ""
						}`}
					>
						<Globe
							className={`w-5 h-5 text-gray-400 ${
								!isCollapsed && !isMobile ? "mr-3" : ""
							}`}
						/>
						<span
							className={`${isCollapsed && !isMobile ? "hidden" : "block"}`}
						>
							{i18n.language === "en" ? "Español" : "English"}
						</span>
					</button>
				</nav>
			</div>

			{/* Logout Button */}
			<div className="p-4 border-t">
				<button
					onClick={handleLogout}
					className={`flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 ${
						isCollapsed && !isMobile ? "justify-center" : ""
					}`}
				>
					<LogOut
						className={`w-5 h-5 text-gray-400 ${
							!isCollapsed && !isMobile ? "mr-3" : ""
						}`}
					/>
					<span className={`${isCollapsed && !isMobile ? "hidden" : "block"}`}>
						{t("common.logout")}
					</span>
				</button>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Mobile Header */}
			<div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-2">
				<div className="flex items-center justify-between">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 rounded-md text-gray-400 hover:text-gray-500"
					>
						<Menu className="h-6 w-6" />
					</button>
					<div className="font-semibold">{t("common.appName")}</div>
					<div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
						{user?.role === "admin" ? t("common.admin") : t("common.member")}
					</div>
				</div>
			</div>

			<div className="flex min-h-screen pt-[48px] md:pt-0">
				{/* Desktop Sidebar */}
				<div
					className={`hidden md:block relative transition-all duration-300 ${
						isCollapsed ? "w-16" : "w-64"
					}`}
				>
					<div
						className="fixed top-0 bottom-0 z-30 border-r bg-white"
						style={{ width: isCollapsed ? "4rem" : "16rem" }}
					>
						<Sidebar />
					</div>
				</div>

				{/* Mobile Sidebar */}
				{isMobileMenuOpen && (
					<div className="fixed inset-0 z-50 md:hidden">
						<div
							className="fixed inset-0 bg-gray-600 bg-opacity-75"
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
							<div className="absolute right-0 top-0 -mr-12 pt-2">
								<button
									className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<X className="h-6 w-6 text-white" />
								</button>
							</div>
							<Sidebar isMobile />
						</div>
					</div>
				)}

				{/* Main Content */}
				<div className="flex-1 relative">
					<main className="h-full p-4 md:p-6 overflow-auto">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
};

export default Layout;
