import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import * as api from "../lib/api";

export function TenantRegistrationPage() {
  const { navigate } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<api.TenantRegistrationResponse | null>(
    null,
  );

  const slug = identifier
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !email) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.registerTenant(slug, email);
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Register Tenant
          </h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          {!result ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <Input
                  label="Organization Name"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Acme Corp"
                  autoFocus
                />
                {identifier && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    ID:{" "}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                      {slug}
                    </span>
                  </p>
                )}
              </div>

              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                loading={loading}
                disabled={!identifier || !email}
              >
                Continue
              </Button>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Tenant Created
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Save these credentials — the password won't be shown again.
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700">
                {[
                  { label: "Tenant ID", value: result.tenant_id },
                  { label: "Username", value: result.admin_username },
                  { label: "Temporary Password", value: result.admin_password },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">
                      {label}
                    </span>
                    <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100 select-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="w-full" onClick={() => navigate("login")}>
                Go to Login
              </Button>
            </div>
          )}

          {!result && (
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                onClick={() => navigate("login")}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
              >
                Already have an account? Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
