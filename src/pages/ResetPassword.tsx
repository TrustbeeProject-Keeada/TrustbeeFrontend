import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If token + email + role are in the URL, show the "set new password" form.
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const role = searchParams.get("role") || "JOB_SEEKER";

  const isResetStep = Boolean(token && email);

  // Step 1: request email
  const [requestEmail, setRequestEmail] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  // Step 2: set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail.trim()) return;
    setRequesting(true);
    try {
      await api.forgotPassword(requestEmail.trim());
      setRequested(true);
    } catch (err) {
      // Show a generic message regardless — don't leak whether the email exists
      if (err instanceof ApiError && err.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else {
        // Treat as success to avoid email enumeration
        setRequested(true);
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!token || !email) return;

    setResetting(true);
    try {
      await api.resetPassword({ token, email, role, newPassword });
      toast.success("Password reset successfully. You can now log in.");
      navigate("/login");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Invalid or expired reset link. Please request a new one.";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  // ── Step 2: set new password ───────────────────
  if (isResetStep) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <ScrollReveal>
          <Card className="glass w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl">Set new password</CardTitle>
              <CardDescription>
                Choose a strong password for{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={resetting}
                >
                  {resetting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {resetting ? "Resetting…" : "Reset password"}
                </Button>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </form>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    );
  }

  // ── Step 1: request reset email ───────────────
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <Card className="glass w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                <Mail className="h-5 w-5 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requested ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-green-500/10 p-4 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    If <span className="font-medium text-foreground">{requestEmail}</span> is
                    registered, a reset link has been sent. Check your inbox
                    (and spam folder).
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={requesting}
                >
                  {requesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {requesting ? "Sending…" : "Send reset link"}
                </Button>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
