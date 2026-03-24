import { TenantCard } from "../components/settings/TenantCard";
import { ProfileCard } from "../components/settings/ProfileCard";
import { ApiKeysCard } from "../components/settings/ApiKeysCard";

export function SettingsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <TenantCard />
        <ProfileCard />
      </div>
      <div className="lg:col-span-2">
        <ApiKeysCard />
      </div>
    </div>
  );
}
