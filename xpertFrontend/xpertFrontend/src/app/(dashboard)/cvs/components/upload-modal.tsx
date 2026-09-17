"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cvsService } from "@/lib/api/cvs.service";

export interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFolderModal({ isOpen, onClose }: AddFolderModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await cvsService.createFolder(name.trim());
      setName("");
      onClose();
      // Server Component page needs to refetch the folder list to show
      // the new one — refresh() re-runs the page's data fetch without
      // a full page reload or losing client-side state elsewhere.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Folder">
      <Input
        label="Folder name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="e.g. Backend Engineers"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} isLoading={isSubmitting} disabled={!name.trim()}>
          Create Folder
        </Button>
      </div>
    </Modal>
  );
}