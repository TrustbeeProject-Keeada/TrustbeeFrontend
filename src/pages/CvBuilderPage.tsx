import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import {
  User, Briefcase, PenTool, ChevronUp, ChevronDown, Settings,
  Plus, Trash2, Camera, ChevronRight, ChevronLeft, Loader2, GraduationCap,
  Heart, MessageSquare, Wrench, FileText,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────── */
interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  photo: string | null;
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
  description: string;
}

interface CvData {
  personal: PersonalDetails;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  languages: string[];
  interests: string;
  references: string;
}

const uid = () => crypto.randomUUID();

const initialData: CvData = {
  personal: { firstName: "", lastName: "", email: "", phone: "", address: "", postalCode: "", city: "", photo: null },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  interests: "",
  references: "",
};

/* ── Steps ──────────────────────────────────────────── */
const steps = [
  { key: "personal", label: "Personal", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "template", label: "Template", icon: PenTool },
] as const;

type StepKey = (typeof steps)[number]["key"];

/* ── Collapsible Section ────────────────────────────── */
function Section({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 font-semibold text-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <Settings className="h-4 w-4" />
        </span>
      </button>
      {open && <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>}
    </Card>
  );
}

/* ── PDF generator ──────────────────────────────────── */
function generatePdf(data: CvData): string {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = () => { if (y > 270) { doc.addPage(); y = 20; } };
  const addSection = (title: string, content: string) => {
    if (!content.trim()) return;
    checkPage();
    doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(title, 14, y); y += 2;
    doc.setDrawColor(180); doc.line(14, y, w - 14, y); y += 6;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(content, w - 28);
    for (const l of lines) { checkPage(); doc.text(l, 14, y); y += 5; }
    y += 4;
  };

  const fullName = `${data.personal.firstName} ${data.personal.lastName}`.trim() || "Your Name";
  doc.setFontSize(22); doc.setFont("helvetica", "bold");
  doc.text(fullName, w / 2, y, { align: "center" }); y += 8;
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  const contact = [data.personal.email, data.personal.phone, data.personal.city].filter(Boolean).join("  •  ");
  doc.text(contact, w / 2, y, { align: "center" }); y += 10;
  doc.setDrawColor(60); doc.setLineWidth(0.5); doc.line(14, y, w - 14, y); y += 8;

  addSection("Professional Summary", data.summary);
  for (const exp of data.experience) {
    addSection(exp.company ? `${exp.role} — ${exp.company}` : exp.role, `${exp.startDate} – ${exp.endDate}\n${exp.description}`);
  }
  for (const edu of data.education) {
    addSection(edu.school ? `${edu.degree} — ${edu.school}` : edu.degree, `${edu.startDate} – ${edu.endDate}\n${edu.description}`);
  }
  if (data.skills.length) addSection("Skills", data.skills.join(", "));
  if (data.languages.length) addSection("Languages", data.languages.join(", "));
  addSection("Interests", data.interests);
  addSection("References", data.references);

  return doc.output("datauristring");
}

