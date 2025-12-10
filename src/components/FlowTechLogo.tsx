import { cn } from "@/lib/utils";

interface FlowTechLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FlowTechLogo({ className, size = "md" }: FlowTechLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo SVG - T estilizado */}
      <svg
        className={cn(sizeClasses[size])}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Parte esquerda e topo (cinza) */}
        <g className="text-gray-300 dark:text-gray-400">
          <path
            d="M20 20 L20 50 L35 50 L35 35 L50 35 L50 20 Z"
            fill="currentColor"
          />
          <circle cx="28" cy="27.5" r="2.5" fill="currentColor" />
          <circle cx="42" cy="27.5" r="2.5" fill="currentColor" />
        </g>
        
        {/* Parte direita (azul) */}
        <g className="text-blue-500">
          <path
            d="M50 20 L50 35 L80 35 L80 50 L65 50 L65 80 L50 80 L50 65 L35 65 L35 50 L50 50 Z"
            fill="currentColor"
          />
          <circle cx="57" cy="27.5" r="2.5" fill="currentColor" />
          <circle cx="72" cy="27.5" r="2.5" fill="currentColor" />
        </g>
      </svg>
      
      {/* Texto */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-300 dark:text-gray-400">Flow</span>
          <span className="text-lg font-semibold text-blue-500">Tech</span>
        </div>
        <span className="text-xs font-medium text-gray-300 dark:text-gray-400 leading-tight">SYSTEMS</span>
      </div>
    </div>
  );
}

