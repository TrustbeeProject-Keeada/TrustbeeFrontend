import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useJobs } from "@/contexts/JobContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, type Job } from "@/lib/api";

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateJob } = useJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [webpageUrl, setWebpageUrl] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getJob(Number(id))
      .then((j) => {
        setJob(j);
        setTitle(j.title || "");
        setDescription(typeof j.description === "string" ? j.description : j.description?.text || "");
        setWebpageUrl(j.webpage_url || "");
        setCountry(j.country || "");
        setCity(j.city || "");
        setCategory(j.category || "");
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;

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
    setSaving(true);
    try {
      await updateJob(Number(job.id), {
        title, description,
        webpage_url: webpageUrl || undefined,
        country: country || undefined,
        city: city || undefined,
        category: category || undefined,
      });
      toast.success("Job updated successfully");
      navigate("/manage-jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to update job");
    } finally {
      setSaving(false);
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
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} /></div>
              <div className="space-y-2"><Label>Webpage URL</Label><Input type="url" value={webpageUrl} onChange={(e) => setWebpageUrl(e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/manage-jobs")}>Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
