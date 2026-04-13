import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  Bookmark,
  Send,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useSaved } from "@/contexts/SavedContext";
import { api, type Job } from "@/lib/api";
import { toast } from "sonner";
import EvaluationWheel from "@/components/EvaluationWheel";

export default function JobDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isJobSaved, toggleSaveJob } = useSaved();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Get the source from query parameters
    const source = searchParams.get("source") as "trustbee" | "job_bank" | null;
    api
      .getJob(id, source || undefined)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  const handleApply = async () => {
    if (!job) return;

    // If job is from job_bank and has a webpage_url, redirect to it
    if (job.source === "job_bank" && job.webpage_url) {
      window.open(job.webpage_url, "_blank");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setApplying(true);
    try {
      await api.applyToJob(job.id);
      toast.success("Application submitted!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply";
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/jobs")}
        >
          Back to jobs
        </Button>
      </div>
    );
  }

  const location = [job.city, job.country].filter(Boolean).join(", ");

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <Card className="glass">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {job.company?.logoUrl ? (
                  <img
                    src={job.company.logoUrl}
                    alt={job.company.companyName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {(job.company?.companyName || "??")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <p className="mt-1 text-muted-foreground">
                    {job.company?.companyName}
                  </p>
                </div>
              </div>
              {user?.role === "JOB_SEEKER" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={isJobSaved(job.id) ? "text-accent" : ""}
                  onClick={() => toggleSaveJob(job.id)}
                >
                  <Bookmark
                    className={`h-5 w-5 ${isJobSaved(job.id) ? "fill-current" : ""}`}
                  />
                </Button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
              {job.category && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.category}
                </span>
              )}
              {job.expiresAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expires {new Date(job.expiresAt).toLocaleDateString()}
                </span>
              )}
              {job.status && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    job.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {job.status}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {typeof job.description === "string"
                  ? job.description
                  : (job.description as Record<string, string>).text ||
                    (job.description as Record<string, string>)
                      .text_formatted ||
                    "No description available"}
              </p>
            </div>

            {job.webpage_url && (
              <a
                href={job.webpage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> View original listing
              </a>
            )}

            <div className="flex gap-3 pt-2">
              {user?.role === "JOB_SEEKER" && (
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform gap-2"
                >
                  <Send className="h-4 w-4" />{" "}
                  {applying ? "Applying…" : "Apply Now"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/messages")}
                className="active:scale-[0.97] transition-transform"
              >
                Message Employer
              </Button>
              {user?.role === "JOB_SEEKER" && job && (
                <EvaluationWheel jobId={job.id} />
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
