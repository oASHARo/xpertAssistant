import { CandidateCard } from "./candidate-card";
import type { Candidate } from "@/types/candidate.types";

export interface CandidateListProps {
  recommended: Candidate[];
  rejected: Candidate[];
  isProcessing?: boolean;
}

export function CandidateList({ recommended, rejected, isProcessing }: CandidateListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recommended Candidates</h2>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Short-List: {recommended.length}
        </span>
      </div>

      {recommended.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          {recommended.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        !isProcessing && (
          <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400 mb-4">
            No recommended candidates yet.
          </p>
        )
      )}

      {isProcessing && (
        <div className="rounded-xl border border-dashed border-[#3BAEEB] bg-[#3BAEEB]/5 py-12 flex flex-col items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3BAEEB] mb-4"></div>
          <p className="text-sm font-medium text-[#00659B]">AI is analyzing your CVs...</p>
          <p className="text-xs text-[#3BAEEB] mt-1">This may take a few moments depending on the number of resumes.</p>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-500">CVs Not Advised</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rejected.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}