import Link from "next/link";
import { Folder } from "lucide-react";
import type { CvFolder } from "@/types/cv.types";

export interface FolderGridProps {
  folders: CvFolder[];
}

export function FolderGrid({ folders }: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
        <p className="text-sm font-medium text-gray-700">No folders yet</p>
        <p className="mt-1 text-sm text-gray-400">Create a folder to start organizing CVs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {folders.map((folder) => (
        <Link
          key={folder.id}
          href={`/cvs/${folder.id}`}
          className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-gray-50"
        >
          <Folder className="h-10 w-10 fill-blue-400 text-blue-400" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-gray-800">{folder.name}</p>
            <p className="text-xs text-gray-400">{folder.fileCount} files</p>
          </div>
        </Link>
      ))}
    </div>
  );
}