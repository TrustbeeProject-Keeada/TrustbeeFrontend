import { useState } from "react";
import { Camera, Briefcase, GraduationCap, Globe, FileText, Linkedin, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [status, setStatus] = useState(user?.status || "looking");
  const [experience, setExperience] = useState(user?.experience || "");
  const [education, setEducation] = useState(user?.education || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [saving, setSaving] = useState(false);

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: Replace updateProfile with your backend API call
      await updateProfile({
        firstName,
        lastName,
        phone,
        country,
        city,
        status,
        experience,
        education,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
      });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information and resume.</p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <Card className="glass mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {initials}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md hover:bg-accent/90 active:scale-95 transition-transform">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{firstName} {lastName}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-0.5 text-xs font-medium text-accent">
                  {status === "looking" ? "Looking for work" : status === "working" ? "Currently employed" : "Open to offers"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <ScrollReveal delay={120}>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Personal Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Last name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="looking">Looking for work</SelectItem>
                    <SelectItem value="working">Currently employed</SelectItem>
                    <SelectItem value="open">Open to offers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Experience & Education</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Work Experience</Label><Textarea placeholder="Describe your past roles…" rows={4} value={experience} onChange={(e) => setExperience(e.target.value)} /></div>
              <div className="space-y-2"><Label>Education / Degree</Label><Input placeholder="e.g., BSc Computer Science, KTH" value={education} onChange={(e) => setEducation(e.target.value)} /></div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Resume & Portfolio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload CV (PDF)</Label>
                {/* TODO: Wire to backend file upload: await fetch('/api/upload/cv', { method: 'POST', body: formData }) */}
                <Input type="file" accept=".pdf" />
              </div>
              <div className="space-y-2"><Label>Portfolio URL</Label><Input placeholder="https://myportfolio.com" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} /></div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={240}>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground shrink-0" /><Input placeholder="LinkedIn profile URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} /></div>
              <div className="space-y-2 flex items-center gap-2"><Github className="h-4 w-4 text-muted-foreground shrink-0" /><Input placeholder="GitHub profile URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} /></div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={280}>
          <Button type="submit" size="lg" disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </ScrollReveal>
      </form>
    </div>
  );
}
