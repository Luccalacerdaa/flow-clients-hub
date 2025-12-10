import { cn } from "@/lib/utils";

interface FlowTechLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FlowTechLogo({ className, size = "md" }: FlowTechLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/asddds.png"
        alt="FlowTech Systems"
        className={cn(sizeClasses[size], "object-contain")}
      />
    </div>
  );
}

