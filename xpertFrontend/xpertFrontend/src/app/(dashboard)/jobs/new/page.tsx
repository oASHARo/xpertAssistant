"use client";

import { useWizard } from "./components/wizard-context";
import { StepJobDetails } from "./components/step-job-details";
import { StepSetCriteria } from "./components/step-set-criteria";
import { StepUploadResume } from "./components/step-upload-resume";

/**
 * "use client" required — useWizard() reads Context, which only works
 * client-side. This is the single place that decides which step is visible;
 * step components themselves don't know about routing/step order, they just
 * dispatch SET_STEP when done. That separation means adding a 4th step later
 * only touches this switch and wizard-context.ts's WIZARD_STEPS array.
 */
export default function NewJobPage() {
  const { state } = useWizard();

  switch (state.currentStep) {
    case "details":
      return <StepJobDetails />;
    case "criteria":
      return <StepSetCriteria />;
    case "upload":
      return <StepUploadResume />;
    default:
      return null;
  }
}