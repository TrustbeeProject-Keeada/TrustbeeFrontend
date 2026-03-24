import { Eye, Bookmark, Send, Building2, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";

const stats = [
  { label: "Profile Views", value: "128", icon: Eye, trend: "+12%" },
  { label: "Bookmarked Jobs", value: "23", icon: Bookmark, trend: "+3" },
  { label: "Applications Sent", value: "14", icon: Send, trend: "+5" },
  { label: "Saved Companies", value: "7", icon: Building2, trend: "+2" },
];

const recentActivity = [
  { text: "Applied to Senior Developer at Volvo", time: "2h ago" },
  { text: "Profile viewed by Spotify recruiter", time: "5h ago" },
  { text: "Bookmarked UX Designer role at Klarna", time: "1d ago" },
  { text: "Message from H&M HR team", time: "2d ago" },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back! Here's your activity overview.</p>
      </ScrollReveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 70}>
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="mt-0.5 flex items-center text-xs text-accent">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {s.trend}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ScrollReveal delay={100}>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recentActivity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p>{a.text}</p>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link to="/jobs"><Button variant="outline" size="sm">Browse Jobs</Button></Link>
              <Link to="/create-job"><Button variant="outline" size="sm">Post a Job</Button></Link>
              <Link to="/profile"><Button variant="outline" size="sm">Edit Profile</Button></Link>
              <Link to="/messages"><Button variant="outline" size="sm">Messages</Button></Link>
              <Link to="/ai-assistant"><Button variant="outline" size="sm">AI Assistant</Button></Link>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
