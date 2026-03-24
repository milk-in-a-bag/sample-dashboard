import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import type { MeResponse } from "../../lib/api";

export function ProfileCard() {
  const { addToast, getMe, updateMe } = useApp();
  const [profileModal, setProfileModal] = useState(false);
  const [meData, setMeData] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const openModal = async () => {
    setProfileModal(true);
    setMeLoading(true);
    try {
      const me = await getMe();
      setMeData(me);
      setNewUsername(me.username);
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setMeLoading(false);
    }
  };

  const handleSave = async () => {
    const payload: {
      username?: string;
      password?: string;
      current_password?: string;
    } = {};
    if (newUsername && newUsername !== meData?.username)
      payload.username = newUsername;
    if (newPassword) {
      payload.password = newPassword;
      payload.current_password = currentPassword;
    }
    if (!Object.keys(payload).length) {
      setProfileModal(false);
      return;
    }
    setSaving(true);
    try {
      await updateMe(payload);
      addToast("Profile updated", "success");
      setProfileModal(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            Profile
          </h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Update your username or password. You can also sign in with your
            email address.
          </p>
          <Button variant="secondary" size="sm" onClick={openModal}>
            Edit Profile
          </Button>
        </div>
      </div>

      <Modal
        open={profileModal}
        onClose={() => setProfileModal(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          {meLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading...
            </p>
          ) : (
            <>
              {meData && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-md p-3 text-sm space-y-1">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Email:{" "}
                    </span>
                    <span className="font-mono text-zinc-900 dark:text-zinc-100">
                      {meData.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Role:{" "}
                    </span>
                    <span className="font-mono text-zinc-900 dark:text-zinc-100">
                      {meData.role}
                    </span>
                  </div>
                </div>
              )}
              <Input
                label="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
              />
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Leave password fields blank to keep your current password.
                </p>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to change password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setProfileModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={meLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
