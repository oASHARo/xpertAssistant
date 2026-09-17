"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Plus } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { useWizard } from "./wizard-context";
import { cvsService } from "@/lib/api/cvs.service";
import { jobsService } from "@/lib/api/jobs.service";
import type { JobCategory } from "@/types/job.types";
import type { UploadItem, UploadStatus } from "./wizard-context";

const ACCEPTED_TYPES = [".pdf", ".docx"];
const MAX_FILE_SIZE_MB = 100;

export function StepUploadResume() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  
  const items = state.uploadItems;
  const setItems = (action: React.SetStateAction<UploadItem[]>) => {
    if (typeof action === "function") {
      dispatch({ type: "UPDATE_UPLOAD_ITEMS", updater: action });
    } else {
      dispatch({ type: "SET_UPLOAD_ITEMS", items: action });
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addFiles(fileList: FileList) {
    const newItems: UploadItem[] = Array.from(fileList)
      .filter((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024)
      .map((file) => ({ id: crypto.randomUUID(), file, status: "pending" as const }));

    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach(uploadItem);
  }

  /**
   * Each file uploads independently and updates only its own list entry.
   * This means one failed upload (e.g. backend down) doesn't block or
   * roll back the others — matches the mockup, which shows individual
   * per-file progress bars, not one shared bar for the whole batch.
   */
  async function uploadItem(item: UploadItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));

    try {
      const response = await cvsService.uploadResume(item.file);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "success", serverFileId: response.data.id } : i
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "error", errorMessage: message } : i))
      );
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  const successfulUploads = items.filter((i) => i.status === "success" && i.serverFileId);

  async function handleAnalyzeResume() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // state.category is typed as JobCategory | "" in the draft wizard
      // state (empty before the user picks one on step 1). Step 1's Next
      // button is disabled until a category is chosen, so by the time a
      // user reaches step 3 this cast to JobCategory is always safe.
      const payload = {
        title: state.title,
        category: state.category as JobCategory,
        jobCode: state.jobCode || undefined,
        embeddedEmail: state.embeddedEmail || undefined,
        description: state.description,
        skills: state.skills,
        criteria: state.criteria.map(({ id, ...rest }) => rest),
        resumeFileIds: successfulUploads.map((i) => i.serverFileId!),
      };

      const response = await jobsService.create(payload);
      dispatch({ type: "RESET" });
      router.push(`/jobs/${response.data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create job. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0 shrink w-full">
      <div className="shrink-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-main">Upload Resumes</h2>
            <p className="text-sm text-text-muted">
              Easily upload multiple CVs at once to streamline hiring and quickly evaluate candidates.
            </p>
          </div>
          {/* "Upload From My CV's" (browsing existing folders) depends on
              the CV Manager screens being built — wired up once that exists,
              not blocking this step today. */}
          <Button className="bg-[#3BAEEB] hover:bg-[#3BAEEB]/90 text-white px-4 py-2 rounded-md" size="sm" disabled title="Coming once CV Manager is built">
            <Plus className="mr-2 h-4 w-4" /> Upload From My CV&apos;s
          </Button>
        </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#3BAEEB] py-12 transition-colors ${
          isDragging ? "bg-[#3BAEEB]/20" : "bg-[#3BAEEB1A]"
        }`}
      >
        <UploadCloud className="mb-4 h-10 w-10 text-[#3BAEEB]" />
        <p className="text-base">
          <span className="font-semibold text-[#00659B]">Click to upload file, folder</span>{" "}
          <span className="text-[#3BAEEB]">or drag and drop</span>
        </p>
        <p className="mt-2 text-sm text-[#3BAEEB]">PDF &amp; DOCX only Max file size: {MAX_FILE_SIZE_MB}MB.</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const isPdf = item.file.name.toLowerCase().endsWith(".pdf");
              const iconSrc = isPdf ? "/assets/icons/pdf.svg" : "/assets/icons/word.svg";
              const displayName = item.file.name.replace(/\.[^/.]+$/, "");

              return (
                <div key={item.id} className="flex flex-col gap-4 rounded-xl bg-[#FAFAFA] p-4 shadow-[0px_4px_10px_rgba(0,0,0,0.03)] border-none">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-[#EDE8FA] bg-white">
                        <img src={iconSrc} alt="File Icon" className="h-[26px] w-[26px] shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-text-main">{displayName}</p>
                        <p className="text-xs text-text-muted mt-0.5">{(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-danger-10 text-danger transition-colors hover:bg-[#FFE5E5]"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <Icon src="/assets/icons/trash.svg" className="h-5 w-5" />
                    </button>
                  </div>

                  {item.status === 'success' && (
                    <p className="text-[11px] text-[#A0A0A0] leading-snug">
                      Easily upload multiple resumes at once to enhance the hiring process and swiftly assess candidates.
                    </p>
                  )}

                  {(item.status === 'uploading' || item.status === 'pending') && (
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-[#3BAEEB]"
                          style={{ width: '45%' }} 
                        />
                      </div>
                      <span className="text-xs font-medium text-text-muted shrink-0 text-right">
                        45%
                      </span>
                    </div>
                  )}
                  
                  {item.status === "error" && (
                    <p className="text-xs text-danger">{item.errorMessage}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {submitError && <p className="mt-3 text-sm text-danger shrink-0">{submitError}</p>}

      <div className="mt-6 flex justify-between shrink-0">
        <Button variant="outline" className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" onClick={() => dispatch({ type: "SET_STEP", step: "criteria" })}>
          Back
        </Button>
        <Button
          onClick={handleAnalyzeResume}
          isLoading={isSubmitting}
          disabled={successfulUploads.length === 0}
          className="px-6 py-2.5"
        >
          Analyze Resume
        </Button>
      </div>
    </div>
  );
}