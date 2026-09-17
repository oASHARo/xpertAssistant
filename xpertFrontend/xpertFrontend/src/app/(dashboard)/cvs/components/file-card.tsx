import { FileText } from "lucide-react";
import type { CvFile } from "@/types/cv.types";

export interface FileCardProps {
  file: CvFile;
}

// Word-doc blue vs PDF red, matching the two icon colors visible in the mockup
const FILE_TYPE_COLOR: Record<CvFile["fileType"], string> = {
  docx: "text-blue-500",
  pdf: "text-red-500",
};

export function FileCard({ file }: FileCardProps) {
  return (
    <a
      href={file.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl border border-gray-100 p-3 transition-shadow hover:shadow-sm"
    >
      <FileText className={`h-8 w-8 shrink-0 ${FILE_TYPE_COLOR[file.fileType]}`} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">{file.candidateName}</p>
        <p className="text-xs text-gray-400">{file.fileSizeMb.toFixed(1)} MB</p>
      </div>
    </a>
  );
}