import { useState } from "react";
import { PackageIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useApp, type Widget } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { SlideOver } from "../components/ui/SlideOver";
import { Modal } from "../components/ui/Modal";
import { WidgetForm, WidgetFormFooter } from "../components/WidgetForm";

export function DashboardPage() {
  const { widgets, widgetsLoading, deleteWidget, addToast, currentUser } =
    useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<Widget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setEditingWidget(null);
    setFormOpen(true);
  };
  const handleEdit = (widget: Widget) => {
    setEditingWidget(widget);
    setFormOpen(true);
  };
  const confirmDelete = (widget: Widget) => {
    setWidgetToDelete(widget);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!widgetToDelete) return;
    setDeleting(true);
    try {
      await deleteWidget(widgetToDelete.id);
      addToast("Widget deleted", "success");
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setWidgetToDelete(null);
    }
  };

  const isAdmin = currentUser?.role === "admin";
  const isReadOnly = currentUser?.role === "read_only";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Widgets
        </h2>
        {!isReadOnly && <Button onClick={handleCreate}>New Widget</Button>}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                {["Name", "Description", "Metadata", "Created", ""].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                  >
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
              {widgetsLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={`skel-${i}`}>
                    {[32, 64, 16, 24, 12].map((w, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton variant="line" className={`w-${w}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : widgets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <PackageIcon className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      No widgets yet
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      Get started by creating your first widget.
                    </p>
                    {!isReadOnly && (
                      <Button onClick={handleCreate}>
                        Create your first widget
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                widgets.map((widget) => (
                  <tr
                    key={widget.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {widget.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                      {widget.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {Object.keys(widget.metadata).length} keys
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                      {new Date(widget.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        {!isReadOnly && (
                          <button
                            onClick={() => handleEdit(widget)}
                            className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => isAdmin && confirmDelete(widget)}
                          disabled={!isAdmin}
                          className={`transition-colors ${isAdmin ? "text-zinc-400 hover:text-red-600 dark:hover:text-red-400" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"}`}
                          title={isAdmin ? "Delete" : "Admin only"}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingWidget ? "Edit Widget" : "New Widget"}
        footer={
          <WidgetFormFooter
            onCancel={() => setFormOpen(false)}
            onSave={() => document.getElementById("hidden-save-btn")?.click()}
          />
        }
      >
        <div className="relative">
          <WidgetForm
            widget={editingWidget}
            onClose={() => setFormOpen(false)}
          />
          <button id="hidden-save-btn" className="hidden" />
        </div>
      </SlideOver>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Widget"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {widgetToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
