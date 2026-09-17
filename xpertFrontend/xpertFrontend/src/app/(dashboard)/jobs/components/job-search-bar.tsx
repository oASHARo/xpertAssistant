"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

const SUGGESTION_SKILLS = ["Deep Learning", "Programming", "Computer vision", "NLP"];

/**
 * "use client" because this needs input state + router navigation.
 * Deliberately drives search through the URL (?search=...) rather than
 * local state passed via props — this keeps page.tsx (a Server Component)
 * as the single source of truth for "what jobs are shown," and means a
 * search is shareable/bookmarkable and survives a refresh.
 */
export function JobSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  function runSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.push(`${ROUTES.jobs}?${params.toString()}`);
  }

  function handleSuggestionClick(skill: string) {
    setQuery(skill);
    runSearch(skill);
  }

  return (
    <div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
            placeholder="AI Machine Learning, etc."
            className="h-14 bg-gray-100 border-none pr-36 shadow-sm text-base"
          />
          <Button
            onClick={() => runSearch(query)}
            leftIcon={<Icon src="/assets/icons/search.svg" className="h-[1.375rem] w-[1.375rem] mr-1.5 text-white" />}
            className="absolute right-1.5 top-1.5 bottom-1.5 h-auto py-1 px-8 shadow-none rounded-[0.625rem] text-lg font-medium tracking-wide"
          >
            Search
          </Button>
        </div>
        <Link href={ROUTES.newJob} className="block shrink-0">
          <div className="flex h-14 cursor-pointer items-center gap-2.5 rounded-[0.6rem] bg-primary px-4 shadow-sm transition-colors hover:bg-primary/90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Icon src="/assets/icons/addjob.svg" className="h-5 w-5 text-white" />
            </span>
            <div className="flex flex-col items-start leading-tight mt-0.5">
              <span className="text-[1.0625rem] font-medium text-white tracking-wide">Add Job</span>
              <span className="text-xs font-normal text-white/90">Create New Job to Analyze</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400">Suggestion Skills</span>
        {SUGGESTION_SKILLS.map((skill) => (
          <button key={skill} onClick={() => handleSuggestionClick(skill)}>
            <Badge variant="blue">{skill}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
