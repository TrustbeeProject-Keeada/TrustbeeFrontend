import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";

export default function CreateJob() {
  const { user } = useAuth();
  const { createJob } = useJobs();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [type, setType] = useState("");
  const [education, setEducation] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description) {
      toast.error("Please fill in title, company, and description");
      return;
    }
    try {
      await createJob({
        title,
        company,
        description,
        requirements,
        type: type || "Full-time",
        education: education || "Any",
        country,
        city,
        location: `${city}, ${country}`,
        salaryMin,
        salaryMax,
        employerId: user?.id || "",
      });
      toast.success("Job published!");
      navigate("/manage-jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create job");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Post a Job</h1>
        <p className="mt-1 text-muted-foreground">Create a new job listing for candidates to discover.</p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <Card className="glass mt-8">
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2"><Label>Job Title</Label><Input placeholder="e.g., Senior Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Company Name</Label><Input placeholder="Your company" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the role, responsibilities, and team…" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <div className="space-y-2"><Label>Requirements</Label><Textarea placeholder="List key requirements, one per line" rows={4} value={requirements} onChange={(e) => setRequirements(e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Remote">Remote</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={education} onValueChange={setEducation}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Any">Any</SelectItem><SelectItem value="BSc">BSc</SelectItem><SelectItem value="MSc">MSc</SelectItem><SelectItem value="MBA">MBA</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country</Label><Input placeholder="Sweden" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                <div className="space-y-2"><Label>City</Label><Input placeholder="Stockholm" value={city} onChange={(e) => setCity(e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Salary Min</Label><Input type="number" placeholder="50000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} /></div>
                <div className="space-y-2"><Label>Salary Max</Label><Input type="number" placeholder="80000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} /></div>
              </div>
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
                Publish Job
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
