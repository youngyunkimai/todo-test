"use client";

import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useKanbanStore } from "@/lib/store";

export function DarkModeToggle() {
  const darkMode = useKanbanStore((s) => s.darkMode);
  const toggleDarkMode = useKanbanStore((s) => s.toggleDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="dark-mode-toggle" className="text-xs text-muted-foreground">
        Dark
      </Label>
      <Switch
        id="dark-mode-toggle"
        aria-label="Dark mode"
        checked={darkMode}
        onCheckedChange={toggleDarkMode}
        size="sm"
      />
    </div>
  );
}
