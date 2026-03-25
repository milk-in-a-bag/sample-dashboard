import { useEffect, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useApp, type Widget } from "../context/AppContext";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface WidgetFormProps {
  widget?: Widget | null;
  onClose: () => void;
}

export function WidgetForm({ widget, onClose }: WidgetFormProps) {
  const { createWidget, updateWidget, addToast } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    [],
  );

  useEffect(() => {
    if (widget) {
      setName(widget.name);
      setDescription(widget.description);
      setMetadata(
        Object.entries(widget.metadata).map(([key, value]) => ({ key, value })),
      );
    } else {
      setName("");
      setDescription("");
      setMetadata([]);
    }
  }, [widget]);

  const handleMetadataChange = (
    index: number,
    field: "key" | "value",
    val: string,
  ) => {
    const next = [...metadata];
    next[index][field] = val;
    setMetadata(next);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      addToast("Name is required", "error");
      return;
    }
    const metaObj: Record<string, string> = {};
    metadata.forEach((m) => {
      if (m.key.trim()) metaObj[m.key.trim()] = m.value.trim();
    });
    try {
      if (widget) {
        await updateWidget(widget.id, { name, description, metadata: metaObj });
        addToast("Widget updated successfully", "success");
      } else {
        await createWidget({ name, description, metadata: metaObj });
        addToast("Widget created successfully", "success");
      }
      onClose();
    } catch (e) {
      addToast((e as Error).message, "error");
    }
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
        placeholder="Brief description"
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
            onClick={() => setMetadata([...metadata, { key: "", value: "" }])}
          >
            <PlusIcon className="w-4 h-4 mr-1" /> Add field
          </Button>
        </div>

        {metadata.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 italic text-center py-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
            No metadata fields
          </div>
        ) : (
          <div className="space-y-2">
            {metadata.map((item, index) => (
              <div key={`meta-${index}`} className="flex items-start gap-2">
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
                  onClick={() =>
                    setMetadata(metadata.filter((_, i) => i !== index))
                  }
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden trigger for footer save button */}
      <button id="hidden-save-btn" className="hidden" onClick={handleSave} />
    </div>
  );
}

export function WidgetFormFooter({
  onCancel,
  onSave,
}: {
  readonly onCancel: () => void;
  readonly onSave: () => void;
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
