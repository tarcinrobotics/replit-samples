import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn("animate-spin text-muted-foreground", className)} 
      size={size} 
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={48} />
    </div>
  );
}