/* ── Main Page ──────────────────────────────────────── */
export default function CvBuilderPage() {
  const [step, setStep] = useState<StepKey>("personal");
  const [data, setData] = useState<CvData>(initialData);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const updatePersonal = (field: keyof PersonalDetails, value: string) =>
    setData((p) => ({ ...p, personal: { ...p.personal, [field]: value } }));

  const addExperience = () =>
    setData((p) => ({ ...p, experience: [...p.experience, { id: uid(), company: "", role: "", startDate: "", endDate: "", description: "" }] }));

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) =>
    setData((p) => ({ ...p, experience: p.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));

  const removeExperience = (id: string) =>
    setData((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) }));

  const addEducation = () =>
    setData((p) => ({ ...p, education: [...p.education, { id: uid(), school: "", degree: "", startDate: "", endDate: "", description: "" }] }));

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) =>
    setData((p) => ({ ...p, education: p.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));

  const removeEducation = (id: string) =>
    setData((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) setData((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
  };

  const addLanguage = () => {
    const l = langInput.trim();
    if (l && !data.languages.includes(l)) setData((p) => ({ ...p, languages: [...p.languages, l] }));
    setLangInput("");
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((p) => ({ ...p, personal: { ...p.personal, photo: reader.result as string } }));
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!data.personal.firstName.trim() || !data.personal.email.trim()) {
      toast({ title: "Missing info", description: "Please fill in at least your first name and email.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const base64 = generatePdf(data);
      const link = document.createElement("a");
      link.href = base64;
      link.download = `${data.personal.firstName}_${data.personal.lastName}_CV.pdf`.replace(/\s+/g, "_");
      link.click();
      if (user) {
        await api.updateJobSeeker(user.id, { cv: base64 });
      }
      toast({ title: "CV Created!", description: "Your CV has been generated and downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to generate CV.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = steps.findIndex((s) => s.key === step);
  const canNext = stepIndex < steps.length - 1;
  const canPrev = stepIndex > 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header banner */}
      <div className="bg-primary py-8 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-2xl font-bold md:text-3xl">
            {step === "personal" ? "Personal Details" : step === "experience" ? "My Experience" : "Choose Template"}
          </h1>

          {/* Stepper */}
          <div className="mt-6 flex items-center justify-center gap-0">
            {steps.map((s, i) => {
              const active = i <= stepIndex;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <button
                    onClick={() => setStep(s.key)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${active ? "border-primary-foreground bg-primary-foreground text-primary" : "border-primary-foreground/40 text-primary-foreground/40"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-medium ${active ? "text-primary-foreground" : "text-primary-foreground/40"}`}>{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 h-0.5 w-16 md:w-24 ${i < stepIndex ? "bg-primary-foreground" : "bg-primary-foreground/30"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {step === "personal" && (
          <ScrollReveal>
            <Card className="border shadow-sm">
              <CardContent className="p-5 md:p-8 space-y-5">
                <h2 className="font-semibold text-base">Personal Details</h2>
                <div className="h-px bg-border" />

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo upload */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 transition-colors"
                  >
                    {data.personal.photo ? (
                      <img src={data.personal.photo} alt="Photo" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-xs">Add photo</span>
                      </>
                    )}
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">First Name *</Label>
                      <Input value={data.personal.firstName} onChange={(e) => updatePersonal("firstName", e.target.value)} placeholder="John" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Last Name *</Label>
                      <Input value={data.personal.lastName} onChange={(e) => updatePersonal("lastName", e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email *</Label>
                    <Input type="email" value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+46 70 123 4567" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input value={data.personal.address} onChange={(e) => updatePersonal("address", e.target.value)} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Postal Code</Label>
                    <Input value={data.personal.postalCode} onChange={(e) => updatePersonal("postalCode", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input value={data.personal.city} onChange={(e) => updatePersonal("city", e.target.value)} placeholder="e.g. Stockholm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {step === "experience" && (
          <>
            {/* Profile / Summary */}
            <ScrollReveal>
              <Section icon={User} title="Profile" defaultOpen>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  value={data.summary}
                  onChange={(e) => setData((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="Brief overview of your professional background..."
                  rows={4}
                  className="mt-1.5"
                />
              </Section>
            </ScrollReveal>

            {/* Work Experience */}
            <ScrollReveal delay={40}>
              <Section icon={Briefcase} title="Work Experience" defaultOpen={data.experience.length > 0}>
                <div className="space-y-4">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="rounded-lg border p-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Company</Label><Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Role</Label><Input value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Start Date</Label><Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">End Date</Label><Input type="month" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Present" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs text-muted-foreground">Description</Label><Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} rows={3} /></div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addExperience} className="w-full">
                    <Plus className="mr-1.5 h-4 w-4" /> Add Experience
                  </Button>
                </div>
              </Section>
            </ScrollReveal>

            {/* Education */}
            <ScrollReveal delay={80}>
              <Section icon={GraduationCap} title="Education & Qualifications">
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="rounded-lg border p-4 space-y-3 relative">
                      <button type="button" onClick={() => removeEducation(edu.id)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">School</Label><Input value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Start Date</Label><Input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">End Date</Label><Input type="month" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs text-muted-foreground">Description</Label><Textarea value={edu.description} onChange={(e) => updateEducation(edu.id, "description", e.target.value)} rows={2} /></div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                    <Plus className="mr-1.5 h-4 w-4" /> Add Education
                  </Button>
                </div>
              </Section>
            </ScrollReveal>

            {/* Interests */}
            <ScrollReveal delay={120}>
              <Section icon={Heart} title="Interests">
                <Textarea
                  value={data.interests}
                  onChange={(e) => setData((p) => ({ ...p, interests: e.target.value }))}
                  placeholder="Hobbies, volunteering, etc."
                  rows={2}
                />
              </Section>
            </ScrollReveal>

            {/* References */}
            <ScrollReveal delay={160}>
              <Section icon={MessageSquare} title="References">
                <Textarea
                  value={data.references}
                  onChange={(e) => setData((p) => ({ ...p, references: e.target.value }))}
                  placeholder="Available upon request"
                  rows={2}
                />
              </Section>
            </ScrollReveal>

            {/* Skills */}
            <ScrollReveal delay={200}>
              <Section icon={Wrench} title="Skills">
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {s}
                      <button type="button" onClick={() => setData((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                  <Button variant="outline" size="sm" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                </div>
              </Section>
            </ScrollReveal>

            {/* Languages */}
            <ScrollReveal delay={240}>
              <Section icon={FileText} title="Languages">
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.languages.map((l) => (
                    <span key={l} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium">
                      {l}
                      <button type="button" onClick={() => setData((p) => ({ ...p, languages: p.languages.filter((x) => x !== l) }))} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="Add a language…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())} />
                  <Button variant="outline" size="sm" onClick={addLanguage}><Plus className="h-4 w-4" /></Button>
                </div>
              </Section>
            </ScrollReveal>
          </>
        )}

        {step === "template" && (
          <ScrollReveal>
            <Card className="border shadow-sm">
              <CardContent className="p-5 md:p-8 space-y-6 text-center">
                <h2 className="font-semibold text-lg">Preview & Generate</h2>
                <p className="text-sm text-muted-foreground">
                  Review your details and generate your CV as a downloadable PDF.
                </p>

                {/* Summary preview */}
                <div className="mx-auto max-w-md text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{data.personal.firstName} {data.personal.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{data.personal.email}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{data.experience.length} entries</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Education</span>
                    <span className="font-medium">{data.education.length} entries</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Skills</span>
                    <span className="font-medium">{data.skills.length}</span>
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={saving} size="lg" className="mt-4">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Generate & Download CV
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-10">
          {canNext && (
            <Button onClick={() => setStep(steps[stepIndex + 1].key)} size="lg" className="w-full max-w-sm">
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {canPrev && (
            <button
              onClick={() => setStep(steps[stepIndex - 1].key)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
