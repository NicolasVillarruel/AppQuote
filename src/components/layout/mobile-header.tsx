"use client";

import { Menu, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export function MobileHeader({ onMenuClick, className }: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-40 px-4 flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">AppQuote</span>
            <span className="text-[10px] text-muted-foreground leading-none">Cotizador</span>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {/* Placeholder for right side actions if needed */}
      </div>
    </header>
  );
}
