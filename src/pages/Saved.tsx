import { useState } from "react";
import { Bookmark, Building2, Send, MapPin, Briefcase, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";

const tabs = [
  { key: "jobs", label: "Saved Jobs", icon: Bookmark },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "applied", label: "Applied", icon: Send },
] as const;

const savedJobs = [
  { id: "1", title: "UX Designer", company: "Klarna", location: "Stockholm", type: "Full-time" },
  { id: "2", title: "DevOps Engineer", company: "King", location: "Malmö", type: "Full-time" },
];

const savedCompanies = [
  { id: "1", name: "Spotify", industry: "Music / Tech", jobs: 12 },
  { id: "2", name: "Klarna", industry: "Fintech", jobs: 8 },
];

const appliedJobs = [
  { id: "1", title: "Senior Frontend Developer", company: "Spotify", status: "Under review", date: "Mar 18" },
  { id: "2", title: "Backend Engineer", company: "Volvo", status: "Submitted", date: "Mar 15" },
];

export default function Saved() {
  const [tab, setTab] = useState<"jobs" | "companies" | "applied">("jobs");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Saved Items</h1>
        <p className="mt-1 text-muted-foreground">Your bookmarked jobs, companies, and applications.</p>
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

      <div className="mt-6 space-y-3">
        {tab === "jobs" && savedJobs.map((j, i) => (
          <ScrollReveal key={j.id} delay={i * 60}>
            <Card className="glass">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{j.company.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{j.title}</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{j.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.type}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}

        {tab === "companies" && savedCompanies.map((c, i) => (
          <ScrollReveal key={c.id} delay={i * 60}>
            <Card className="glass">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent">{c.name.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry} · {c.jobs} open positions</p>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}

        {tab === "applied" && appliedJobs.map((j, i) => (
          <ScrollReveal key={j.id} delay={i * 60}>
            <Card className="glass">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{j.company.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{j.title}</h3>
                  <p className="text-xs text-muted-foreground">{j.company} · Applied {j.date}</p>
                </div>
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">{j.status}</span>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
