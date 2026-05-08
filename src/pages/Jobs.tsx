import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useJobs, type Job } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSaved } from "@/contexts/SavedContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { matchScoreDetailed, type MatchResult } from "@/lib/matchmaker";
import { cn } from "@/lib/utils";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface AiMatchResult {
  score: number;
  explanation: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  criticalGaps: string[];
}

function MatchBubble({ result, size = "md" }: { result: MatchResult; size?: "sm" | "md" | "lg" }) {
  const { score } = result;

  const colorClasses =
    score >= 70
      ? "bg-green-500/90 text-white ring-green-500/30"
      : score >= 40
        ? "bg-yellow-500/90 text-white ring-yellow-500/30"
        : "bg-muted text-muted-foreground ring-muted-foreground/20";

  const sizeClasses = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center rounded-full font-bold transition-all duration-200 hover:scale-110 hover:ring-4 cursor-pointer shadow-md",
            colorClasses,
            sizeClasses[size],
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Match score ${score}%`}
        >
          {score}%
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="left" align="start" className="w-80 p-0">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Match Analysis</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                colorClasses,
              )}
            >
              {score}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-muted-foreground/50",
              )}
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.explanation}
          </p>

          {result.matchedKeywords.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-foreground">Matching Skills</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingKeywords.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-foreground">Consider Adding</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.locationMatch && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
              <MapPin className="h-3 w-3" />
              <span>Location match</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function JobCard({
  job,
  isSelected,
  isSaved,
  showMatch,
  matchResult,
  onSelect,
  onSave,
}: {
  job: Job;
  isSelected: boolean;
  isSaved: boolean;
  showMatch: boolean;
  matchResult: MatchResult | null;
  onSelect: () => void;
  onSave: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-foreground">
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.company?.companyName}
          </p>
          {(job.city || job.country) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {[job.city, job.country].filter(Boolean).join(", ")}
            </p>
          )}
          {job.category && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              ✓ {job.category}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          {showMatch && isSelected && matchResult && (
            <MatchBubble result={matchResult} />
          )}
          <button
            className={cn(
              "p-1 rounded transition-colors",
              isSaved
                ? "text-accent"
                : "text-muted-foreground hover:text-accent",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            aria-label="Save job"
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>
    </button>
  );
}

function JobDetailPanel({
  job,
  isSaved,
  showMatch,
  aiMatch,
  aiMatchLoading,
  onSave,
  onClose,
}: {
  job: Job;
  isSaved: boolean;
  showMatch: boolean;
  aiMatch: AiMatchResult | null;
  aiMatchLoading: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const scoreColor =
    !aiMatch ? "" :
    aiMatch.score >= 70 ? "text-green-600" :
    aiMatch.score >= 45 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="h-full overflow-y-auto rounded-lg border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {job.company?.companyName}
            </span>
            {job.company?.logoUrl && (
              <img
                src={job.company.logoUrl}
                alt=""
                className="h-5 w-5 rounded object-cover"
              />
            )}
          </div>
          {(job.city || job.country) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[job.city, job.country].filter(Boolean).join(", ")}
            </p>
          )}
          {job.category && (
            <p className="text-sm text-muted-foreground">{job.category}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {job.webpage_url && (
          <Button asChild className="gap-2">
            <a href={job.webpage_url} target="_blank" rel="noopener noreferrer">
              Apply on website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className={isSaved ? "text-accent" : ""}
          onClick={onSave}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
        </Button>
      </div>

      {/* AI Match section */}
      {showMatch && (
        <div className="mt-4 rounded-lg border bg-muted/40 p-3">
          {aiMatchLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analysing your fit…
            </div>
          ) : aiMatch ? (
            <div className="space-y-2">
              {/* Score row */}
              <div className="flex items-center gap-2">
                <span className={cn("text-xl font-bold tabular-nums", scoreColor)}>
                  {aiMatch.score}%
                </span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      aiMatch.score >= 70 ? "bg-green-500" :
                      aiMatch.score >= 45 ? "bg-yellow-500" : "bg-red-400",
                    )}
                    style={{ width: `${aiMatch.score}%` }}
                  />
                </div>
                {aiMatch.recommendation && (
                  <span className="text-xs text-muted-foreground shrink-0">{aiMatch.recommendation}</span>
                )}
              </div>
              {/* Explanation */}
              <p className="text-xs text-muted-foreground leading-relaxed">{aiMatch.explanation}</p>
              {/* Strengths + Gaps inline */}
              {(aiMatch.strengths.length > 0 || aiMatch.gaps.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {aiMatch.strengths.map((s) => (
                    <span key={s} className="rounded bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">✓ {s}</span>
                  ))}
                  {aiMatch.gaps.map((g) => (
                    <span key={g} className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">{g}</span>
                  ))}
                </div>
              )}
              {/* Critical gaps */}
              {aiMatch.criticalGaps.filter(Boolean).length > 0 && (
                <p className="text-[10px] text-destructive">
                  ⚠ {aiMatch.criticalGaps.filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Upload a CV to get your AI match score.</p>
          )}
        </div>
      )}

      {/* Job info */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-foreground">
          Job Information
        </h3>
        <div className="mt-3 space-y-3">
          {job.category && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{job.category}</span>
            </div>
          )}
          {(job.city || job.country) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{[job.city, job.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {job.status && (
            <span
              className={cn(
                "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                job.status === "ACTIVE"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {job.status}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-foreground">
          Full Job Description
        </h3>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {stripHtml(
            typeof job.description === "string"
              ? job.description
              : (job.description as Record<string, string>)?.text ||
                (job.description as Record<string, string>)?.text_formatted ||
                ""
          ) || "No description available"}
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { jobs, totalJobs, currentPage, totalPages, loading, isDemo, fetchJobs } =
    useJobs();
  const { user } = useAuth();
  const { isJobSaved, toggleSaveJob } = useSaved();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [aiMatch, setAiMatch] = useState<AiMatchResult | null>(null);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchJobs({
      search: search || undefined,
      country: countryFilter !== "all" ? countryFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      page,
      limit: 15,
    });
  }, [search, countryFilter, categoryFilter, page, fetchJobs]);

  // Auto-select first job on desktop only (so mobile users see the list first)
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob && window.innerWidth >= 1024) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  // Close mobile overlay when filters change / new list loads
  useEffect(() => {
    setMobileDetailOpen(false);
  }, [search, countryFilter, categoryFilter, page]);

  // Fetch AI match score when job is selected
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    if (!selectedJob || user?.role !== "JOB_SEEKER") {
      setAiMatch(null);
      setAiMatchLoading(false);
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAiMatch(null);
    setAiMatchLoading(true);
    api.matchmake(selectedJob.id, user.id)
      .then((res) => {
        if (ctrl.signal.aborted) return;
        const d = (res as any) ?? {};
        setAiMatch({
          score: typeof d.Score === "number" ? d.Score : 0,
          explanation: d.Explanation || "",
          strengths: Array.isArray(d.Strengths) ? d.Strengths.filter(Boolean) : [],
          gaps: Array.isArray(d.WeaknessesGaps) ? d.WeaknessesGaps.filter(Boolean) : [],
          recommendation: d.FinalRecommendation || "",
          criticalGaps: Array.isArray(d.CriticalGaps) ? d.CriticalGaps.filter(Boolean) : [],
        });
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setAiMatch(null);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setAiMatchLoading(false);
      });
    return () => ctrl.abort();
  }, [selectedJob?.id, user?.id, user?.role]);

  const showMatch = user?.role === "JOB_SEEKER";

  // Pre-compute match results for all visible jobs
  const matchResults = useMemo(() => {
    if (!showMatch || !user) return new Map<string | number, MatchResult>();
    const map = new Map<string | number, MatchResult>();
    for (const job of jobs) {
      // For matchScoreDetailed, convert ID to number if it's a string
      const numericId =
        typeof job.id === "string" ? parseInt(job.id, 10) : job.id;
      if (!isNaN(numericId)) {
        map.set(job.id, matchScoreDetailed(user, job));
      }
    }
    return map;
  }, [jobs, user, showMatch]);

  const handleSave = async (jobId: number | string) => {
    if (!user) {
      toast.error("Please log in to save jobs");
      return;
    }
    try {
      await toggleSaveJob(jobId);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to save job");
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {isDemo && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          ⚠️ Could not reach the server — showing demo jobs.
        </div>
      )}
      {/* Header + Filters */}
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Find Your Next Role</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and filter job opportunities.
          {totalJobs > 0 && (
            <span className="ml-2 text-sm">({totalJobs} jobs found)</span>
          )}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Job title, keyword or company…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={countryFilter}
            onValueChange={(v) => {
              setCountryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="Sweden">Sweden</SelectItem>
              <SelectItem value="Norway">Norway</SelectItem>
              <SelectItem value="Denmark">Denmark</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          Loading jobs…
        </div>
      ) : (
        <div className="mt-6 flex gap-6" style={{ minHeight: "calc(100vh - 260px)" }}>
          {/* Left: Job list */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-2 overflow-y-auto lg:max-h-[calc(100vh-260px)] pr-1 scrollbar-thin">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                isSaved={isJobSaved(job.id)}
                showMatch={!!showMatch}
                matchResult={matchResults.get(job.id) ?? null}
                onSelect={() => {
                  setSelectedJob(job);
                  setMobileDetailOpen(true);
                }}
                onSave={() => handleSave(job.id)}
              />
            ))}
            {jobs.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                No jobs match your search. Try different keywords.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right: Job detail (desktop) */}
          <div className="hidden lg:block flex-1 min-w-0 lg:max-h-[calc(100vh-260px)]">
            {selectedJob ? (
              <JobDetailPanel
                job={selectedJob}
                isSaved={isJobSaved(selectedJob.id)}
                showMatch={!!showMatch}
                aiMatch={aiMatch}
                aiMatchLoading={aiMatchLoading}
                onSave={() => handleSave(selectedJob.id)}
                onClose={() => setSelectedJob(null)}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border bg-card text-muted-foreground">
                Select a job to see details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: full-screen detail overlay */}
      {selectedJob && mobileDetailOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden overflow-y-auto">
          <div className="p-4">
            <JobDetailPanel
              job={selectedJob}
              isSaved={isJobSaved(selectedJob.id)}
              showMatch={!!showMatch}
              aiMatch={aiMatch}
              aiMatchLoading={aiMatchLoading}
              onSave={() => handleSave(selectedJob.id)}
              onClose={() => setMobileDetailOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
