/**
 * Client-side CV ↔ Job matchmaking engine.
 * Extracts keywords from CV text and scores against job listings.
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

/** Calculate match score (0–100) between a user's CV and a job */
export function matchScore(user: User, job: Job): number {
  // Combine all user text: experience, education, CV text, skills
  const userText = [
    user.cvText || "",
    user.experience || "",
    user.education || "",
    user.city || "",
    user.country || "",
  ].join(" ");

  if (!userText.trim()) return 0;

  // Combine all job text
  const jobText = [
    job.title,
    job.description,
    job.requirements,
    job.type,
    job.education,
    job.location,
  ].join(" ");

  const userKeywords = new Set(extractKeywords(userText));
  const jobKeywords = extractKeywords(jobText);
  const jobFreq = keywordFrequency(jobKeywords);

  if (jobFreq.size === 0) return 0;

  // Score = what fraction of unique job keywords appear in user's CV
  let matched = 0;
  let total = 0;
  for (const [word, count] of jobFreq) {
    total += count;
    if (userKeywords.has(word)) {
      matched += count;
    }
  }

  // Bonus for location match
  let bonus = 0;
  if (user.city && job.city && user.city.toLowerCase() === job.city.toLowerCase()) bonus += 10;
  if (user.country && job.country && user.country.toLowerCase() === job.country.toLowerCase()) bonus += 5;

  const raw = (matched / total) * 85 + bonus;
  return Math.min(100, Math.round(raw));
}

/** Sort jobs by match score descending, return with scores */
export function rankJobs(user: User | null, jobs: Job[]): Array<{ job: Job; score: number }> {
  if (!user) return jobs.map((job) => ({ job, score: 0 }));

  return jobs
    .map((job) => ({ job, score: matchScore(user, job) }))
    .sort((a, b) => b.score - a.score);
}
