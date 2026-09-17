"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useWizard } from "./wizard-context";
import type { JobCriterion } from "@/types/job.types";

interface AddCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCriteriaModal({ isOpen, onClose }: AddCriteriaModalProps) {
  const { dispatch } = useWizard();
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  function handleSaveManualCriterion() {
    const newCriterion: JobCriterion = {
      id: crypto.randomUUID(),
      title: manualTitle.trim() || "New Criterion",
      ratingCalculationExplanation: manualDescription.trim() || "Describe how this criterion should be evaluated.",
      idealAnswer: "",
    };
    dispatch({ type: "ADD_CRITERION", criterion: newCriterion });
    onClose();
    // Reset state for next open
    setManualTitle("");
    setManualDescription("");
  }

  // Handle closing modal and resetting state when dismissed without saving
  function handleClose() {
    setManualTitle("");
    setManualDescription("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-xl p-0 animate-slide-up-fade rounded-[1rem]"
    >
      <div className="p-6 pb-4">
        <h2 className="text-xl font-semibold text-text-main">Add Criteria</h2>
        <p className="text-[1rem] text-text-muted mt-1">Pick one or more resumes and feel free to add a date filter!</p>

        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Add Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />
          <div className="w-full relative mt-1">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-text-muted z-10">Add Description</label>
            <textarea
              rows={3}
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              className="w-full bg-transparent border border-border-light rounded-md px-4 py-3 text-text-main transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] h-auto resize-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
        <Button onClick={handleSaveManualCriterion} disabled={!manualTitle.trim() || !manualDescription.trim()} className="px-8 py-2.5 bg-[#3BAEEB] hover:bg-[#3BAEEB]/90">
          Add Criteria
        </Button>
      </div>
    </Modal>
  );
}
