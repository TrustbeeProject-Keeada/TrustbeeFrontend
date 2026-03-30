/**
 * Client-side CV ↔ Job matchmaking engine.
 * Extracts keywords from CV text and scores against job listings.
 * Also provides human-readable explanations for match scores.
 */

import type { Job, User } from "./api";

// Common stop words to ignore
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","it","as","was","are","be","has","had","have","not","this","that",
  "i","my","me","we","our","you","your","he","she","they","their","its","will",
  "can","do","did","would","could","should","may","about","also","into","over",
  "such","than","very","just","been","being","other","which","through","after",
  "during","before","between","under","above","each","all","both","few","more",
  "some","any","most","no","nor","so","up","out","if","then","else","when","there",
  "where","how","what","who","whom","why","per","etc","vs","via",
]);

/** Extract meaningful keywords from text */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Count keyword frequency */
function keywordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return freq;
}

export interface MatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  locationMatch: boolean;
  educationMatch: boolean;
  explanation: string;
}

/** Calculate match score (0–100) with detailed explanation */
export function matchScoreDetailed(user: User, job: Job): MatchResult {
  const userText = [
    user.cvText || "",
    user.experience || "",
    user.education || "",
    user.city || "",
    user.country || "",
  ].join(" ");

  if (!userText.trim()) {
    return { score: 0, matchedKeywords: [], missingKeywords: [], locationMatch: false, educationMatch: false, explanation: "Upload your CV or fill in your profile to see match analysis." };
  }

  const jobText = [job.title, job.description, job.requirements, job.type, job.education, job.location].join(" ");

  const userKeywords = new Set(extractKeywords(userText));
  const jobKeywords = extractKeywords(jobText);
  const jobFreq = keywordFrequency(jobKeywords);

  if (jobFreq.size === 0) {
    return { score: 0, matchedKeywords: [], missingKeywords: [], locationMatch: false, educationMatch: false, explanation: "This job has no description to match against." };
  }

  let matched = 0;
  let total = 0;
  const matchedKeywords = new Set<string>();
  const missingKeywords = new Set<string>();

  for (const [word, count] of jobFreq) {
    total += count;
    if (userKeywords.has(word)) {
      matched += count;
      matchedKeywords.add(word);
    } else {
      missingKeywords.add(word);
    }
  }

  const locationMatch = !!(user.city && job.city && user.city.toLowerCase() === job.city.toLowerCase());
  const countryMatch = !!(user.country && job.country && user.country.toLowerCase() === job.country.toLowerCase());
  const educationMatch = !!(user.education && job.education && user.education.toLowerCase().includes(job.education.toLowerCase()));

  let bonus = 0;
  if (locationMatch) bonus += 10;
  if (countryMatch) bonus += 5;

  const raw = (matched / total) * 85 + bonus;
  const score = Math.min(100, Math.round(raw));

  // Build explanation
  const reasons: string[] = [];

  const topMatched = [...matchedKeywords].slice(0, 8);
  const topMissing = [...missingKeywords].filter(w => w.length > 2).slice(0, 5);

  if (topMatched.length > 0) {
    reasons.push(`Your profile matches key skills: ${topMatched.join(", ")}.`);
  }
  if (locationMatch) {
    reasons.push(`You're in the same city (${job.city}) — great for this role.`);
  } else if (countryMatch) {
    reasons.push(`You're in the same country (${job.country}), but a different city.`);
  } else if (job.city) {
    reasons.push(`This role is in ${job.location} — consider if relocation works for you.`);
  }
  if (educationMatch) {
    reasons.push(`Your education level matches the requirement (${job.education}).`);
  }
  if (topMissing.length > 0) {
    reasons.push(`Consider highlighting: ${topMissing.join(", ")}.`);
  }
  if (score >= 70) {
    reasons.unshift("Strong match! You're a great fit for this position.");
  } else if (score >= 40) {
    reasons.unshift("Moderate match — you meet several of the requirements.");
  } else if (score > 0) {
    reasons.unshift("Low match — this role may require skills outside your current profile.");
  }

  return {
    score,
    matchedKeywords: topMatched,
    missingKeywords: topMissing,
    locationMatch,
    educationMatch,
    explanation: reasons.join(" "),
  };
}

/** Simple score-only helper */
export function matchScore(user: User, job: Job): number {
  return matchScoreDetailed(user, job).score;
}

/** Sort jobs by match score descending, return with scores */
export function rankJobs(user: User | null, jobs: Job[]): Array<{ job: Job; score: number }> {
  if (!user) return jobs.map((job) => ({ job, score: 0 }));

  return jobs
    .map((job) => ({ job, score: matchScore(user, job) }))
    .sort((a, b) => b.score - a.score);
}
