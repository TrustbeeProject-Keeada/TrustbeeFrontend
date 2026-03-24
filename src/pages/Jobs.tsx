import { useState } from "react";
import { Search, MapPin, Briefcase, GraduationCap, Bookmark, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";

export default function Jobs() {
  const { jobs } = useJobs();
  const [search, setSearch] = useState("");

  const filtered = jobs.filter(
    (j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Find Your Next Role</h1>
        <p className="mt-1 text-muted-foreground">Browse and filter job opportunities.</p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search jobs or companies…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select><SelectTrigger className="w-[140px]"><SelectValue placeholder="Job type" /></SelectTrigger><SelectContent><SelectItem value="full">Full-time</SelectItem><SelectItem value="part">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="remote">Remote</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="w-[140px]"><SelectValue placeholder="Country" /></SelectTrigger><SelectContent><SelectItem value="se">Sweden</SelectItem><SelectItem value="no">Norway</SelectItem><SelectItem value="dk">Denmark</SelectItem><SelectItem value="de">Germany</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="w-[140px]"><SelectValue placeholder="Education" /></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="bsc">BSc</SelectItem><SelectItem value="msc">MSc</SelectItem><SelectItem value="mba">MBA</SelectItem></SelectContent></Select>
        </div>
      </ScrollReveal>

      <div className="mt-8 space-y-3">
        {filtered.map((job, i) => (
          <ScrollReveal key={job.id} delay={i * 60}>
            <Card className="glass transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {job.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{job.education}</span>
                    <span>€{Number(job.salaryMin).toLocaleString()}–€{Number(job.salaryMax).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-xs text-muted-foreground sm:block">{job.posted}</span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent"><Bookmark className="h-4 w-4" /></Button>
                  <Link to={`/jobs/${job.id}`}>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">No jobs match your search. Try different keywords.</div>
        )}
      </div>
    </div>
  );
}
