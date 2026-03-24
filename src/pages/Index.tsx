import { Link } from "react-router-dom";
import { Search, FileText, MessageSquare, Sparkles, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import logo from "@/assets/trustbee-logo.png";

const features = [
  { icon: Search, title: "Smart Job Search", desc: "Filter by industry, location, education, and more to find your perfect role." },
  { icon: Sparkles, title: "AI Career Assistant", desc: "Get personalized resume tips, job matching, and interview preparation." },
  { icon: FileText, title: "Resume Management", desc: "Upload and showcase your CV directly to employers." },
  { icon: MessageSquare, title: "Direct Messaging", desc: "Chat in real-time with employers and recruiters." },
  { icon: Shield, title: "Verified Profiles", desc: "Trust-based connections with verified employer and seeker accounts." },
  { icon: Users, title: "For Everyone", desc: "Whether you're hiring or seeking, TrustBee works for both sides." },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Sign up and fill in your experience, education, and upload your CV." },
  { num: "02", title: "Discover Opportunities", desc: "Search jobs or post positions. Let our AI help match the perfect fit." },
  { num: "03", title: "Connect & Succeed", desc: "Message directly, apply with one click, and land your next role." },
];

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <img src={logo} alt="TrustBee" className="mx-auto mb-8 h-32 w-32 rounded-2xl shadow-lg shadow-primary/20" />
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.08 }}>
              Find talent you trust.
              <br />
              <span className="text-accent">Find work you love.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground" style={{ textWrap: "pretty" }}>
              TrustBee connects job seekers and employers through verified profiles, AI-powered matching, and real-time messaging.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="active:scale-[0.97] transition-transform">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ textWrap: "balance" }}>
                Everything you need to succeed
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                From searching to hiring, TrustBee covers the full journey.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="glass group rounded-xl p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 px-4 py-28">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ textWrap: "balance" }}>
                How TrustBee works
              </h2>
            </div>
          </ScrollReveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 100}>
                <div className="text-center">
                  <span className="text-4xl font-black text-accent/30">{s.num}</span>
                  <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-10 text-center text-primary-foreground sm:p-14">
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ textWrap: "balance" }}>
              Ready to find your next opportunity?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
              Join thousands of job seekers and employers who trust TrustBee.
            </p>
            <Link to="/register">
              <Button size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
