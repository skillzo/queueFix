import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon: Icon,
  iconPosition = "right",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-semibold transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-blue-500 text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger:
      "bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md",
    outline:
      "bg-white text-gray-900 border border-gray-200 hover:border-primary hover:text-primary",
  };

  const sizeStyles = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`.trim();

  const iconElement = Icon && (
    <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {Icon && iconPosition === "left" && iconElement}
      {children}
      {Icon && iconPosition === "right" && iconElement}
    </button>
  );
}
