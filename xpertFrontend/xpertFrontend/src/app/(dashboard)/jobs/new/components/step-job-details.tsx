"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "./wizard-context";
import type { JobCategory } from "@/types/job.types";

const CATEGORY_OPTIONS: JobCategory[] = [
  "Development",
  "Human Resources",
  "AI/ML",
  "Software Engineering",
  "Data Science",
  "Product Design",
  "User Experience",
  "Quality Assurance",
  "Logistics",
];

const DESCRIPTION_MIN = 150;
const DESCRIPTION_MAX = 10000;

export function StepJobDetails() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const [skillDraft, setSkillDraft] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== state.description) {
      editorRef.current.innerHTML = state.description;
      setDescriptionLength(editorRef.current.innerText.trim().length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount to populate existing state

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const textLen = editorRef.current.innerText.trim().length;
      setDescriptionLength(textLen);
      dispatch({ type: "SET_JOB_DETAILS", payload: { description: html } });
    }
  };

  function handleAddSkill() {
    const trimmed = skillDraft.trim();
    if (trimmed) {
      dispatch({ type: "ADD_SKILL", skill: trimmed });
      setSkillDraft("");
    }
  }

  function handleNext() {
    // Real validation (required fields, description length) will use
    // a schema library once we introduce React Hook Form + Zod for step 2/3
    // form complexity — kept minimal here since step 1 is intentionally simple.
    dispatch({ type: "SET_STEP", step: "criteria" });
  }

  return (
    <div className="flex flex-col min-h-0 shrink w-full">
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-4">
        <h2 className="mb-4 text-lg font-semibold text-text-main">Job Details</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
        <Input
          label="Job Title"
          value={state.title}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { title: e.target.value } })}
          placeholder="e.g. Senior Technical Recruiter"
        />

        <div className="w-full relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-text-muted z-10">Select Category</label>
          <select
            value={state.category}
            onChange={(e) =>
              dispatch({ type: "SET_JOB_DETAILS", payload: { category: e.target.value as JobCategory } })
            }
            className="w-full bg-transparent border border-border-light rounded-md px-4 py-3 text-text-main transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Add Job Code"
          value={state.jobCode}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { jobCode: e.target.value } })}
          placeholder="Optional"
        />

        <Input
          label="Embedded Email"
          type="email"
          value={state.embeddedEmail}
          onChange={(e) => dispatch({ type: "SET_JOB_DETAILS", payload: { embeddedEmail: e.target.value } })}
          placeholder="Optional"
        />
      </div>

      <div className="mt-8">
        <div className="w-full rounded-md border border-border-light overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <div className="bg-gray-50 border-b border-border-light px-4 py-2 flex gap-3 text-text-main items-center">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold', false)} className="font-bold cursor-pointer px-1 hover:bg-gray-200 rounded">B</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic', false)} className="italic cursor-pointer px-1 hover:bg-gray-200 rounded">i</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline', false)} className="underline cursor-pointer px-1 hover:bg-gray-200 rounded">U</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('foreColor', false, '#3BA9E5')} className="cursor-pointer px-1 ml-2 text-sm hover:bg-gray-200 rounded">A:</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyLeft', false)} className="cursor-pointer px-1 ml-2 hover:bg-gray-200 rounded">≡</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('justifyCenter', false)} className="cursor-pointer px-1 hover:bg-gray-200 rounded">≣</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList', false)} className="cursor-pointer px-1 text-sm hover:bg-gray-200 rounded">:=</button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="w-full bg-white p-4 text-sm text-text-main focus:outline-none h-41 overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            data-placeholder="Describe the role, responsibilities, and requirements..."
          />
        </div>
        <p className="mt-1 text-right text-xs text-text-muted">
          {descriptionLength} / Min: {DESCRIPTION_MIN} - Max: {DESCRIPTION_MAX} characters
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-text-main">Skills</label>
        <p className="mb-3 text-xs text-text-muted">
          Add skill keywords (max 10) to make your job more visible to the right candidates.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {state.skills.map((skill) => (
            <Badge key={skill} variant="blue" className="gap-2 bg-primary text-white rounded-full px-4 py-1.5 font-medium text-sm">
              {skill}
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_SKILL", skill })}
                aria-label={`Remove ${skill}`}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type..."
              disabled={state.skills.length >= 10}
              className="h-9 w-24 rounded-full border border-dashed border-border-light bg-white px-3 text-sm text-text-main focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={state.skills.length >= 10}
              className="bg-white border border-primary text-primary rounded-full px-4 py-1.5 flex items-center gap-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              aria-label="Add skill"
            >
              Add Skills <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      </div>

      <div className="mt-6 flex justify-between shrink-0">
        <Button 
          variant="outline" 
          className="text-text-light border border-border-light bg-transparent px-6 py-2 rounded-md hover:bg-gray-50" 
          onClick={() => router.push("/jobs")}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={!state.title || !state.category} className="px-6 py-2.5">
          Save Job
        </Button>
      </div>
    </div>
  );
}