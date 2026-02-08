import { cn } from "@/lib/utils";

interface PatchLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PatchLogo({ size = "md", className }: PatchLogoProps) {
  const sizeClasses = {
    sm: "size-10",
    md: "size-16",
    lg: "size-24",
  };

  const iconClasses = {
    sm: "size-6",
    md: "size-10",
    lg: "size-14",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 aspect-square",
        sizeClasses[size],
        size === "sm" && "rounded-xl",
        className
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClasses[size]}
      >
        {/* Top-left patch piece */}
        <rect
          x="3"
          y="3"
          width="13"
          height="13"
          rx="3"
          className="fill-primary-foreground"
          opacity="0.9"
        />
        {/* Bottom-right patch piece */}
        <rect
          x="16"
          y="16"
          width="13"
          height="13"
          rx="3"
          className="fill-primary-foreground"
          opacity="0.9"
        />
        {/* Connecting bridge - horizontal */}
        <rect
          x="12"
          y="12"
          width="8"
          height="4"
          rx="1.5"
          className="fill-primary-foreground"
          opacity="0.6"
        />
        {/* Connecting bridge - vertical */}
        <rect
          x="14"
          y="10"
          width="4"
          height="8"
          rx="1.5"
          className="fill-primary-foreground"
          opacity="0.6"
        />
        {/* Stitch marks on top-left patch */}
        <line x1="6" y1="7" x2="8" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
        <line x1="6" y1="9.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
        <line x1="6" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
        {/* Stitch marks on bottom-right patch */}
        <line x1="24" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
        <line x1="24" y1="22.5" x2="26" y2="22.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
        <line x1="24" y1="25" x2="26" y2="25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-primary" opacity="0.5" />
      </svg>
    </div>
  );
}
