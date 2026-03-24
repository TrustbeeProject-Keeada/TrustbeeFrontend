import { Link } from "react-router-dom";
import logo from "@/assets/trustbee-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="TrustBee" className="h-8 w-8 rounded-lg" />
              <span className="font-bold">Trust<span className="text-accent">Bee</span></span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground" style={{ maxWidth: "28ch" }}>
              Connecting talent with opportunity. Your trusted job platform.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              For Job Seekers
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="text-foreground/70 hover:text-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link to="/ai-assistant" className="text-foreground/70 hover:text-foreground transition-colors">AI Assistant</Link></li>
              <li><Link to="/saved" className="text-foreground/70 hover:text-foreground transition-colors">Saved Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              For Employers
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/create-job" className="text-foreground/70 hover:text-foreground transition-colors">Post a Job</Link></li>
              <li><Link to="/dashboard" className="text-foreground/70 hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="text-foreground/70 hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/support" className="text-foreground/70 hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TrustBee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
