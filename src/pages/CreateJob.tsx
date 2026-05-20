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
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

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

  // AI helper state
  const [showAi, setShowAi] = useState(false);
  const [aiResponsibilities, setAiResponsibilities] = useState("");
  const [aiRequirements, setAiRequirements] = useState("");
  const [aiAdditional, setAiAdditional] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please fill in the Job Title first so the AI knows what role to describe.");
      return;
    }
    if (!aiResponsibilities.trim() || !aiRequirements.trim()) {
      toast.error("Please provide the key responsibilities and requirements.");
      return;
    }
    setAiLoading(true);
    try {
      const { description: generated } = await api.generateJobDescription({
        title,
        responsibilities: aiResponsibilities,
        requirements: aiRequirements,
        location: [city, country].filter(Boolean).join(", ") || undefined,
        additionalInfo: aiAdditional || undefined,
      });
      setDescription(generated);
      setShowAi(false);
      toast.success("Description generated! Review and edit as needed.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate description");
    } finally {
      setAiLoading(false);
    }
  };

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? (err as Error).message : "Failed to create job");
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
                <Input
                  placeholder="e.g., Senior Frontend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description with AI helper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Description * (min 10 chars)</Label>
                  <button
                    type="button"
                    onClick={() => setShowAi(!showAi)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Help
                    {showAi ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>

                {/* AI assistant panel */}
                {showAi && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Tell the AI what this role involves and it will write a professional job description for you. Make sure the Job Title above is filled in first.
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Key responsibilities *</Label>
                      <Textarea
                        value={aiResponsibilities}
                        onChange={(e) => setAiResponsibilities(e.target.value)}
                        placeholder="e.g. Build and maintain React frontend, collaborate with design team, code reviews, write unit tests…"
                        rows={3}
                        className="resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Requirements *</Label>
                      <Textarea
                        value={aiRequirements}
                        onChange={(e) => setAiRequirements(e.target.value)}
                        placeholder="e.g. 3+ years React experience, TypeScript, good communication skills, degree in CS or equivalent…"
                        rows={3}
                        className="resize-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Anything else to mention? (optional)</Label>
                      <Textarea
                        value={aiAdditional}
                        onChange={(e) => setAiAdditional(e.target.value)}
                        placeholder="e.g. Remote-friendly, startup culture, competitive benefits, visa sponsorship…"
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={aiLoading}
                      size="sm"
                      className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {aiLoading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" /> Generate Description</>
                      )}
                    </Button>
                  </div>
                )}

                <Textarea
                  placeholder="Describe the role, responsibilities, and team…"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Webpage URL</Label>
                <Input
                  type="url"
                  placeholder="https://company.com/careers/role"
                  value={webpageUrl}
                  onChange={(e) => setWebpageUrl(e.target.value)}
                />
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
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
              >
                {loading ? "Publishing…" : "Publish Job"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
