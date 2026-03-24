import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Briefcase, GraduationCap, Calendar, ArrowLeft, Bookmark, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getJob } = useJobs();
  const job = getJob(id || "");

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  };

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/jobs")}>Back to jobs</Button>
      </div>
    );
  }

  const salary = job.salaryMin && job.salaryMax
    ? `€${Number(job.salaryMin).toLocaleString()}–€${Number(job.salaryMax).toLocaleString()}`
    : job.salaryMin ? `From €${Number(job.salaryMin).toLocaleString()}` : "";

  const requirements = job.requirements ? job.requirements.split("\n").filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <Card className="glass">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <p className="mt-1 text-muted-foreground">{job.company}</p>
              </div>
              <Button variant="ghost" size="icon"><Bookmark className="h-5 w-5" /></Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.type}</span>
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" />{job.education}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Posted {job.posted}</span>
            </div>
            {salary && <p className="mt-1 font-semibold text-accent">{salary}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            {requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="space-y-1.5">
                  {requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleProtectedAction} className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform gap-2">
                <Send className="h-4 w-4" /> Apply Now
              </Button>
              <Button variant="outline" onClick={handleProtectedAction} className="active:scale-[0.97] transition-transform">
                Message Employer
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
