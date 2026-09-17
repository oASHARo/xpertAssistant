"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddCriteriaModal } from "./add-criteria-modal";
import { CriteriaCard } from "./criteria-card";
import { useWizard } from "./wizard-context";
import { analysisService } from "@/lib/api/analysis.service";
import type { JobCriterion } from "@/types/job.types";

export function StepSetCriteria() {
  const { state, dispatch } = useWizard();
  const [numberOfCriteria, setNumberOfCriteria] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  async function handleGenerateCriteria() {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      // This is the AI service call — separate backend, separate client
      // (aiClient, not coreClient), which is why analysisService exists
      // as its own file rather than living in jobs.service.ts.
      const response = await analysisService.generateCriteria({
        jobTitle: state.title,
        description: state.description,
        skills: state.skills,
        numberOfCriteria,
      });
      dispatch({ type: "SET_CRITERIA", criteria: response.data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate criteria. Please try again.";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleOpenManualModal() {
    setIsAddModalOpen(true);
  }

  function handleIdealAnswerChange(id: string, value: string) {
    dispatch({
      type: "SET_CRITERIA",
      criteria: state.criteria.map((c) => (c.id === id ? { ...c, idealAnswer: value } : c)),
    });
  }

  function handleDeleteCriterion(id: string) {
    dispatch({ type: "REMOVE_CRITERION", criterionId: id });
  }

  return (
    <div className="flex flex-col min-h-0 shrink w-full">
      <div className="shrink-0">
      <h2 className="mb-1 text-lg font-semibold text-text-main">Criteria for Resume</h2>
      <p className="mb-4 text-sm text-text-muted">
        Criteria will be pulled from the previous Job Description for resume ranking.
      </p>

      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            label="Number of Criteria"
            type="number"
            min={1}
            max={10}
            value={numberOfCriteria}
            onChange={(e) => setNumberOfCriteria(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleGenerateCriteria} isLoading={isGenerating} className="px-6 py-2.5">
            Generate Criteria
          </Button>
        </div>
      </div>

      {generateError && <p className="mt-2 text-sm text-danger">{generateError}</p>}
      </div>

      {state.criteria.length > 0 && (
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <div className="mb-3 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-text-main">System Generated Criteria</h3>
              <p className="text-xs text-text-muted">
                You can adjust the number 0-10 based on your job description for results that fit you better!
              </p>
            </div>
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenManualModal}>
              Add Criteria
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 flex-1 overflow-y-auto pr-2">
            {state.criteria.map((criterion, index) => (
              <CriteriaCard
                key={criterion.id}
                criterion={criterion}
                index={index}
                onIdealAnswerChange={handleIdealAnswerChange}
                onDelete={handleDeleteCriterion}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between shrink-0">
        <Button variant="outline" className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" onClick={() => dispatch({ type: "SET_STEP", step: "details" })}>
          Back
        </Button>
        <Button
          onClick={() => dispatch({ type: "SET_STEP", step: "upload" })}
          disabled={state.criteria.length === 0}
          className="px-6 py-2.5"
        >
          Save Criteria
        </Button>
      </div>

      <AddCriteriaModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}