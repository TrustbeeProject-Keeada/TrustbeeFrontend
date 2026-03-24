import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function ResetPassword() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <ScrollReveal>
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll send you a link to reset your password</p>
          <form className="mt-6 space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <Button type="submit" className="w-full active:scale-[0.97] transition-transform">
              Send reset link
            </Button>
          </form>
          <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:underline">
            Back to login
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
