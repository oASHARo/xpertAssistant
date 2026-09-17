export type CvFileType = "pdf" | "docx";

/**
 * A single uploaded CV file, whether shown in "Recent Files"
 * or inside a folder listing.
 */
export interface CvFile {
  id: string;
  candidateName: string;
  fileType: CvFileType;
  fileSizeMb: number;
  folderId: string | null;
  uploadedAt: string; // ISO string
  downloadUrl: string;
}

/**
 * A folder on the "Your CV's" page (e.g. "Graphic Designers", "Data Science").
 * `fileCount` is denormalized so the grid doesn't need a join on every render.
 */
export interface CvFolder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
}