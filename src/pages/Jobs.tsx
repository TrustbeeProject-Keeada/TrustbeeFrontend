import { useState, useMemo } from "react";
import { Search, MapPin, Briefcase, GraduationCap, Bookmark, ChevronRight, Sparkles, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { rankJobs } from "@/lib/matchmaker";
import { db } from "@/lib/api";
import { toast } from "sonner";

export default function Jobs() {
  const { jobs } = useJobs();
  const { user, updateProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [showMatches, setShowMatches] = useState(false);
  const [cvKey, setCvKey] = useState(0); // force re-rank after CV upload

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error("Please log in to use job matching.");
      return;
    }

    const text = await file.text();

    // Send CV to demo API
    db.uploadCv(user.id, text, file.name);

    // Update local profile with CV text
    updateProfile({ cvText: text });

    // Auto-enable matching
    setShowMatches(true);
    setCvKey((k) => k + 1);
    toast.success("CV uploaded! Job matches updated.");
  };

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || j.type === typeFilter;
      const matchesCountry = countryFilter === "all" || j.country === countryFilter;
      return matchesSearch && matchesType && matchesCountry;
    });
  }, [jobs, search, typeFilter, countryFilter]);

  const ranked = useMemo(() => {
    if (showMatches && user) return rankJobs(user, filtered);
    return filtered.map((job) => ({ job, score: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, showMatches, user, cvKey]);

  const hasCvData = !!(user?.cvText || user?.experience || user?.education);

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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Job type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="Sweden">Sweden</SelectItem>
              <SelectItem value="Norway">Norway</SelectItem>
              <SelectItem value="Denmark">Denmark</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ScrollReveal>

      {/* Matchmaking controls */}
      <ScrollReveal delay={100}>
        <Card className="glass mt-4">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">AI Job Matching</span>
            <span className="text-xs text-muted-foreground">Upload your CV or fill your profile to see match scores</span>
            <div className="ml-auto flex items-center gap-2">
              <label className="cursor-pointer">
                <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleCvUpload} />
                <Button variant="outline" size="sm" className="gap-1.5 pointer-events-none" asChild>
                  <span><Upload className="h-3.5 w-3.5" /> Upload CV</span>
                </Button>
              </label>
              {hasCvData && (
                <Button
                  size="sm"
                  variant={showMatches ? "default" : "outline"}
                  onClick={() => setShowMatches(!showMatches)}
                  className={showMatches ? "bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5" : "gap-1.5"}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {showMatches ? "Matching ON" : "Show Matches"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <div className="mt-6 space-y-3">
        {ranked.map(({ job, score }, i) => (
          <ScrollReveal key={job.id} delay={i * 60}>
            <Card className="glass transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    {showMatches && score > 0 && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        score >= 70 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : score >= 40 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                      }`}>
                        {score}% match
                      </span>
                    )}
                  </div>
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
        {ranked.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">No jobs match your search. Try different keywords.</div>
        )}
      </div>
    </div>
  );
}
