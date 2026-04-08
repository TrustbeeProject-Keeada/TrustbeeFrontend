import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";

export default function CreateJob() {
  const { createJob } = useJobs();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [webpageUrl, setWebpageUrl] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !expiresAt) {
      toast.error("Please fill in title, description, and expiry date");
      return;
    }
    if (description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    setLoading(true);
    try {
      await createJob({
        title,
        description,
        expiresAt: new Date(expiresAt).toISOString(),
        webpage_url: webpageUrl || undefined,
        country: country || undefined,
        city: city || undefined,
        category: category || undefined,
      });
      toast.success("Job published!");
      navigate("/manage-jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create job");
    } finally {
      setLoading(false);
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
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input placeholder="e.g., Senior Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description * (min 10 chars)</Label>
                <Textarea placeholder="Describe the role, responsibilities, and team…" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Webpage URL</Label>
                <Input type="url" placeholder="https://company.com/careers/role" value={webpageUrl} onChange={(e) => setWebpageUrl(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input placeholder="Sweden" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="Stockholm" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
                {loading ? "Publishing…" : "Publish Job"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
