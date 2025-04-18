import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavigationLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function NavigationLink({ 
  href, 
  icon: Icon, 
  children 
}: NavigationLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a
        className={cn(
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-primary-700",
          "group flex items-center px-4 py-2 text-sm font-medium rounded-md"
        )}
      >
        <Icon
          className={cn(
            isActive
              ? "text-primary-500"
              : "text-gray-400 group-hover:text-primary-500",
            "mr-3 h-5 w-5"
          )}
        />
        {children}
      </a>
    </Link>
  );
}
