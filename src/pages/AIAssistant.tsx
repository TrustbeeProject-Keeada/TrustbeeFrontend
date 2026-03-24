import { useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";

const suggestions = [
  "Help me improve my resume",
  "What jobs match my profile?",
  "Tips for a frontend interview",
  "How to write a cover letter",
];

type Msg = { role: "user" | "assistant"; content: string };

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your TrustBee AI assistant. I can help with resume tips, job matching, and interview prep. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "Thanks for your question! This is a placeholder response. Once connected to Lovable Cloud, I'll provide real AI-powered career advice." },
    ]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ScrollReveal>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your personal career advisor</p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-6 flex h-[60vh] flex-col rounded-xl border border-border glass">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border p-3 flex gap-2">
            <Input
              placeholder="Ask me anything about your career…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-transform shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
