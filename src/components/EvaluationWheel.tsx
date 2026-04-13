import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ParsedResult {
  score?: number; // 0-100
  explanation?: string;
}

function parseMatchmakeResponse(res: unknown): ParsedResult {
  // Try flexible parsing for multiple possible response shapes
  try {
    if (res == null) return {};
    // If array, try to inspect first element
    if (Array.isArray(res) && res.length > 0) {
      const item = res[0];
      if (typeof item === "number") return { score: Math.round(item) };
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const scoreKeys = [
          "score",
          "percent",
          "percentage",
          "match",
          "confidence",
        ];
        const explainKeys = [
          "explanation",
          "reason",
          "details",
          "why",
          "description",
        ];
        const scoreVal = scoreKeys
          .map((k) => obj[k])
          .find((v) => typeof v === "number" || typeof v === "string");
        const explanationVal = explainKeys
          .map((k) => obj[k])
          .find((v) => typeof v === "string");
        return {
          score:
            typeof scoreVal === "string"
              ? Number(scoreVal)
              : typeof scoreVal === "number"
                ? Math.round(scoreVal)
                : undefined,
          explanation:
            typeof explanationVal === "string" ? explanationVal : undefined,
        };
      }
    }

    // If object
    if (typeof res === "object" && res !== null) {
      const obj = res as Record<string, unknown>;
      // some APIs wrap with { data: { score:.., explanation:.. } }
      const candidate = (obj["data"] as Record<string, unknown>) ?? obj;
      const scoreKeys = [
        "score",
        "percent",
        "percentage",
        "match",
        "confidence",
      ];
      const explainKeys = [
        "explanation",
        "reason",
        "details",
        "why",
        "description",
      ];
      const scoreVal = scoreKeys
        .map((k) => (candidate as Record<string, unknown>)[k])
        .find((v) => typeof v === "number" || typeof v === "string");
      const explanationVal = explainKeys
        .map((k) => (candidate as Record<string, unknown>)[k])
        .find((v) => typeof v === "string");
      return {
        score:
          typeof scoreVal === "string"
            ? Number(scoreVal)
            : typeof scoreVal === "number"
              ? Math.round(scoreVal)
              : undefined,
        explanation:
          typeof explanationVal === "string" ? explanationVal : undefined,
      };
    }

    // If number
    if (typeof res === "number") return { score: Math.round(res) };
  } catch (e) {
    // ignore
  }
  // Fallback: stringify
  return { explanation: JSON.stringify(res) };
}

export default function EvaluationWheel({ jobId }: { jobId: number | string }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);

  // Helper: try to extract user id from JWT fallback if AuthContext is not populated
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("trustbee_token");
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      // Common fields: id, sub, userId
      if (typeof payload.id === "number") return payload.id;
      if (typeof payload.userId === "number") return payload.userId;
      if (typeof payload.sub === "number") return payload.sub;
      // sometimes id is string
      if (typeof payload.id === "string" && !Number.isNaN(Number(payload.id)))
        return Number(payload.id);
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Fetch matchmake result on mount (when job is shown). This ensures the evaluation is
  // generated automatically when the job is viewed/posted rather than on user click.
  useEffect(() => {
    let mounted = true;
    const fetchOnce = async () => {
      if (!jobId) return;

      // Prefer AuthContext user id, fallback to token parsing
      const userId = user?.id ?? getUserIdFromToken();
      if (!userId) {
        // Do not call if we can't determine a user id
        return;
      }

      setLoading(true);
      try {
        const res = await api.matchmake(Number(jobId), Number(userId));
        if (!mounted) return;
        const parsed = parseMatchmakeResponse(res);
        if (parsed.score !== undefined && !Number.isNaN(parsed.score)) {
          const clamped = Math.max(0, Math.min(100, Math.round(parsed.score)));
          setScore(clamped);
        }
        if (parsed.explanation) setExplanation(parsed.explanation);
        if (parsed.score === undefined && !parsed.explanation) {
          setExplanation(JSON.stringify(res));
        }
      } catch (err) {
        // don't spam users on mount — show a toast for visibility
        const errorMessage =
          err instanceof Error ? err.message : "Evaluation failed";
        toast.error(errorMessage);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOnce();
    return () => {
      mounted = false;
    };
  }, [jobId, user]);

  const handleClick = () => {
    // Toggle explanation panel only. The evaluation is fetched on mount.
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user && user.role !== "JOB_SEEKER") {
      toast.error("Only job seekers can view evaluations");
      return;
    }
    setOpen((s) => !s);
  };

  const displayScore = score !== null ? score : 0;
  const circumference = 2 * Math.PI * 20; // radius 20
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-transparent hover:scale-[1.02] active:scale-[0.98] transition-transform"
        aria-label="Evaluate fit"
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <defs />
          <g transform="translate(4,4)">
            <circle cx="20" cy="20" r="20" fill="#0f172a" opacity="0.06" />
            <circle
              cx="20"
              cy="20"
              r="20"
              strokeWidth="4"
              stroke="#e6eaf0"
              fill="none"
              className=""
            />
            <circle
              cx="20"
              cy="20"
              r="20"
              strokeWidth="4"
              stroke="#10b981"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 800ms ease" }}
              transform="rotate(-90 20 20)"
            />
            <text
              x="20"
              y="24"
              textAnchor="middle"
              fontSize="10"
              fill="#0f172a"
              className="font-semibold"
            >
              {loading ? "…" : `${displayScore}%`}
            </text>
          </g>
        </svg>
      </button>

      {/* Explanation panel */}
      {open && (
        <div className="max-w-xl rounded-md border bg-white p-3 text-sm shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Evaluation</div>
              <div className="font-semibold text-sm">
                {score !== null ? `${score}% fit` : "Result"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
            {explanation ? explanation : "No explanation provided by the AI."}
          </div>
        </div>
      )}
    </div>
  );
}
