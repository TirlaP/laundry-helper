const Button = ({
	children,
	variant = "primary",
	size = "md",
	className = "",
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";

	const variants = {
		primary: "bg-blue-600 text-white hover:bg-blue-700",
		secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
		danger: "bg-red-600 text-white hover:bg-red-700",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
