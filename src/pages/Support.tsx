import { useState } from "react";
import { Mail, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";

const faqs = [
  { q: "How do I create an account?", a: "Click 'Sign up' in the top navigation, fill in your details, and verify your email to get started." },
  { q: "Is TrustBee free to use?", a: "Yes! Job seekers can create profiles, search for jobs, and apply for free. Employers can post job listings with flexible pricing plans." },
  { q: "How do I upload my resume?", a: "Go to your Profile page, scroll to the Resume section, and upload a PDF file. Employers will be able to view it." },
  { q: "Can I message employers directly?", a: "Yes, once you've applied or an employer has viewed your profile, you can start a conversation through the Messages page." },
  { q: "How does the AI assistant work?", a: "Our AI assistant helps you optimize your resume, suggests matching jobs, and provides interview preparation tips based on your profile and target roles." },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="mt-1 text-muted-foreground">Get in touch or find answers to common questions.</p>
      </ScrollReveal>

      {/* Contact form */}
      <ScrollReveal delay={80}>
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
              </div>
              <div className="space-y-2"><Label>Subject</Label><Input placeholder="How can we help?" /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Describe your issue or question…" rows={4} /></div>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform gap-2">
                <MessageCircle className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal delay={140}>
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
