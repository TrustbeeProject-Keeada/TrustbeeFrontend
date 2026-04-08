import { useState } from "react";
import { Mail, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { api } from "@/lib/api";
import { toast } from "sonner";

const faqs = [
  { q: "How do I create an account?", a: "Click 'Sign up' in the top navigation, fill in your details, and verify your email to get started." },
  { q: "Is TrustBee free to use?", a: "Yes! Job seekers can create profiles, search for jobs, and apply for free. Employers can post job listings with flexible pricing plans." },
  { q: "How do I upload my resume?", a: "Go to your Profile page, scroll to the Resume section, and upload a PDF file. Employers will be able to view it." },
  { q: "Can I message employers directly?", a: "Yes, once you've applied or an employer has viewed your profile, you can start a conversation through the Messages page." },
  { q: "How does the AI assistant work?", a: "Our AI assistant helps you optimize your resume, suggests matching jobs, and provides interview preparation tips based on your profile and target roles." },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstname || !lastname || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      await api.submitSupport({ firstname, lastname, email, message });
      toast.success("Support ticket submitted! We'll get back to you soon.");
      setFirstname("");
      setLastname("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="mt-1 text-muted-foreground">Get in touch or find answers to common questions.</p>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First name *</Label>
                  <Input placeholder="Jane" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last name *</Label>
                  <Input placeholder="Doe" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea placeholder="Describe your issue or question…" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button type="submit" disabled={sending} className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform gap-2">
                <MessageCircle className="h-4 w-4" /> {sending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>

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
