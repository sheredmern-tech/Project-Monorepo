// ============================================================================
// FILE 4: components/shared/view-toggle.tsx - NEW
// ============================================================================
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ViewToggleProps {
  view: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("table")}
        className={cn(
          "h-8 px-3",
          view === "table" && "bg-accent"
        )}
      >
        <List className="h-4 w-4 mr-2" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange("grid")}
        className={cn(
          "h-8 px-3",
          view === "grid" && "bg-accent"
        )}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Grid
      </Button>
    </div>
  );
}