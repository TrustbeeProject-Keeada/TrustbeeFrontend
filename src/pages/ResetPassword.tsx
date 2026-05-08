import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Mail, AlertCircle } from "lucide-react";

export default function ResetPassword() {
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
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>
              Contact our support team for password assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">
                  Password reset feature coming soon
                </p>
                <p>
                  For immediate assistance, please contact our support team.
                </p>
              </div>
            </div>
            <Link to="/support">
              <Button className="w-full gap-2" variant="default">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
            <Link to="/login">
              <Button className="w-full" variant="outline">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
