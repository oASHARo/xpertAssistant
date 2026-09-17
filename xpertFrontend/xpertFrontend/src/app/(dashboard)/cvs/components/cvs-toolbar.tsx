"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddFolderModal } from "./upload-modal";
import { ROUTES } from "@/lib/constants";

export function CvsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  function runSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("search", query);
    else params.delete("search");
    router.push(`${ROUTES.cvs}?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search by folder name or file..."
        />
      </div>
      <Button variant="outline" onClick={runSearch} leftIcon={<Search className="h-4 w-4" />}>
        Search
      </Button>
      <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
        Add Folder
      </Button>

      <AddFolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}