import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function LoginPage() {
  const { login, navigate } = useApp();
  const [tenantId, setTenantId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tenantId || !username || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await login(tenantId, username, password);
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
            Platform
          </h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="p-4 -mx-6 -mt-6 mb-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <Input
                label="Tenant ID"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="your-organization"
                className="font-mono"
                helperText="Your organization identifier"
              />
            </div>

            <Input
              label="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or admin@example.com"
              helperText="You can sign in with either"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <button
              onClick={() => navigate("register")}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Register a new tenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
