import { useState } from "react";
import { Bookmark, Building2, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useSaved } from "@/contexts/SavedContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const tabs = [
  { key: "jobs", label: "Saved Jobs", icon: Bookmark },
  { key: "companies", label: "Companies", icon: Building2 },
] as const;

export default function Saved() {
  const [tab, setTab] = useState<"jobs" | "companies">("jobs");
  const { savedJobs, savedCompanies, loadingSaved, toggleSaveJob, removeCompany } = useSaved();

  const handleRemoveJob = async (jobId: number) => {
    try {
      await toggleSaveJob(jobId);
      toast.success("Job removed from saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  };

  const handleRemoveCompany = async (companyId: number) => {
    try {
      await removeCompany(companyId);
      toast.success("Company removed from saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Saved Items</h1>
        <p className="mt-1 text-muted-foreground">Your bookmarked jobs and companies.</p>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {loadingSaved ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : (
        <div className="mt-6 space-y-3">
          {tab === "jobs" && savedJobs.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No saved jobs yet. Bookmark jobs to see them here.</div>
          )}
          {tab === "jobs" && savedJobs.map((entry, i) => (
            <ScrollReveal key={entry.id} delay={i * 60}>
              <Card className="glass">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {(entry.job?.company?.companyName || "??").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${entry.job?.id}`} className="font-semibold text-sm hover:underline">{entry.job?.title}</Link>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{entry.job?.company?.companyName}</span>
                      {(entry.job?.city || entry.job?.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[entry.job?.city, entry.job?.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Saved {new Date(entry.savedAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveJob(Number(entry.job?.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}

          {tab === "companies" && savedCompanies.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No saved companies yet.</div>
          )}
          {tab === "companies" && savedCompanies.map((entry, i) => (
            <ScrollReveal key={entry.id} delay={i * 60}>
              <Card className="glass">
                <CardContent className="flex items-center gap-4 p-4">
                  {entry.company?.logoUrl ? (
                    <img src={entry.company.logoUrl} alt={entry.company.companyName} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent">
                      {(entry.company?.companyName || "??").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{entry.company?.companyName}</h3>
                    {entry.company?.description && (
                      <p className="text-xs text-muted-foreground truncate">{entry.company.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">Saved {new Date(entry.savedAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveCompany(entry.company?.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
