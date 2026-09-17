import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreDonutGroup } from "./score-donut-group";
import type { Candidate } from "@/types/candidate.types";
import { useState } from "react";
import { coreClient } from "@/lib/api/core-client";

export interface CandidateCardProps {
  candidate: Candidate;
}

const STATUS_BADGE_VARIANT = {
  recommended: "green",
  shortlisted: "blue",
  rejected: "red",
} as const;

export function CandidateCard({ candidate }: CandidateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      const { blob, filename } = await coreClient.downloadBlob(`/cvs/download/${candidate.cvFileId}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${candidate.name}-CV.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download CV:", err);
      alert("Failed to download CV. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-blue-700">{candidate.name}</h4>
          <p className="text-xs text-gray-400">{candidate.role}</p>
          <div className="mt-1.5 flex gap-1.5">
            <Badge variant={STATUS_BADGE_VARIANT[candidate.status]}>
              {candidate.status === "recommended" ? "Recommended" : candidate.status === "shortlisted" ? "Shortlisted" : "Rejected"}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<Download className="h-3.5 w-3.5" />} 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download CV"}
        </Button>
      </div>

      <div className="mt-3 space-y-0.5 text-xs text-gray-500">
        <p>{candidate.email}</p>
        <p>{candidate.phone}</p>
        <p>{candidate.address}</p>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <ScoreDonutGroup breakdown={candidate.scoreBreakdown} />
      </div>
    </Card>
  );
}