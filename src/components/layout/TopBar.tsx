import React from "react";
import { SunIcon, MoonIcon, MenuIcon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RoleBadge } from "../ui/Badge";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const {
    theme,
    toggleTheme,
    currentUser,
    currentPage,
    health,
    healthLoading,
    refreshHealth,
  } = useApp();
  const pageTitles: Record<string, string> = {
    dashboard: "Widgets",
    settings: "Tenant Settings",
    audit: "Audit Log",
  };

  const isHealthy =
    health?.status === "healthy" && health?.database === "healthy";
  const healthColor = healthLoading
    ? "bg-zinc-400"
    : health === null
      ? "bg-zinc-400"
      : isHealthy
        ? "bg-green-500"
        : "bg-red-500";

  const healthLabel = healthLoading
    ? "Checking..."
    : health === null
      ? "Unknown"
      : isHealthy
        ? "All systems operational"
        : `Degraded — DB: ${health.database}`;

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {pageTitles[currentPage] || "Dashboard"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Health indicator */}
        <button
          onClick={refreshHealth}
          title={healthLabel}
          className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${healthColor} ${isHealthy ? "animate-pulse" : ""}`}
          />
          <span className="hidden sm:inline">{healthLabel}</span>
        </button>

        {currentUser && (
          <div className="hidden sm:flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {currentUser.username}
            </span>
            <RoleBadge role={currentUser.role} />
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="w-4 h-4" />
          ) : (
            <MoonIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
