import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Eye, Archive, RotateCcw, Users, CalendarCheck, Loader2, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { api, type Application } from "@/lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const STATUS_LABELS: Record<Application["status"], string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  ACCEPTED: "Interview booked",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<Application["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  REVIEWED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface ApplicationsPanelProps {
  jobId: number;
  jobTitle: string;
  onClose: () => void;
}

function ApplicationsPanel({ jobId, jobTitle, onClose }: ApplicationsPanelProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    api.getJobApplications(jobId)
      .then(setApplications)
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleBookInterview = async (applicationId: number) => {
    setBookingId(applicationId);
    try {
      const updated = await api.updateApplicationStatus(applicationId, "ACCEPTED");
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: updated.status } : a))
      );
      toast.success("Interview booked! Both you and the candidate have been notified by email.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to book interview");
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl border max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div>
            <h2 className="font-bold text-lg">Applications</h2>
            <p className="text-sm text-muted-foreground truncate max-w-xs">{jobTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && applications.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No applications yet for this job.
            </div>
          )}
          {!loading && applications.map((app) => (
            <div key={app.id} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(app.jobSeeker?.firstName?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {app.jobSeeker?.firstName} {app.jobSeeker?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{app.jobSeeker?.email}</p>
                    {app.jobSeeker?.phoneNumber && (
                      <p className="text-xs text-muted-foreground">{app.jobSeeker.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Applied {new Date(app.createdAt ?? "").toLocaleDateString()}
              </div>
              {app.status !== "ACCEPTED" && app.status !== "REJECTED" && (
                <Button
                  size="sm"
                  onClick={() => handleBookInterview(app.id)}
                  disabled={bookingId === app.id}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {bookingId === app.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarCheck className="h-3.5 w-3.5" />
                  )}
                  Book Interview
                </Button>
              )}
              {app.status === "ACCEPTED" && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                  Interview booked — both parties notified by email.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManageJobs() {
  const { user } = useAuth();
  const { jobs, loading, fetchJobs, deleteJob, updateJobStatus } = useJobs();
  const [applicationsJob, setApplicationsJob] = useState<{ id: number; title: string } | null>(null);

  const loadJobs = useCallback(() => {
    if (user) fetchJobs({ companyId: user.id });
  }, [user, fetchJobs]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (id: number) => {
    try {
      await deleteJob(id);
      toast.success("Job deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete job");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus?: string) => {
    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    try {
      await updateJobStatus(id, newStatus);
      toast.success(`Job ${newStatus === "ARCHIVED" ? "archived" : "reactivated"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Please log in</h1>
        <Link to="/login"><Button className="mt-4">Log in</Button></Link>
      </div>
    );
  }

  return (
    <>
      {applicationsJob && (
        <ApplicationsPanel
          jobId={applicationsJob.id}
          jobTitle={applicationsJob.title}
          onClose={() => setApplicationsJob(null)}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-10">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Job Listings</h1>
              <p className="mt-1 text-muted-foreground">Manage your posted jobs and view applicants.</p>
            </div>
            <Link to="/create-job">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" /> New Job
              </Button>
            </Link>
          </div>
        </ScrollReveal>
        <div className="mt-8 space-y-3">
          {loading && <div className="py-16 text-center text-muted-foreground">Loading…</div>}
          {!loading && jobs.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p>You haven't posted any jobs yet.</p>
              <Link to="/create-job">
                <Button variant="outline" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Post your first job
                </Button>
              </Link>
            </div>
          )}
          {jobs.map((job, i) => (
            <ScrollReveal key={job.id} delay={i * 60}>
              <Card className="glass transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {(job.company?.companyName || "??").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company?.companyName} · {[job.city, job.country].filter(Boolean).join(", ")}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {job.status && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          job.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {job.status}
                        </span>
                      )}
                      {job.category && <span className="text-xs text-muted-foreground">{job.category}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View applicants"
                      onClick={() => setApplicationsJob({ id: Number(job.id), title: job.title })}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Link to={`/jobs/${job.id}?source=trustbee`}>
                      <Button variant="ghost" size="icon" title="View listing"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Link to={`/edit-job/${job.id}`}>
                      <Button variant="ghost" size="icon" title="Edit"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={job.status === "ARCHIVED" ? "Reactivate" : "Archive"}
                      onClick={() => handleToggleStatus(Number(job.id), job.status)}
                    >
                      {job.status === "ARCHIVED" ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove "{job.title}".</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(Number(job.id))}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </>
  );
}
