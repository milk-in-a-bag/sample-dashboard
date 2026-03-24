import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { TierBadge, StatusPill } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import * as api from "../../lib/api";

const TIERS = ["free", "professional", "enterprise"] as const;
type Tier = (typeof TIERS)[number];

export function TenantCard() {
  const { tenant, addToast, logout, updateSubscription } = useApp();
  const [deleteModal, setDeleteModal] = useState(false);
  const [confirmId, setConfirmId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier>("professional");
  const [expirationDate, setExpirationDate] = useState("");
  const [updatingSubscription, setUpdatingSubscription] = useState(false);

  const handleDeleteTenant = async () => {
    setDeleting(true);
    try {
      await api.deleteTenant();
      addToast("Tenant deletion initiated", "success");
      logout();
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!expirationDate) {
      addToast("Expiration date is required", "error");
      return;
    }
    setUpdatingSubscription(true);
    try {
      await updateSubscription(
        selectedTier,
        new Date(expirationDate).toISOString(),
      );
      addToast("Subscription updated", "success");
      setSubscriptionModal(false);
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setUpdatingSubscription(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            Tenant Details
          </h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              label: "Tenant ID",
              value: (
                <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                  {tenant?.id ?? "—"}
                </span>
              ),
            },
            {
              label: "Status",
              value: tenant && (
                <StatusPill
                  status={
                    tenant.status as "active" | "pending_deletion" | "deleted"
                  }
                />
              ),
            },
            {
              label: "Created",
              value: (
                <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                  {tenant
                    ? new Date(tenant.createdAt).toISOString().split("T")[0]
                    : "—"}
                </span>
              ),
            },
            {
              label: "Rate Limit",
              value: (
                <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                  {tenant ? `${tenant.rateLimit.toLocaleString()} req/hr` : "—"}
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {label}
              </span>
              {value}
            </div>
          ))}
          <div>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Subscription Tier
            </span>
            <div className="flex items-center justify-between">
              {tenant && (
                <TierBadge
                  tier={tenant.tier as "free" | "professional" | "enterprise"}
                />
              )}
              {tenant?.tier !== "enterprise" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSubscriptionModal(true)}
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setDeleteModal(true)}
          >
            Delete Tenant
          </Button>
        </div>
      </div>

      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setConfirmId("");
        }}
        title="Delete Tenant"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
              Warning: Destructive Action
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              This will permanently delete the tenant and all associated data.
              This cannot be undone.
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type{" "}
              <span className="font-mono font-bold select-none">
                {tenant?.id}
              </span>{" "}
              to confirm.
            </label>
            <Input
              value={confirmId}
              onChange={(e) => setConfirmId(e.target.value)}
              placeholder={tenant?.id}
              className="font-mono"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModal(false);
                setConfirmId("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmId !== tenant?.id}
              onClick={handleDeleteTenant}
              loading={deleting}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={subscriptionModal}
        onClose={() => setSubscriptionModal(false)}
        title="Update Subscription"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tier
            </label>
            <div className="flex gap-2">
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors capitalize ${
                    selectedTier === t
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Expiration Date"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setSubscriptionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              loading={updatingSubscription}
            >
              Update Subscription
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
