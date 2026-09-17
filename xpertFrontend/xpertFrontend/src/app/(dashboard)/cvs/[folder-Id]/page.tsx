import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FileCard } from "../components/file-card";
import { cvsService } from "@/lib/api/cvs.service";
import { ROUTES } from "@/lib/constants";

export default async function CvFolderPage({ params }: { params: Promise<{ folderId: string }> }) {
  const { folderId } = await params;

  // Fetched in parallel — folder name and its files don't depend on
  // each other, so there's no reason to await them sequentially.
  const [folderResult, filesResult] = await Promise.all([
    cvsService.getFolderById(folderId).catch(() => null),
    cvsService.getFilesByFolder(folderId).catch(() => null),
  ]);

  const folderName = folderResult?.data.name ?? "Folder";
  const files = filesResult?.data ?? [];

  return (
    <div>
      <Link href={ROUTES.cvs} className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Your CV&apos;s
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900">{folderName}</h1>

      {files.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No files in this folder yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Upload resumes here, or check that your backend is running.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
