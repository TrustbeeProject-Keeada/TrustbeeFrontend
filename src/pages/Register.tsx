import { useState } from "react";
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
import { toast } from "sonner";
import {
  isValidEmail,
  validatePassword,
  getPasswordErrorMessage,
} from "@/lib/validation";
import logo from "@/assets/trustbee-logo.png";
import { CvOnboardingStep } from "@/components/CvOnboardingStep";

type RoleChoice = "JOB_SEEKER" | "COMPANY_RECRUITER";

export default function Register() {
  const { registerJobSeeker, registerCompanyRecruiter, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleChoice>("JOB_SEEKER");

  // Job seeker fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobSeekerPhone, setJobSeekerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Company recruiter fields
  const [companyName, setCompanyName] = useState("");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  // After job seeker registration, move to CV step
  const [cvStep, setCvStep] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const validation = validatePassword(value);
      setPasswordError(getPasswordErrorMessage(validation));
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(getPasswordErrorMessage(passwordValidation));
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
        await registerJobSeeker({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: jobSeekerPhone || undefined,
        });
        toast.success("Account created! Now let's build your CV.");
        setCvStep(true);
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
          organizationNumber,
          phoneNumber,
          description: description || undefined,
        });
        toast.success("Account created!");
        navigate("/manage-jobs");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Job seeker step 2 — CV onboarding
  if (cvStep && user && user.role === "JOB_SEEKER") {
    return (
      <div className="min-h-[80vh] bg-muted/20 py-8">
        <ScrollReveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center px-4">
            <div className="mb-6 flex items-center gap-3">
              <img src={logo} alt="TrustBee" className="h-10 w-10 rounded-xl" />
              <span className="text-lg font-bold">TrustBee</span>
            </div>
          </div>
          <CvOnboardingStep
            userId={user.id}
            firstName={user.firstName ?? firstName}
            lastName={user.lastName ?? lastName}
            email={user.email ?? email}
            phone={user.phoneNumber ?? jobSeekerPhone}
          />
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <div className="glass w-full max-w-lg rounded-2xl p-8">
          <div className="mb-6 text-center">
            <img
              src={logo}
              alt="TrustBee"
              className="mx-auto mb-4 h-14 w-14 rounded-xl"
            />
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join TrustBee and start your journey
            </p>
          </div>
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
                <div className="space-y-2">
                  <Label htmlFor="jobSeekerPhone">Phone number</Label>
                  <Input
                    id="jobSeekerPhone"
                    type="tel"
                    placeholder="+46 70 123 4567"
                    value={jobSeekerPhone}
                    onChange={(e) => setJobSeekerPhone(e.target.value)}
                  />
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
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password * (min 8 characters)</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>

            {role === "JOB_SEEKER" && (
              <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
                After creating your account you'll have the option to generate your CV with AI — no extra pages needed.
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
            >
              {loading ? "Creating…" : role === "JOB_SEEKER" ? "Create account & continue" : "Create account"}
            </Button>
          </form>
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
