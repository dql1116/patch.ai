import { cn } from "@/lib/utils";

interface PatchLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PatchLogo({ size = "md", className }: PatchLogoProps) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const iconClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20",
        sizeClasses[size],
        size === "sm" && "rounded-xl",
        className
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClasses[size]}
      >
        {/* Top-left patch */}
        <rect
          x="4"
          y="4"
          width="15"
          height="15"
          rx="4"
          className="fill-primary-foreground"
        />
        {/* Bottom-right patch */}
        <rect
          x="21"
          y="21"
          width="15"
          height="15"
          rx="4"
          className="fill-primary-foreground"
        />
        {/* Connecting cross-stitch: diagonal from top-left to bottom-right */}
        <line
          x1="16"
          y1="16"
          x2="24"
          y2="24"
          className="stroke-primary-foreground"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Connecting cross-stitch: diagonal from top-right to bottom-left */}
        <line
          x1="24"
          y1="16"
          x2="16"
          y2="24"
          className="stroke-primary-foreground"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
