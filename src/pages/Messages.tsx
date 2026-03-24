import { useState } from "react";
import { Send, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";

// TODO: Replace with API calls to your backend
// Example: const { data: conversations } = await fetch('/api/conversations');
// Example: const { data: messages } = await fetch(`/api/conversations/${id}/messages`);

interface Conversation {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: boolean;
}

interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

export default function Messages() {
  // TODO: Fetch from backend
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !selected) return;
    // TODO: POST to backend: await fetch(`/api/conversations/${selected}/messages`, { method: 'POST', body: JSON.stringify({ text: input }) });
    const newMsg: Message = { from: "me", text: input, time: "Just now" };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const handleSelectConversation = (id: string) => {
    setSelected(id);
    // TODO: Fetch messages for this conversation from backend
    // Example: const res = await fetch(`/api/conversations/${id}/messages`);
    // setMessages(res.data);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ScrollReveal>
        <h1 className="text-3xl font-bold">Messages</h1>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-6 flex h-[65vh] overflow-hidden rounded-xl border border-border glass">
          {/* Sidebar */}
          <div className="w-72 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-8 h-9 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Messages will appear here when you start a conversation</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/50 ${selected === c.id ? "bg-muted/70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                    {c.unread && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accent" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-1 flex-col">
            {selected ? (
              <>
                <div className="border-b border-border px-4 py-3">
                  <h3 className="font-semibold text-sm">{conversations.find((c) => c.id === selected)?.name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            m.from === "me"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className={`mt-1 block text-[10px] ${m.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {m.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border p-3 flex gap-2">
                  <Input
                    placeholder="Type a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95 transition-transform shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
