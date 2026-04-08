import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Bookmark, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSaved } from "@/contexts/SavedContext";
import { toast } from "sonner";

export default function Jobs() {
  const { jobs, totalJobs, currentPage, totalPages, loading, fetchJobs } = useJobs();
  const { user } = useAuth();
  const { isJobSaved, toggleSaveJob } = useSaved();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchJobs({
      search: search || undefined,
      country: countryFilter !== "all" ? countryFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      page,
      limit: 10,
    });
  }, [search, countryFilter, categoryFilter, page, fetchJobs]);

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Find Your Next Role</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and filter job opportunities.
          {totalJobs > 0 && <span className="ml-2 text-sm">({totalJobs} jobs found)</span>}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies…"
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
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job, i) => (
            <ScrollReveal key={job.id} delay={i * 60}>
              <Card className="glass transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  {job.company?.logoUrl ? (
                    <img src={job.company.logoUrl} alt={job.company.companyName} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {(job.company?.companyName || "??").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company?.companyName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[job.city, job.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {job.category && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />{job.category}
                        </span>
                      )}
                      {job.status && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          job.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
                        }`}>
                          {job.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {user?.role === "JOB_SEEKER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={isJobSaved(job.id) ? "text-accent" : "text-muted-foreground hover:text-accent"}
                        onClick={(e) => { e.preventDefault(); handleSave(job.id); }}
                      >
                        <Bookmark className={`h-4 w-4 ${isJobSaved(job.id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                    <Link to={`/jobs/${job.id}`}>
                      <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
          {jobs.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No jobs match your search. Try different keywords.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
