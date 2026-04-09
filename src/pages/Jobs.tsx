import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Briefcase, Bookmark, ChevronLeft, ChevronRight, ExternalLink, Share2, ThumbsDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useJobs, type Job } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSaved } from "@/contexts/SavedContext";
import { toast } from "sonner";
import { matchScoreDetailed, type MatchResult } from "@/lib/matchmaker";
import { cn } from "@/lib/utils";

function MatchBubble({ result }: { result: MatchResult }) {
  const [open, setOpen] = useState(false);
  const { score } = result;

  const color =
    score >= 70
      ? "bg-green-500 text-white"
      : score >= 40
        ? "bg-yellow-500 text-white"
        : "bg-muted text-muted-foreground";

  return (
    <div className="relative">
      <button
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-transform hover:scale-110 cursor-pointer",
          color
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        aria-label={`Match score ${score}%`}
      >
        {score}%
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Match Analysis</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", color)}>{score}%</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
          {result.matchedKeywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.matchedKeywords.map((kw) => (
                <span key={kw} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {kw}
                </span>
              ))}
            </div>
          )}
          {result.missingKeywords.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] text-muted-foreground">Consider adding:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.missingKeywords.map((kw) => (
                  <span key={kw} className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-foreground">{job.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{job.company?.companyName}</p>
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
          {showMatch && matchResult && matchResult.score > 0 && (
            <MatchBubble result={matchResult} />
          )}
          <button
            className={cn(
              "p-1 rounded transition-colors",
              isSaved ? "text-accent" : "text-muted-foreground hover:text-accent"
            )}
            onClick={(e) => { e.stopPropagation(); onSave(); }}
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
  matchResult,
  showMatch,
  onSave,
  onClose,
}: {
  job: Job;
  isSaved: boolean;
  matchResult: MatchResult | null;
  showMatch: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto rounded-lg border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{job.company?.companyName}</span>
            {job.company?.logoUrl && (
              <img src={job.company.logoUrl} alt="" className="h-5 w-5 rounded object-cover" />
            )}
          </div>
          {(job.city || job.country) && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[job.city, job.country].filter(Boolean).join(", ")}
            </p>
          )}
          {job.category && <p className="text-sm text-muted-foreground">{job.category}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden shrink-0">
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

      {/* Match badge */}
      {showMatch && matchResult && matchResult.score > 0 && (
        <div className="mt-5 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3 mb-2">
            <MatchBubble result={matchResult} />
            <span className="text-sm font-semibold">Match Score</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{matchResult.explanation}</p>
          {matchResult.matchedKeywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {matchResult.matchedKeywords.map((kw) => (
                <span key={kw} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{kw}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job info */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-foreground">Job Information</h3>
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
            <span className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              job.status === "ACTIVE"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            )}>
              {job.status}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-foreground">Full Job Description</h3>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { jobs, totalJobs, currentPage, totalPages, loading, fetchJobs } = useJobs();
  const { user } = useAuth();
  const { isJobSaved, toggleSaveJob } = useSaved();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs({
      search: search || undefined,
      country: countryFilter !== "all" ? countryFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      page,
      limit: 15,
    });
  }, [search, countryFilter, categoryFilter, page, fetchJobs]);

  // Auto-select first job when list changes
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  const showMatch = user?.role === "JOB_SEEKER";

  // Pre-compute match results for all visible jobs
  const matchResults = useMemo(() => {
    if (!showMatch || !user) return new Map<number, MatchResult>();
    const map = new Map<number, MatchResult>();
    for (const job of jobs) {
      map.set(job.id, matchScoreDetailed(user, job));
    }
    return map;
  }, [jobs, user, showMatch]);

  const selectedMatchResult = selectedJob && showMatch ? (matchResults.get(selectedJob.id) ?? null) : null;

  const handleSave = async (jobId: number) => {
    if (!user) {
      toast.error("Please log in to save jobs");
      return;
    }
    try {
      await toggleSaveJob(jobId);
    } catch (err: any) {
      toast.error(err.message || "Failed to save job");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header + Filters */}
      <ScrollReveal>
        <h1 className="text-2xl font-bold">Find Your Next Role</h1>
        {totalJobs > 0 && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalJobs} jobs found
          </p>
        )}
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Job title, keyword or company…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="Sweden">Sweden</SelectItem>
              <SelectItem value="Norway">Norway</SelectItem>
              <SelectItem value="Denmark">Denmark</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
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
        <div className="py-16 text-center text-muted-foreground">Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No jobs match your search. Try different keywords.</div>
      ) : (
        <div className="mt-5 flex gap-5" style={{ minHeight: "calc(100vh - 260px)" }}>
          {/* Left: Job list */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 260px)" }}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                isSaved={isJobSaved(job.id)}
                showMatch={!!showMatch}
                matchResult={matchResults.get(job.id) ?? null}
                onSelect={() => setSelectedJob(job)}
                onSave={() => handleSave(job.id)}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 pb-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          <div className="hidden lg:block flex-1 sticky top-6" style={{ maxHeight: "calc(100vh - 260px)" }}>
            {selectedJob ? (
              <JobDetailPanel
                job={selectedJob}
                isSaved={isJobSaved(selectedJob.id)}
                matchResult={selectedMatchResult}
                showMatch={!!showMatch}
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
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden overflow-y-auto">
          <div className="p-4">
            <JobDetailPanel
              job={selectedJob}
              isSaved={isJobSaved(selectedJob.id)}
              matchResult={selectedMatchResult}
              showMatch={!!showMatch}
              onSave={() => handleSave(selectedJob.id)}
              onClose={() => setSelectedJob(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
