import React, { useEffect, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useApp, type Widget } from "../context/AppContext";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
interface WidgetFormProps {
  widget?: Widget | null;
  onClose: () => void;
}
export function WidgetForm({ widget, onClose }: WidgetFormProps) {
  const { setWidgets, addToast, currentUser } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState<
    {
      key: string;
      value: string;
    }[]
  >([]);
  useEffect(() => {
    if (widget) {
      setName(widget.name);
      setDescription(widget.description);
      setMetadata(
        Object.entries(widget.metadata).map(([k, v]) => ({
          key: k,
          value: v,
        })),
      );
    } else {
      setName("");
      setDescription("");
      setMetadata([]);
    }
  }, [widget]);
  const handleAddMetadata = () => {
    setMetadata([
      ...metadata,
      {
        key: "",
        value: "",
      },
    ]);
  };
  const handleRemoveMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };
  const handleMetadataChange = (
    index: number,
    field: "key" | "value",
    val: string,
  ) => {
    const newMeta = [...metadata];
    newMeta[index][field] = val;
    setMetadata(newMeta);
  };
  const handleSave = () => {
    if (!name.trim()) {
      addToast("Name is required", "error");
      return;
    }
    const metaObj: Record<string, string> = {};
    metadata.forEach((m) => {
      if (m.key.trim()) metaObj[m.key.trim()] = m.value.trim();
    });
    if (widget) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === widget.id
            ? {
                ...w,
                name,
                description,
                metadata: metaObj,
              }
            : w,
        ),
      );
      addToast("Widget updated successfully", "success");
    } else {
      const newWidget: Widget = {
        id: `w-${Date.now()}`,
        name,
        description,
        metadata: metaObj,
        createdAt: new Date().toISOString(),
      };
      setWidgets((prev) => [newWidget, ...prev]);
      addToast("Widget created successfully", "success");
    }
    onClose();
  };
  return (
    <div className="space-y-6">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Auth Gateway"
        autoFocus
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of this widget's purpose"
        textarea
        rows={3}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Metadata
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddMetadata}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add field
          </Button>
        </div>

        {metadata.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
            No metadata fields
          </div>
        ) : (
          <div className="space-y-2">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <Input
                  className="flex-1 font-mono text-sm"
                  placeholder="key"
                  value={item.key}
                  onChange={(e) =>
                    handleMetadataChange(index, "key", e.target.value)
                  }
                />

                <Input
                  className="flex-1 font-mono text-sm"
                  placeholder="value"
                  value={item.value}
                  onChange={(e) =>
                    handleMetadataChange(index, "value", e.target.value)
                  }
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2 text-zinc-400 hover:text-red-500"
                  onClick={() => handleRemoveMetadata(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export function WidgetFormFooter({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex gap-3 w-full justify-end">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onSave}>
        Save Widget
      </Button>
    </div>
  );
}
