import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Briefcase, GraduationCap, Calendar, ArrowLeft, Bookmark, Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { matchScoreDetailed } from "@/lib/matchmaker";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getJob } = useJobs();
  const job = getJob(id || "");
  const [showExplanation, setShowExplanation] = useState(false);

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

  // Calculate detailed match
  const hasCvData = !!(user?.cvText || user?.experience || user?.education);
  const matchResult = user ? matchScoreDetailed(user, job) : null;
  const score = matchResult?.score ?? 0;

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <Card className="glass">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <p className="mt-1 text-muted-foreground">{job.company}</p>
                </div>
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

      {/* Match score badge — bottom right corner */}
      {hasCvData && matchResult && score > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs">
          <div
            className={`rounded-2xl shadow-lg backdrop-blur-sm border transition-all cursor-pointer ${
              score >= 70
                ? "bg-green-500/90 text-white border-green-400/50"
                : score >= 40
                ? "bg-yellow-500/90 text-white border-yellow-400/50"
                : "bg-muted/90 text-foreground border-border"
            }`}
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <div className="flex items-center gap-2 px-5 py-3">
              <Sparkles className="h-5 w-5" />
              <div className="text-center">
                <div className="text-2xl font-bold leading-none">{score}%</div>
                <div className="text-xs opacity-90 mt-0.5">Match</div>
              </div>
              {showExplanation ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />}
            </div>
            {showExplanation && (
              <div className="px-4 pb-4 text-xs leading-relaxed opacity-95 border-t border-white/20 pt-3 mt-1">
                {matchResult.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
