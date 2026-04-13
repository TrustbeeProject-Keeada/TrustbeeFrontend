import { useState, useEffect } from "react";
import { Eye, Bookmark, Send, Building2, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import { CvBuilder } from "@/components/CvBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface DashboardData {
  profileViews?: number;
  bookmarkedJobs?: number;
  applicationsSent?: number;
  savedCompanies?: number;
  recentActivity?: { text: string; time: string }[];
  [key: string]: unknown;
}

const defaultStats = [
  { label: "Profile Views", value: "—", icon: Eye, trend: "" },
  { label: "Bookmarked Jobs", value: "—", icon: Bookmark, trend: "" },
  { label: "Applications Sent", value: "—", icon: Send, trend: "" },
  { label: "Saved Companies", value: "—", icon: Building2, trend: "" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "JOB_SEEKER") return;
    setLoading(true);
    api.getJobSeekerDashboard(user.id)
      .then((res) => setDashData(res.data as DashboardData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const stats = dashData
    ? [
        { label: "Profile Views", value: String(dashData.profileViews ?? 0), icon: Eye, trend: "" },
        { label: "Bookmarked Jobs", value: String(dashData.bookmarkedJobs ?? 0), icon: Bookmark, trend: "" },
        { label: "Applications Sent", value: String(dashData.applicationsSent ?? 0), icon: Send, trend: "" },
        { label: "Saved Companies", value: String(dashData.savedCompanies ?? 0), icon: Building2, trend: "" },
      ]
    : defaultStats;

  const recentActivity = dashData?.recentActivity || [];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back{user?.firstName ? `, ${user.firstName}` : user?.companyName ? `, ${user.companyName}` : ""}! Here's your activity overview.
        </p>
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
                <div className="text-2xl font-bold">{loading ? "…" : s.value}</div>
                {s.trend && (
                  <p className="mt-0.5 flex items-center text-xs text-accent">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {s.trend}
                  </p>
                )}
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
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity to show.</p>
              ) : (
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
              )}
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
              {user?.role === "COMPANY_RECRUITER" && (
                <Link to="/create-job"><Button variant="outline" size="sm">Post a Job</Button></Link>
              )}
              <Link to="/profile"><Button variant="outline" size="sm">Edit Profile</Button></Link>
              <Link to="/messages"><Button variant="outline" size="sm">Messages</Button></Link>
              <Link to="/ai-assistant"><Button variant="outline" size="sm">AI Assistant</Button></Link>
              {user?.role === "JOB_SEEKER" && <CvBuilder />}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
