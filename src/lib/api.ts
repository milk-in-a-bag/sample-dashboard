const BASE = "https://multi-tenant-saas-backend.vercel.app";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useApiKey = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (useApiKey) {
    const apiKey = localStorage.getItem("api_key");
    if (apiKey) headers["X-API-Key"] = apiKey;
  } else {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message ?? data?.detail ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
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
