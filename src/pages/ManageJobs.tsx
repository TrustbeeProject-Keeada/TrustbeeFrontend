import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, Archive, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ManageJobs() {
  const { user } = useAuth();
  const { jobs, loading, fetchJobs, deleteJob, updateJobStatus } = useJobs();

  useEffect(() => {
    if (user) {
      fetchJobs({ companyId: user.id });
    }
  }, [user, fetchJobs]);

  const handleDelete = async (id: number) => {
    try {
      await deleteJob(id);
      toast.success("Job deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus?: string) => {
    const newStatus = currentStatus === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    try {
      await updateJobStatus(id, newStatus);
      toast.success(`Job ${newStatus === "ARCHIVED" ? "archived" : "reactivated"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Job Listings</h1>
            <p className="mt-1 text-muted-foreground">Manage your posted jobs.</p>
          </div>
          <Link to="/create-job">
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" /> New Job</Button>
          </Link>
        </div>
      </ScrollReveal>
      <div className="mt-8 space-y-3">
        {loading && <div className="py-16 text-center text-muted-foreground">Loading…</div>}
        {!loading && jobs.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/create-job"><Button variant="outline" className="mt-4 gap-2"><Plus className="h-4 w-4" /> Post your first job</Button></Link>
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
                        job.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {job.status}
                      </span>
                    )}
                    {job.category && <span className="text-xs text-muted-foreground">{job.category}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link to={`/jobs/${job.id}`}><Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button></Link>
                  <Link to={`/edit-job/${job.id}`}><Button variant="ghost" size="icon" title="Edit"><Pencil className="h-4 w-4" /></Button></Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={job.status === "ARCHIVED" ? "Reactivate" : "Archive"}
                    onClick={() => handleToggleStatus(job.id, job.status)}
                  >
                    {job.status === "ARCHIVED" ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove "{job.title}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
  );
}
