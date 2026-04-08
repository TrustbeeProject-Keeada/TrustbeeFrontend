import { useState, useEffect } from "react";
import { Send, Search, MessageSquare, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Message as ApiMessage } from "@/lib/api";

interface ConversationSummary {
  otherId: number;
  otherRole: "JOB_SEEKER" | "COMPANY_RECRUITER";
  otherName: string;
  lastMsg: string;
  time: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [selected, setSelected] = useState<ConversationSummary | null>(null);
  const [input, setInput] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  // New conversation state
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [receiverRole, setReceiverRole] = useState<"JOB_SEEKER" | "COMPANY_RECRUITER">("JOB_SEEKER");
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  // Load received messages on mount
  useEffect(() => {
    if (!user) return;
    setLoadingConvos(true);
    api.getReceivedMessages()
      .then((msgs) => {
        // Group messages into conversations by sender
        const convMap = new Map<string, ConversationSummary>();
        msgs.forEach((m) => {
          const otherId = m.senderJobSeekerId && m.senderJobSeekerId !== user.id
            ? m.senderJobSeekerId
            : m.senderRecruiterId && m.senderRecruiterId !== user.id
            ? m.senderRecruiterId
            : null;
          if (!otherId) return;
          const otherRole = m.senderJobSeekerId === otherId ? "JOB_SEEKER" : "COMPANY_RECRUITER";
          const key = `${otherId}-${otherRole}`;
          if (!convMap.has(key)) {
            convMap.set(key, {
              otherId,
              otherRole,
              otherName: `User #${otherId}`,
              lastMsg: m.content,
              time: new Date(m.createdAt).toLocaleString(),
            });
          }
        });
        setConversations(Array.from(convMap.values()));
      })
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, [user]);

  const handleSelectConversation = async (convo: ConversationSummary) => {
    setSelected(convo);
    setLoadingMsgs(true);
    try {
      const msgs = await api.getConversation(convo.otherId, convo.otherRole);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selected || !user) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(input, selected.otherId, selected.otherRole);
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.otherId === selected.otherId && c.otherRole === selected.otherRole
            ? { ...c, lastMsg: input, time: "Just now" }
            : c
        )
      );
      setInput("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!receiverId.trim()) {
      toast({ title: "Missing info", description: "Please enter a receiver ID.", variant: "destructive" });
      return;
    }
    if (!newMessage.trim()) {
      toast({ title: "Missing info", description: "Please enter a message.", variant: "destructive" });
      return;
    }

    try {
      const msg = await api.sendMessage(newMessage, Number(receiverId), receiverRole);
      const newConvo: ConversationSummary = {
        otherId: Number(receiverId),
        otherRole: receiverRole,
        otherName: `User #${receiverId}`,
        lastMsg: newMessage,
        time: "Just now",
      };
      setConversations((prev) => [newConvo, ...prev]);
      setSelected(newConvo);
      setMessages([msg]);
      setReceiverId("");
      setNewMessage("");
      setNewConvoOpen(false);
      toast({ title: "Conversation created", description: `Started conversation with User #${receiverId}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create conversation", variant: "destructive" });
    }
  };

  const isMine = (m: ApiMessage) => {
    if (!user) return false;
    if (user.role === "JOB_SEEKER") return m.senderJobSeekerId === user.id;
    return m.senderRecruiterId === user.id;
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
            <div className="p-3 border-b border-border flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-8 h-9 text-sm" />
              </div>
              <Dialog open={newConvoOpen} onOpenChange={setNewConvoOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                      <Label>Receiver ID *</Label>
                      <Input
                        type="number"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Receiver Role *</Label>
                      <Select value={receiverRole} onValueChange={(v) => setReceiverRole(v as "JOB_SEEKER" | "COMPANY_RECRUITER")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JOB_SEEKER">Job Seeker</SelectItem>
                          <SelectItem value="COMPANY_RECRUITER">Company Recruiter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Message *</Label>
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Hi, I'd like to discuss..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleCreateConversation} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Start Conversation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click + to start a conversation</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={`${c.otherId}-${c.otherRole}`}
                    onClick={() => handleSelectConversation(c)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/50 ${
                      selected?.otherId === c.otherId && selected?.otherRole === c.otherRole ? "bg-muted/70" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.otherName}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.lastMsg}</p>
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
                  <h3 className="font-semibold text-sm">{selected.otherName}</h3>
                  <p className="text-xs text-muted-foreground">{selected.otherRole === "JOB_SEEKER" ? "Job Seeker" : "Company Recruiter"}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine(m)
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p>{m.content}</p>
                          <span className={`mt-1 block text-[10px] ${isMine(m) ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(m.createdAt).toLocaleString()}
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
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={sending}
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
