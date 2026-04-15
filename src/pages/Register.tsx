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
        await registerJobSeeker({ firstName, lastName, email, password });
        toast.success("Account created!");
        navigate("/dashboard");
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
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
