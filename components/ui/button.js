export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",
    success:
      "bg-green-600 text-white hover:bg-green-700",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-sm px-5 py-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
