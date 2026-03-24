const BASE = "https://multi-tenant-saas-backend.vercel.app";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

// Silent token refresh — returns true if a new access token was obtained
async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && !retried) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, true);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw new Error("Session expired. Please log in again.");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message ?? data?.detail ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  database: "healthy" | "unhealthy";
  timestamp: string;
}

export function getHealth() {
  return fetch(`${BASE}/health`).then(
    (r) => r.json() as Promise<HealthResponse>,
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  tenant_id: string;
  role: "admin" | "user" | "read_only";
}

export function login(tenant_id: string, username: string, password: string) {
  return request<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ tenant_id, username, password }),
  });
}

export interface MeResponse {
  user_id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "read_only";
}

export function getMe() {
  return request<MeResponse>("/api/auth/me/");
}

export function updateMe(data: {
  username?: string;
  password?: string;
  current_password?: string;
}) {
  return request<MeResponse>("/api/auth/me/update/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export interface ApiKeyResponse {
  key_id: string;
  api_key: string;
  tenant_id: string;
  user_id: string;
  created_at: string;
}

export function generateApiKey(user_id: string) {
  return request<ApiKeyResponse>("/api/auth/api-keys/", {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });
}

export function revokeApiKey(key_id: string) {
  return request<{ message: string }>(`/api/auth/api-keys/${key_id}/`, {
    method: "DELETE",
  });
}

// ── Tenant ────────────────────────────────────────────────────────────────────

export interface TenantRegistrationResponse {
  tenant_id: string;
  admin_username: string;
  admin_password: string;
}

export function registerTenant(
  identifier: string,
  admin_email: string,
  admin_username?: string,
) {
  return request<TenantRegistrationResponse>("/api/tenants/register/", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      admin_email,
      ...(admin_username ? { admin_username } : {}),
    }),
  });
}

export interface TenantConfig {
  tenant_id: string;
  subscription_tier: string;
  subscription_expiration: string;
  rate_limit: number;
  status: string;
  created_at: string;
}

export function getTenantConfig() {
  return request<TenantConfig>("/api/tenants/config/");
}

export function deleteTenant() {
  return request<{ message: string }>("/api/tenants/delete/", {
    method: "DELETE",
  });
}

export interface SubscriptionUpdateResponse extends TenantConfig {}

export function updateSubscription(
  tier: "free" | "professional" | "enterprise",
  expiration_date: string,
) {
  return request<SubscriptionUpdateResponse>("/api/tenants/subscription/", {
    method: "PUT",
    body: JSON.stringify({ tier, expiration_date }),
  });
}

// ── Widgets ───────────────────────────────────────────────────────────────────

export interface ApiWidget {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetPage {
  count: number;
  page: number;
  page_size: number;
  results: ApiWidget[];
}

export function listWidgets(params?: {
  page?: number;
  page_size?: number;
  name_contains?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  if (params?.name_contains) qs.set("name_contains", params.name_contains);
  return request<WidgetPage>(`/api/widgets/?${qs}`);
}

export function createWidget(data: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  return request<ApiWidget>("/api/widgets/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateWidget(
  id: string,
  data: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  },
) {
  return request<ApiWidget>(`/api/widgets/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteWidget(id: string) {
  return request<void>(`/api/widgets/${id}/`, { method: "DELETE" });
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  event_type: string;
  user_id: string | null;
  timestamp: string;
  details: Record<string, unknown>;
  ip_address: string | null;
}

export interface AuditLogPage {
  count: number;
  page: number;
  page_size: number;
  results: AuditLogEntry[];
}

export function listAuditLogs(params?: {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  return request<AuditLogPage>(`/api/tenants/audit-logs/?${qs}`);
}
