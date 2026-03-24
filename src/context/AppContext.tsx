import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import * as api from "../lib/api";

export type Role = "admin" | "user" | "read_only";
export type Theme = "dark" | "light";
export type Page = "login" | "register" | "dashboard" | "settings" | "audit";

export interface User {
  id: string;
  username: string;
  role: Role;
  tenantId: string;
}

export interface Tenant {
  id: string;
  status: string;
  tier: string;
  createdAt: string;
  rateLimit: number;
  subscriptionExpiration: string;
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
  maskedKey: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  userId: string | null;
  ipAddress: string | null;
  details: Record<string, unknown>;
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
  login: (
    tenantId: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  currentPage: Page;
  navigate: (page: Page) => void;
  toasts: Toast[];
  addToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
  tenant: Tenant | null;
  tenantLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateSubscription: (
    tier: "free" | "professional" | "enterprise",
    expiration_date: string,
  ) => Promise<void>;
  widgets: Widget[];
  widgetsLoading: boolean;
  refreshWidgets: () => Promise<void>;
  createWidget: (data: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }) => Promise<void>;
  updateWidget: (
    id: string,
    data: {
      name: string;
      description?: string;
      metadata?: Record<string, string>;
    },
  ) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  apiKeys: ApiKey[];
  generateApiKey: () => Promise<string>;
  revokeApiKey: (id: string) => Promise<void>;
  auditEvents: AuditEvent[];
  auditLoading: boolean;
  auditTotal: number;
  auditPage: number;
  setAuditPage: (page: number) => void;
  refreshAuditLogs: (params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
  }) => Promise<void>;
  health: { status: string; database: string } | null;
  healthLoading: boolean;
  refreshHealth: () => Promise<void>;
  getMe: () => Promise<api.MeResponse>;
  updateMe: (data: {
    username?: string;
    password?: string;
    current_password?: string;
  }) => Promise<api.MeResponse>;
  sessionChecked: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapWidget(w: api.ApiWidget): Widget {
  return {
    id: w.id,
    name: w.name,
    description: w.description ?? "",
    metadata: w.metadata ?? {},
    createdAt: w.created_at,
  };
}

export function AppProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "dark",
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetsLoading, setWidgetsLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [health, setHealth] = useState<{
    status: string;
    database: string;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    const root = globalThis.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Rehydrate session from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setSessionChecked(true);
      return;
    }
    api
      .getMe()
      .then((me) => {
        setCurrentUser({
          id: me.user_id,
          username: me.username,
          role: me.role,
          tenantId: "",
        });
        setCurrentPage("dashboard");
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setSessionChecked(true));
  }, []);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const refreshTenant = async () => {
    setTenantLoading(true);
    try {
      const cfg = await api.getTenantConfig();
      setTenant({
        id: cfg.tenant_id,
        status: cfg.status,
        tier: cfg.subscription_tier,
        createdAt: cfg.created_at,
        rateLimit: cfg.rate_limit,
        subscriptionExpiration: cfg.subscription_expiration,
      });
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setTenantLoading(false);
    }
  };

  const updateSubscription = async (
    tier: "free" | "professional" | "enterprise",
    expiration_date: string,
  ) => {
    const cfg = await api.updateSubscription(tier, expiration_date);
    setTenant({
      id: cfg.tenant_id,
      status: cfg.status,
      tier: cfg.subscription_tier,
      createdAt: cfg.created_at,
      rateLimit: cfg.rate_limit,
      subscriptionExpiration: cfg.subscription_expiration,
    });
  };

  const refreshHealth = async () => {
    setHealthLoading(true);
    try {
      const h = await api.getHealth();
      setHealth({ status: h.status, database: h.database });
    } catch {
      setHealth({ status: "unhealthy", database: "unhealthy" });
    } finally {
      setHealthLoading(false);
    }
  };

  const getMe = () => api.getMe();

  const updateMe = async (data: {
    username?: string;
    password?: string;
    current_password?: string;
  }) => {
    const res = await api.updateMe(data);
    // Keep currentUser in sync if username changed
    if (data.username && currentUser) {
      setCurrentUser((prev) =>
        prev ? { ...prev, username: res.username } : prev,
      );
    }
    return res;
  };

  const refreshWidgets = async () => {
    setWidgetsLoading(true);
    try {
      const page = await api.listWidgets({ page_size: 100 });
      setWidgets(page.results.map(mapWidget));
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setWidgetsLoading(false);
    }
  };

  const refreshAuditLogs = async (params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
  }) => {
    setAuditLoading(true);
    try {
      const res = await api.listAuditLogs({ page_size: 15, ...params });
      setAuditTotal(res.count);
      setAuditEvents(
        res.results.map((e) => ({
          id: e.id,
          timestamp: e.timestamp,
          eventType: e.event_type,
          userId: e.user_id,
          ipAddress: e.ip_address,
          details: e.details,
        })),
      );
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setAuditLoading(false);
    }
  };

  const login = async (
    tenantId: string,
    username: string,
    password: string,
  ) => {
    const res = await api.login(tenantId, username, password);
    localStorage.setItem("access_token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    setCurrentUser({
      id: res.user_id,
      username,
      role: res.role,
      tenantId: res.tenant_id,
    });
    setCurrentPage("dashboard");
    addToast("Successfully logged in", "success");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setCurrentUser(null);
    setTenant(null);
    setWidgets([]);
    setApiKeys([]);
    setAuditEvents([]);
    setCurrentPage("login");
  };

  const navigate = (page: Page) => {
    if (
      (page === "settings" || page === "audit") &&
      currentUser?.role !== "admin"
    ) {
      addToast("Unauthorized access", "error");
      return;
    }
    setCurrentPage(page);
  };

  // Load data after login
  useEffect(() => {
    if (currentUser) {
      refreshTenant();
      refreshWidgets();
      refreshHealth();
    }
  }, [currentUser?.id]);

  // Poll health every 60s
  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 60_000);
    return () => clearInterval(interval);
  }, []);

  const createWidget = async (data: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }) => {
    const w = await api.createWidget(data);
    setWidgets((prev) => [mapWidget(w), ...prev]);
  };

  const updateWidget = async (
    id: string,
    data: {
      name: string;
      description?: string;
      metadata?: Record<string, string>;
    },
  ) => {
    const w = await api.updateWidget(id, data);
    setWidgets((prev) => prev.map((x) => (x.id === id ? mapWidget(w) : x)));
  };

  const deleteWidget = async (id: string) => {
    await api.deleteWidget(id);
    setWidgets((prev) => prev.filter((x) => x.id !== id));
  };

  const generateApiKey = async (): Promise<string> => {
    if (!currentUser) throw new Error("Not authenticated");
    const res = await api.generateApiKey(currentUser.id);
    setApiKeys((prev) => [
      {
        id: res.key_id,
        maskedKey: `${res.api_key.slice(0, 10)}••••••••`,
        createdAt: res.created_at,
      },
      ...prev,
    ]);
    return res.api_key;
  };

  const revokeApiKey = async (id: string) => {
    await api.revokeApiKey(id);
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
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
        tenantLoading,
        refreshTenant,
        updateSubscription,
        widgets,
        widgetsLoading,
        refreshWidgets,
        createWidget,
        updateWidget,
        deleteWidget,
        apiKeys,
        generateApiKey,
        revokeApiKey,
        auditEvents,
        auditLoading,
        auditTotal,
        auditPage,
        setAuditPage,
        refreshAuditLogs,
        health,
        healthLoading,
        refreshHealth,
        getMe,
        updateMe,
        sessionChecked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
