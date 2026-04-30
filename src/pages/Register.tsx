import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import logo from "@/assets/trustbee-logo.png";

type RoleChoice = "JOB_SEEKER" | "COMPANY_RECRUITER";

export default function Register() {
  const { registerJobSeeker, registerCompanyRecruiter } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleChoice>("JOB_SEEKER");

  // Job seeker fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Company recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [newJobSeekerId, setNewJobSeekerId] = useState<number | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newJobSeekerId) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }

    setUploadingCv(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      await api.updateJobSeeker(newJobSeekerId, { cv: base64 });
      setCvUploaded(true);
      toast.success("CV uploaded and linked to your new account.");
    } catch {
      toast.error("Failed to upload CV. Please try again.");
    } finally {
      setUploadingCv(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const finishRegistration = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    setLoading(true);
    try {
      if (role === "JOB_SEEKER") {
        if (!firstName || !lastName) {
          toast.error("Please fill in first and last name");
          setLoading(false);
          return;
        }
        const registeredUser = await registerJobSeeker({
          firstName,
          lastName,
          email,
          password,
        });
        setNewJobSeekerId(registeredUser.id);
        setCvUploaded(false);
        setCurrentStep(2);
        toast.success("Account registered successfully. Step 1 of 2 complete.");
      } else {
        if (!companyName || !organizationNumber || !phoneNumber) {
          toast.error("Please fill in company name, org number, and phone");
          setLoading(false);
          return;
        }
        await registerCompanyRecruiter({
          email,
          password,
          companyName,
          organizationNumber: Number(organizationNumber),
          phoneNumber,
          description: description || undefined,
        });
        toast.success("Account created!");
        navigate("/manage-jobs");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Registration failed");
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <div className="glass w-full max-w-lg rounded-2xl p-8">
          {role === "JOB_SEEKER" && (
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span
                  className={
                    currentStep === 1 ? "text-foreground" : "text-emerald-600"
                  }
                >
                  Step 1: Register
                </span>
                <span
                  className={
                    currentStep === 2
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  Step 2: Add CV
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: currentStep === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>
          )}

          <div className="mb-6 text-center">
            <img
              src={logo}
              alt="TrustBee"
              className="mx-auto mb-4 h-14 w-14 rounded-xl"
            />
            <h1 className="text-2xl font-bold">
              {currentStep === 1
                ? "Create your account"
                : "Account registered successfully"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentStep === 1
                ? "Join TrustBee and start your journey"
                : "Step 2 of 2: Add your CV now, or skip and do it later from your profile."}
            </p>
          </div>
          {currentStep === 1 && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as RoleChoice)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JOB_SEEKER">Job Seeker</SelectItem>
                    <SelectItem value="COMPANY_RECRUITER">
                      Company / Recruiter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === "JOB_SEEKER" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Company name *</Label>
                    <Input
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Organization number *</Label>
                      <Input
                        type="number"
                        placeholder="5566778899"
                        value={organizationNumber}
                        onChange={(e) => setOrganizationNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone number *</Label>
                      <Input
                        type="tel"
                        placeholder="+46 70 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company description</Label>
                    <Input
                      placeholder="Brief description of your company"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
              >
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  Option A — Upload your own CV
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF only, up to 5MB.
                </p>
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
                  className="mt-3 w-full"
                  disabled={uploadingCv}
                  onClick={() => cvInputRef.current?.click()}
                >
                  {uploadingCv ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload PDF CV
                </Button>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  Option B — Create with CV Builder
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Build a fresh CV in guided steps and save it to your profile.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => navigate("/cv-builder")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Open CV Builder
                </Button>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={finishRegistration}
                >
                  Skip for now
                </Button>
                <Button type="button" onClick={finishRegistration}>
                  {cvUploaded && <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Continue to dashboard
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
