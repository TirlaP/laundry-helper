const Card = ({ children, className = "" }) => {
	return (
		<div
			className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
		>
			{children}
		</div>
	);
};

const CardHeader = ({ children, className = "" }) => {
	return (
		<div className={`p-4 border-b border-gray-200 ${className}`}>
			{children}
		</div>
	);
};

const CardTitle = ({ children, className = "" }) => {
	return <h3 className={`text-lg font-medium ${className}`}>{children}</h3>;
};

const CardContent = ({ children, className = "" }) => {
	return <div className={`p-4 ${className}`}>{children}</div>;
};

export { Card, CardContent, CardHeader, CardTitle };
