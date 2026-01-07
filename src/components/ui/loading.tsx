import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "default" | "lg" | "xl";
    variant?: "default" | "fullscreen" | "overlay";
    text?: string;
}

export function Loading({
    className,
    size = "default",
    variant = "default",
    text,
    ...props
}: LoadingProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        default: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const spinner = (
        <Loader2
            className={cn(
                "animate-spin text-gold",
                sizeClasses[size],
                className
            )}
        />
    );

    if (variant === "fullscreen") {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm" {...props}>
                {spinner}
                {text && <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{text}</p>}
            </div>
        );
    }

    if (variant === "overlay") {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]" {...props}>
                {spinner}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)} {...props}>
            {spinner}
            {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
        </div>
    );
}
