"use client";

import { createContext, useContext, useReducer, ReactNode, Dispatch } from "react";
import type { JobCategory, JobCriterion } from "@/types/job.types";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  serverFileId?: string;
  errorMessage?: string;
}

/**
 * WHY useReducer + Context instead of Zustand/Redux:
 * This state is scoped to exactly one flow (the 3-step wizard) and dies
 * the moment the user leaves /jobs/new — it should never be readable from
 * outside this route. A global store would leak this into the rest of the
 * app for no benefit. useReducer also gives us named, traceable actions
 * ("SET_JOB_DETAILS", "ADD_CRITERION") instead of scattered setState calls,
 * which matters once step 2/3 both need to mutate overlapping pieces of state.
 */

export const WIZARD_STEPS = ["details", "criteria", "upload", "analyze"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export interface WizardState {
  currentStep: WizardStep;

  // Step 1 — Add Job Details
  title: string;
  category: JobCategory | "";
  jobCode: string;
  embeddedEmail: string;
  description: string;
  skills: string[];

  // Step 2 — Set Criteria
  criteria: JobCriterion[];

  // Step 3 — Upload Resume
  uploadItems: UploadItem[];
}

const initialState: WizardState = {
  currentStep: "details",
  title: "",
  category: "",
  jobCode: "",
  embeddedEmail: "",
  description: "",
  skills: [],
  criteria: [],
  uploadItems: [],
};

type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_JOB_DETAILS"; payload: Partial<Pick<WizardState, "title" | "category" | "jobCode" | "embeddedEmail" | "description">> }
  | { type: "ADD_SKILL"; skill: string }
  | { type: "REMOVE_SKILL"; skill: string }
  | { type: "SET_CRITERIA"; criteria: JobCriterion[] }
  | { type: "ADD_CRITERION"; criterion: JobCriterion }
  | { type: "REMOVE_CRITERION"; criterionId: string }
  | { type: "SET_UPLOAD_ITEMS"; items: UploadItem[] }
  | { type: "UPDATE_UPLOAD_ITEMS"; updater: (prev: UploadItem[]) => UploadItem[] }
  | { type: "RESET" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_JOB_DETAILS":
      return { ...state, ...action.payload };
    case "ADD_SKILL":
      // Guard against duplicates — mirrors the mockup's "max 10 skills" input
      if (state.skills.includes(action.skill) || state.skills.length >= 10) {
        return state;
      }
      return { ...state, skills: [...state.skills, action.skill] };
    case "REMOVE_SKILL":
      return { ...state, skills: state.skills.filter((s) => s !== action.skill) };
    case "SET_CRITERIA":
      return { ...state, criteria: action.criteria };
    case "ADD_CRITERION":
      return { ...state, criteria: [...state.criteria, action.criterion] };
    case "REMOVE_CRITERION":
      return { ...state, criteria: state.criteria.filter((c) => c.id !== action.criterionId) };
    case "SET_UPLOAD_ITEMS":
      return { ...state, uploadItems: action.items };
    case "UPDATE_UPLOAD_ITEMS":
      return { ...state, uploadItems: action.updater(state.uploadItems) };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Throws instead of returning undefined/null if used outside the provider.
 * This turns a "wizard fields silently don't update" bug into an immediate,
 * obvious error at the exact spot the mistake was made.
 */
export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider (i.e. inside app/(dashboard)/jobs/new)");
  }
  return context;
}