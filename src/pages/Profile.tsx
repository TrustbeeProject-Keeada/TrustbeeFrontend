import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Briefcase,
  GraduationCap,
  Globe,
  Upload,
  FileText,
  Download,
  Loader2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CvBuilder } from "@/components/CvBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const isRecruiter = user?.role === "COMPANY_RECRUITER";

  // User is already loaded from AuthContext on app mount, no need to refresh here
  // Fetching happens in AuthProvider on app boot

  // Job seeker fields
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolioLink || "");
  const [skills, setSkills] = useState(user?.skills?.join(", ") || "");
  const [languages, setLanguages] = useState(user?.languages?.join(", ") || "");
  const [personalStatement, setPersonalStatement] = useState(
    user?.personalStatement || "",
  );

  // Company recruiter fields
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [description, setDescription] = useState(user?.description || "");
  const [industry, setIndustry] = useState(user?.industry || "");
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || "");

  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Sync form fields when user data updates (e.g. after fresh fetch)
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhoneNumber(user.phoneNumber || "");
    setCountry(user.country || "");
    setCity(user.city || "");
    setBio(user.bio || "");
    setPortfolioLink(user.portfolioLink || "");
    setSkills(user.skills?.join(", ") || "");
    setLanguages(user.languages?.join(", ") || "");
    setPersonalStatement(user.personalStatement || "");
    setCompanyName(user.companyName || "");
    setDescription(user.description || "");
    setIndustry(user.industry || "");
    setLogoUrl(user.logoUrl || "");
  }, [user]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setUploadingCv(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await api.updateJobSeeker(user.id, { cv: base64 });
        await refreshProfile();
        toast.success("CV uploaded successfully!");
        setUploadingCv(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file.");
        setUploadingCv(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload CV.");
      setUploadingCv(false);
    }
  };

  const handleDownloadCv = () => {
    if (!user?.cv) return;
    const link = document.createElement("a");
    link.href = user.cv;
    link.download = `${user.firstName || "my"}_cv.pdf`;
    link.click();
  };

  const initials = isRecruiter
    ? (companyName?.slice(0, 2) || "CO").toUpperCase()
    : `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isRecruiter) {
        await updateProfile({
          companyName,
          description,
          phoneNumber,
          city,
          country,
          industry,
          logoUrl,
        });
      } else {
        await updateProfile({
          firstName,
          lastName,
          phoneNumber,
          country,
          city,
          bio,
          portfolioLink,
          personalStatement,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          languages: languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
        });
      }
      toast.success("Profile updated!");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your personal information.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <Card className="glass mt-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                {user?.profilePicture || user?.logoUrl ? (
                  <img
                    src={user.profilePicture || user.logoUrl}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {initials}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md hover:bg-accent/90 active:scale-95 transition-transform">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold">
                  {isRecruiter ? companyName : `${firstName} ${lastName}`}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.phoneNumber && (
                  <p className="text-sm text-muted-foreground">
                    {user.phoneNumber}
                  </p>
                )}
                {(user?.city || user?.country) && (
                  <p className="text-sm text-muted-foreground">
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </p>
                )}
                <span className="mt-1 inline-block rounded-full bg-accent/15 px-3 py-0.5 text-xs font-medium text-accent">
                  {isRecruiter ? "Company Recruiter" : "Job Seeker"}
                </span>
              </div>
              {/* CV Preview button — only for job seekers with a CV */}
              {!isRecruiter && user?.cv && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setCvPreviewOpen(true)}
                >
                  <Eye className="h-4 w-4" /> Preview CV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* CV Preview Dialog */}
      <Dialog open={cvPreviewOpen} onOpenChange={setCvPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>CV Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {user?.cv && (
              <iframe
                src={user.cv}
                className="w-full h-full rounded border"
                title="CV Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        {isRecruiter ? (
          <>
            <ScrollReveal delay={120}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Company Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </>
        ) : (
          <>
            <ScrollReveal delay={120}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Personal Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First name</Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last name</Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> Skills & Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skills (comma-separated)</Label>
                    <Input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Languages (comma-separated)</Label>
                    <Input
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="English, Swedish"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Personal Statement</Label>
                    <Textarea
                      value={personalStatement}
                      onChange={(e) => setPersonalStatement(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Portfolio URL</Label>
                    <Input
                      type="url"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://myportfolio.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={240}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> CV / Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleCvUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingCv}
                      onClick={() => cvInputRef.current?.click()}
                    >
                      {uploadingCv ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-1.5 h-4 w-4" />
                      )}
                      Upload PDF
                    </Button>
                    <CvBuilder />
                    {user?.cv && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadCv}
                      >
                        <Download className="mr-1.5 h-4 w-4" /> Download CV
                      </Button>
                    )}
                  </div>
                  {user?.cv && (
                    <p className="text-xs text-muted-foreground">
                      ✓ CV on file
                    </p>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </>
        )}

        <ScrollReveal delay={240}>
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </ScrollReveal>
      </form>
    </div>
  );
}
