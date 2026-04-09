import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import jsPDF from "jspdf";

interface CvFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  languages: string;
  references: string;
}

const initial: CvFormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  experience: "",
  education: "",
  skills: "",
  languages: "",
  references: "",
};

function generateCvPdfBase64(data: CvFormData): string {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  const addSection = (title: string, content: string) => {
    if (!content.trim()) return;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, y);
    y += 2;
    doc.setDrawColor(180);
    doc.line(14, y, w - 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(content, w - 28);
    for (const line of lines) {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 5;
    }
    y += 4;
  };

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.fullName || "Your Name", w / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const contact = [data.email, data.phone, data.address].filter(Boolean).join("  •  ");
  doc.text(contact, w / 2, y, { align: "center" });
  y += 10;
  doc.setDrawColor(60);
  doc.setLineWidth(0.5);
  doc.line(14, y, w - 14, y);
  y += 8;

  addSection("Professional Summary", data.summary);
  addSection("Work Experience", data.experience);
  addSection("Education", data.education);
  addSection("Skills", data.skills);
  addSection("Languages", data.languages);
  addSection("References", data.references);

  return doc.output("datauristring");
}

export function CvBuilder() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CvFormData>(initial);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const update = (field: keyof CvFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({ title: "Missing info", description: "Please fill in at least your name and email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const base64 = generateCvPdfBase64(form);
      // Also trigger a download for the user
      const link = document.createElement("a");
      link.href = base64;
      link.download = `${form.fullName.replace(/\s+/g, "_")}_CV.pdf`;
      link.click();
      // Send CV to backend via jobseeker profile update
      if (user) {
        await api.updateJobSeeker(user.id, { cv: base64 });
      }
      toast({ title: "CV Created!", description: "Your CV has been generated and saved to your profile." });
      setOpen(false);
      setForm(initial);
    } catch {
      toast({ title: "Error", description: "Failed to generate CV.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-1.5 h-4 w-4" /> Create CV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your CV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+46 70 123 4567" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Stockholm, Sweden" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Professional Summary</Label>
            <Textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Brief overview of your professional background..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Work Experience</Label>
            <Textarea value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="Company — Role — Duration&#10;Description of responsibilities..." rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label>Education</Label>
            <Textarea value={form.education} onChange={(e) => update("education", e.target.value)} placeholder="University — Degree — Year" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <Textarea value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, TypeScript, Node.js..." rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Languages</Label>
              <Input value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="English, Swedish" />
            </div>
            <div className="space-y-1.5">
              <Label>References</Label>
              <Input value={form.references} onChange={(e) => update("references", e.target.value)} placeholder="Available upon request" />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate & Send CV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
