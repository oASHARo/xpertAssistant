"use client";

import { Stepper } from "@/components/ui/stepper";
import { useWizard, WIZARD_STEPS } from "./wizard-context";
import { Icon } from "@/components/ui/icons";

const STEP_CONFIG = [
  { label: "Add Job Details", icon: <Icon src="/assets/icons/addjobdetail.svg" className="w-5 h-5" /> },
  { label: "Set Criteria", icon: <Icon src="/assets/icons/setcriteria.svg" className="w-5 h-5" /> },
  { label: "Upload Resume", icon: <Icon src="/assets/icons/uploadresume.svg" className="w-5 h-5" /> },
  { label: "", icon: <Icon src="/assets/icons/setcriteria.svg" className="w-5 h-5" /> },
];

/**
 * Small, isolated Client Component whose only job is reading wizard state
 * and feeding it to the (dumb, global) Stepper primitive. Isolating this
 * lets layout.tsx stay a Server Component — the same "smallest possible
 * client boundary" pattern used for NavItem earlier.
 */
export function WizardStepper() {
  const { state } = useWizard();
  const currentStepIndex = WIZARD_STEPS.indexOf(state.currentStep);
  return <Stepper steps={STEP_CONFIG} currentStepIndex={currentStepIndex} />;
}
