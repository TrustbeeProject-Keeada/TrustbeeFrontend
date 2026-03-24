import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useJobs } from "@/contexts/JobContext";
import { useState } from "react";
import { toast } from "sonner";

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const job = getJob(id || "");

  const [title, setTitle] = useState(job?.title || "");
  const [company, setCompany] = useState(job?.company || "");
  const [description, setDescription] = useState(job?.description || "");
  const [requirements, setRequirements] = useState(job?.requirements || "");
  const [type, setType] = useState(job?.type || "");
  const [education, setEducation] = useState(job?.education || "");
  const [country, setCountry] = useState(job?.country || "");
  const [city, setCity] = useState(job?.city || "");
  const [salaryMin, setSalaryMin] = useState(job?.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(job?.salaryMax || "");

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/manage-jobs")}>Back to My Jobs</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateJob(job.id, {
        title, company, description, requirements, type, education,
        country, city, salaryMin, salaryMax,
        location: `${city}, ${country}`,
      });
      toast.success("Job updated successfully");
      navigate("/manage-jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to update job");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Edit Job</h1>
        <p className="mt-1 text-muted-foreground">Update your job listing details.</p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <Card className="glass mt-8">
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2"><Label>Job Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Company Name</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} /></div>
              <div className="space-y-2"><Label>Requirements</Label><Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="BSc">BSc</SelectItem>
                      <SelectItem value="MSc">MSc</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Salary Min</Label><Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} /></div>
                <div className="space-y-2"><Label>Salary Max</Label><Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} /></div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/manage-jobs")}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
