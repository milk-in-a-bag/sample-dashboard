import React from "react";
import {
  LayoutDashboardIcon,
  SettingsIcon,
  ScrollTextIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { TierBadge } from "../ui/Badge";
interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { tenant, currentPage, navigate, logout, currentUser } = useApp();
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      roles: ["admin", "user", "read_only"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      roles: ["admin"],
    },
    {
      id: "audit",
      label: "Audit Log",
      icon: ScrollTextIcon,
      roles: ["admin"],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role),
  );
  const handleNavigate = (id: string) => {
    navigate(id as any);
    onMobileClose();
  };
  const handleLogout = () => {
    logout();
    onMobileClose();
  };
  const sidebarContent = (
    <>
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {tenant?.id ?? "—"}
          </h1>
          <div>
            {tenant && (
              <TierBadge
                tier={tenant.tier as "free" | "professional" | "enterprise"}
              />
            )}
          </div>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"}`}
            >
              <Icon
                className={`w-5 h-5 mr-3 ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-400 dark:text-zinc-500"}`}
              />

              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <LogOutIcon className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex flex-col w-60 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-screen fixed left-0 top-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          <div className="relative flex flex-col w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 h-full animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
