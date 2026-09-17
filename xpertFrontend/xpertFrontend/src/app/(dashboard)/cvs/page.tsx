import { CvsToolbar } from "./components/cvs-toolbar";
import { FileCard } from "./components/file-card";
import { FolderGrid } from "./components/folder-grid";
import { cvsService } from "@/lib/api/cvs.service";
import type { CvFile, CvFolder } from "@/types/cv.types";

export default async function CvsPage() {
  let folders: CvFolder[] = [];
  let recentFiles: CvFile[] = [];
  let fetchFailed = false;

  try {
    const [foldersRes, recentRes] = await Promise.all([
      cvsService.getFolders(),
      cvsService.getRecentFiles(),
    ]);
    folders = foldersRes.data;
    recentFiles = recentRes.data;
  } catch {
    fetchFailed = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Your CV&apos;s</h1>

      <div className="mt-4">
        <CvsToolbar />
      </div>

      {fetchFailed && (
        <p className="mt-4 text-sm text-amber-600">
          Couldn&apos;t reach the backend at the configured API URL — showing an empty state.
          Check NEXT_PUBLIC_CORE_API_URL in .env.local once your backend is running.
        </p>
      )}

      {recentFiles.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Recent Files</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {recentFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Files</h2>
        <FolderGrid folders={folders} />
      </div>
    </div>
  );
}
