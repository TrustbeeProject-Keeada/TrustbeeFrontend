import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Props {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

const uid = () => crypto.randomUUID();

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [y, m] = value ? value.split("-") : ["", ""];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i));
  return (
    <div className="flex gap-1.5">
      <select
        value={m ?? ""}
        onChange={(e) => onChange(`${y || currentYear}-${e.target.value}`)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">{placeholder} month</option>
        {MONTHS.map((mn, i) => (
          <option key={mn} value={String(i + 1).padStart(2, "0")}>{mn}</option>
        ))}
      </select>
      <select
        value={y ?? ""}
        onChange={(e) => onChange(`${e.target.value}-${m || "01"}`)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={yr}>{yr}</option>
        ))}
      </select>
    </div>
  );
}

export function CvOnboardingStep({ userId, firstName, lastName, email, phone }: Props) {
  const navigate = useNavigate();

  const [summary, setSummary] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [showExp, setShowExp] = useState(false);
  const [showEdu, setShowEdu] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s));

  const addLang = () => {
    const l = langInput.trim();
    if (l && !languages.includes(l)) setLanguages((p) => [...p, l]);
    setLangInput("");
  };

  const removeLang = (l: string) => setLanguages((p) => p.filter((x) => x !== l));

  const addExp = () =>
    setExperience((p) => [
      ...p,
      { id: uid(), company: "", role: "", startDate: "", endDate: "", description: "" },
    ]);

  const updateExp = (id: string, field: keyof ExperienceEntry, val: string) =>
    setExperience((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const removeExp = (id: string) =>
    setExperience((p) => p.filter((e) => e.id !== id));

  const addEdu = () =>
    setEducation((p) => [
      ...p,
      { id: uid(), school: "", degree: "", startDate: "", endDate: "" },
    ]);

  const updateEdu = (id: string, field: keyof EducationEntry, val: string) =>
    setEducation((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));

  const removeEdu = (id: string) =>
    setEducation((p) => p.filter((e) => e.id !== id));

  const handleGenerate = async () => {
    if (!skills.length) {
      toast.error("Please add at least one skill before generating your CV.");
      return;
    }
    setGenerating(true);
    try {
      const formSnapshot = {
        personal: { firstName, lastName, email, phone: phone ?? "" },
        summary,
        skills,
        languages,
        experience,
        education,
        interests: "",
      };
      const { pdfBase64 } = await api.generateCvPdf(userId, { formSnapshot });
      const link = document.createElement("a");
      link.href = pdfBase64;
      link.download = `CV_${firstName}_${lastName}.pdf`;
      link.click();
      toast.success("Your CV has been generated and downloaded!");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate CV. You can try again from your dashboard.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSkip = () => {
    setSkipping(true);
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" />
          Step 2 of 2 — Create your CV
        </div>
        <h2 className="text-2xl font-bold">Let AI build your CV</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Fill in a few details and our AI will generate a professional, polished CV PDF — ready to download in seconds.
        </p>
      </div>

      {/* Profile summary */}
      <Card className="border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">About you</Label>
            <p className="text-xs text-muted-foreground">Write freely about your background, what you do and what you're looking for. The AI will turn it into a compelling professional summary.</p>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. I'm a customer service professional with 3 years of experience in retail. I'm passionate about helping people and looking for a role where I can grow into a team lead position..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Skills <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">Add skills that represent you — tools, technologies, soft skills, anything relevant.</p>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive ml-0.5">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. Customer Service, Excel, Swedish, Teamwork…"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Languages</Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
              {languages.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium"
                >
                  {l}
                  <button type="button" onClick={() => removeLang(l)} className="hover:text-destructive ml-0.5">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                placeholder="e.g. Swedish, English, Arabic…"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLang(); } }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addLang}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience (collapsible) */}
      <Card className="border shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => setShowExp(!showExp)}
        >
          <span className="font-semibold text-sm">Work Experience <span className="text-muted-foreground font-normal">(optional)</span></span>
          {showExp ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showExp && (
          <CardContent className="px-5 pb-5 pt-0 space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="rounded-lg border p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeExp(exp.id)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Company</Label>
                    <Input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} placeholder="Company name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Role / Title</Label>
                    <Input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)} placeholder="Job title" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <MonthYearPicker value={exp.startDate} onChange={(v) => updateExp(exp.id, "startDate", v)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End Date (leave blank if current)</Label>
                    <MonthYearPicker value={exp.endDate} onChange={(v) => updateExp(exp.id, "endDate", v)} placeholder="Present" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">What did you do? (brief)</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                    placeholder="Briefly describe your main tasks and achievements…"
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addExp} className="w-full">
              <Plus className="mr-1.5 h-4 w-4" /> Add Work Experience
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Education (collapsible) */}
      <Card className="border shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => setShowEdu(!showEdu)}
        >
          <span className="font-semibold text-sm">Education <span className="text-muted-foreground font-normal">(optional)</span></span>
          {showEdu ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showEdu && (
          <CardContent className="px-5 pb-5 pt-0 space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="rounded-lg border p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeEdu(edu.id)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">School / University</Label>
                    <Input value={edu.school} onChange={(e) => updateEdu(edu.id, "school", e.target.value)} placeholder="e.g. Stockholm University" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Degree / Program</Label>
                    <Input value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} placeholder="e.g. Bachelor in Business" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <MonthYearPicker value={edu.startDate} onChange={(v) => updateEdu(edu.id, "startDate", v)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <MonthYearPicker value={edu.endDate} onChange={(v) => updateEdu(edu.id, "endDate", v)} />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEdu} className="w-full">
              <Plus className="mr-1.5 h-4 w-4" /> Add Education
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="space-y-3 pb-10">
        <Button
          onClick={handleGenerate}
          disabled={generating || skipping}
          size="lg"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform gap-2 text-base py-6"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              AI is crafting your CV…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate & Download My CV
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={generating || skipping}
          className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {skipping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
          Skip for now — I'll create my CV later from the dashboard
        </button>
      </div>
    </div>
  );
}
