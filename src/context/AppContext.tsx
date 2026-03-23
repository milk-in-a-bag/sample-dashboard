import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  memo,
  type ReactNode,
} from "react";
export type Role = "admin" | "user" | "read_only";
export type Theme = "dark" | "light";
export type Page = "login" | "register" | "dashboard" | "settings" | "audit";
export interface User {
  username: string;
  role: Role;
  tenantId: string;
}
export interface Tenant {
  id: string;
  name: string;
  status: "active" | "pending_deletion" | "deleted";
  tier: "free" | "professional" | "enterprise";
  createdAt: string;
  adminEmail: string;
}
export interface Widget {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: string;
}
export interface ApiKey {
  id: string;
  key: string;
  maskedKey: string;
  createdAt: string;
}
export interface AuditEvent {
  id: string;
  timestamp: string;
  type: "auth" | "key" | "destructive" | "system";
  actor: string;
  ipAddress: string;
  detail: string;
}
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}
interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: User | null;
  login: (tenantId: string, username: string, role?: Role) => void;
  logout: () => void;
  currentPage: Page;
  navigate: (page: Page) => void;
  toasts: Toast[];
  addToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
  tenant: Tenant;
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  apiKeys: ApiKey[];
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKey[]>>;
  auditEvents: AuditEvent[];
  setAuditEvents: React.Dispatch<React.SetStateAction<AuditEvent[]>>;
}
const defaultTenant: Tenant = {
  id: "acme-corp",
  name: "Acme Corp",
  status: "active",
  tier: "enterprise",
  createdAt: "2023-11-12T08:00:00Z",
  adminEmail: "admin@acmecorp.com",
};
const initialWidgets: Widget[] = [
  {
    id: "w-1",
    name: "Auth Gateway",
    description: "Primary authentication routing and token validation layer.",
    metadata: {
      region: "us-east-1",
      version: "1.2.4",
    },
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "w-2",
    name: "Rate Limiter",
    description: "Redis-backed rate limiting for public API endpoints.",
    metadata: {
      limit: "1000/min",
      strategy: "sliding_window",
    },
    createdAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "w-3",
    name: "Cache Layer",
    description:
      "In-memory caching for frequently accessed tenant configurations.",
    metadata: {
      ttl: "3600",
      max_memory: "2GB",
    },
    createdAt: "2024-02-01T09:15:00Z",
  },
  {
    id: "w-4",
    name: "Webhook Dispatcher",
    description: "Delivers event payloads to registered external endpoints.",
    metadata: {
      retries: "3",
      timeout: "5000ms",
    },
    createdAt: "2024-02-10T16:45:00Z",
  },
  {
    id: "w-5",
    name: "Metrics Aggregator",
    description: "Collects and rolls up usage metrics for billing.",
    metadata: {
      interval: "1h",
      retention: "90d",
    },
    createdAt: "2024-03-05T11:00:00Z",
  },
];

const initialApiKeys: ApiKey[] = [
  {
    id: "k-1",
    key: import.meta.env.VITE_API_KEY_LIVE ?? "",
    maskedKey: "sk_live_••••••••WxYz",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "k-2",
    key: import.meta.env.VITE_API_KEY_TEST ?? "",
    maskedKey: "sk_test_••••••••WxYz",
    createdAt: "2024-02-15T09:30:00Z",
  },
];

const initialAuditEvents: AuditEvent[] = [
  {
    id: "a-1",
    timestamp: "2024-03-19T08:12:45Z",
    type: "auth",
    actor: "admin",
    ipAddress: "192.168.1.45",
    detail: "Successful login",
  },
  {
    id: "a-2",
    timestamp: "2024-03-18T14:30:12Z",
    type: "key",
    actor: "admin",
    ipAddress: "192.168.1.45",
    detail: "Generated new API key (sk_test_...)",
  },
  {
    id: "a-3",
    timestamp: "2024-03-18T10:15:00Z",
    type: "system",
    actor: "system",
    ipAddress: "10.0.0.1",
    detail: "Automated backup completed",
  },
  {
    id: "a-4",
    timestamp: "2024-03-17T16:45:22Z",
    type: "auth",
    actor: "jdoe",
    ipAddress: "203.0.113.42",
    detail: "Failed login attempt",
  },
  {
    id: "a-5",
    timestamp: "2024-03-15T09:22:10Z",
    type: "destructive",
    actor: "admin",
    ipAddress: "192.168.1.45",
    detail: 'Deleted widget "Legacy Sync"',
  },
  {
    id: "a-6",
    timestamp: "2024-03-14T11:05:33Z",
    type: "auth",
    actor: "admin",
    ipAddress: "192.168.1.45",
    detail: "Successful logout",
  },
  {
    id: "a-7",
    timestamp: "2024-03-14T08:01:15Z",
    type: "auth",
    actor: "admin",
    ipAddress: "192.168.1.45",
    detail: "Successful login",
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);
export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "dark";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tenant] = useState<Tenant>(defaultTenant);
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [auditEvents, setAuditEvents] =
    useState<AuditEvent[]>(initialAuditEvents);
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  const login = (tenantId: string, username: string, role: Role = "admin") => {
    setCurrentUser({
      username,
      role,
      tenantId,
    });
    setCurrentPage("dashboard");
    addToast("Successfully logged in", "success");
    // Add audit event
    const newEvent: AuditEvent = {
      id: `a-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "auth",
      actor: username,
      ipAddress: "192.168.1.100",
      detail: "Successful login",
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };
  const logout = () => {
    if (currentUser) {
      const newEvent: AuditEvent = {
        id: `a-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "auth",
        actor: currentUser.username,
        ipAddress: "192.168.1.100",
        detail: "Successful logout",
      };
      setAuditEvents((prev) => [newEvent, ...prev]);
    }
    setCurrentUser(null);
    setCurrentPage("login");
  };
  const navigate = (page: Page) => {
    // Role guards
    if (
      (page === "settings" || page === "audit") &&
      currentUser?.role !== "admin"
    ) {
      addToast("Unauthorized access", "error");
      setCurrentPage("dashboard");
      return;
    }
    setCurrentPage(page);
  };
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        login,
        logout,
        currentPage,
        navigate,
        toasts,
        addToast,
        removeToast,
        tenant,
        widgets,
        setWidgets,
        apiKeys,
        setApiKeys,
        auditEvents,
        setAuditEvents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
