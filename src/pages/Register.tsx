import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/trustbee-logo.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !country) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await register({ firstName, lastName, email, phone, country, city, role, password });
      toast.success("Account created!");
      navigate(role === "employer" ? "/manage-jobs" : "/dashboard");
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
            <img src={logo} alt="TrustBee" className="mx-auto mb-4 h-14 w-14 rounded-xl" />
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join TrustBee and start your journey</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Müller" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="+46 70 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sweden">Sweden</SelectItem>
                    <SelectItem value="Norway">Norway</SelectItem>
                    <SelectItem value="Denmark">Denmark</SelectItem>
                    <SelectItem value="Finland">Finland</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Stockholm" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer / Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role === "employer" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" placeholder="Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgNumber">Org number</Label>
                  <Input id="orgNumber" placeholder="556677-8899" value={orgNumber} onChange={(e) => setOrgNumber(e.target.value)} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
