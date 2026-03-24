import { useState } from "react";
import { ClipboardIcon } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function ApiKeysCard() {
  const { apiKeys, generateApiKey, revokeApiKey, addToast } = useApp();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [revokeModal, setRevokeModal] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<{
    id: string;
    maskedKey: string;
  } | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const key = await generateApiKey();
      setNewKey(key);
      addToast("API Key generated", "success");
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;
    setRevoking(true);
    try {
      await revokeApiKey(keyToRevoke.id);
      addToast("API Key revoked", "success");
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setRevoking(false);
      setRevokeModal(false);
      setKeyToRevoke(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("Copied to clipboard", "success");
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            API Keys
          </h3>
          <Button onClick={handleGenerate} size="sm" loading={generating}>
            Generate API Key
          </Button>
        </div>
        <div className="p-5">
          {newKey && (
            <div className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1">
                    New API Key Generated
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3">
                    Copy this key now — it won't be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white dark:bg-zinc-950 px-3 py-1.5 rounded border border-indigo-100 dark:border-indigo-500/30 font-mono text-sm text-zinc-900 dark:text-zinc-100 select-all">
                      {newKey}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copy(newKey)}
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setNewKey(null)}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead>
                <tr>
                  {["Key", "Created", "Action"].map((h) => (
                    <th
                      key={h}
                      className={`py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${h === "Action" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No API keys generated yet.
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td className="py-4 whitespace-nowrap font-mono text-sm text-zinc-900 dark:text-zinc-100">
                        {key.maskedKey}
                      </td>
                      <td className="py-4 whitespace-nowrap font-mono text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(key.createdAt).toISOString().split("T")[0]}
                      </td>
                      <td className="py-4 whitespace-nowrap text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="px-2 py-1 text-xs"
                          onClick={() => {
                            setKeyToRevoke(key);
                            setRevokeModal(true);
                          }}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={revokeModal}
        onClose={() => setRevokeModal(false)}
        title="Revoke API Key"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to revoke{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              {keyToRevoke?.maskedKey}
            </span>
            ? Any applications using this key will immediately lose access.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setRevokeModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              loading={revoking}
            >
              Revoke Key
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
