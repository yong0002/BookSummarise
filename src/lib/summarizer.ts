const sentenceSplitter = /(?<=[.!?])\s+/;
const bulletStopWords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "that",
  "this",
  "as",
  "at",
  "by",
  "from",
]);

export type SummaryMode = "quick" | "study" | "actionable";

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string) {
  return normalizeWhitespace(text)
    .split(sentenceSplitter)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function scoreSentence(sentence: string) {
  const words = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
  const meaningfulWords = words.filter((word) => !bulletStopWords.has(word));
  const uniqueWordScore = new Set(meaningfulWords).size;
  const lengthScore = Math.min(sentence.length / 120, 1.5);
  return uniqueWordScore + lengthScore;
}

function topSentences(text: string, count: number) {
  return splitSentences(text)
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .sort((left, right) => left.index - right.index)
    .map((item) => item.sentence);
}

function keywordHighlights(text: string, limit: number) {
  const words = normalizeWhitespace(text)
    .toLowerCase()
    .match(/[a-z']{4,}/g) ?? [];

  const counts = new Map<string, number>();
  for (const word of words) {
    if (bulletStopWords.has(word)) {
      continue;
    }
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function buildFallbackSummary(params: {
  title?: string;
  text: string;
  mode: SummaryMode;
}) {
  const { title, text, mode } = params;
  const cleanedText = normalizeWhitespace(text);
  const overviewSentences = topSentences(cleanedText, mode === "quick" ? 2 : 3);
  const keywordList = keywordHighlights(cleanedText, 5);
  const sentences = splitSentences(cleanedText);
  const opening = title ? `Summary for ${title}` : "Summary";

  const sections = [opening, "", "Overview:"];
  for (const sentence of overviewSentences) {
    sections.push(`- ${sentence}`);
  }

  sections.push("", "Key themes:");
  for (const keyword of keywordList) {
    sections.push(`- ${keyword}`);
  }

  if (mode !== "quick") {
    sections.push("", mode === "study" ? "Study notes:" : "Actionable takeaways:");
    const takeaways = sentences.slice(0, Math.min(mode === "study" ? 3 : 4, sentences.length));
    for (const takeaway of takeaways) {
      sections.push(`- ${takeaway}`);
    }
  }

  sections.push(
    "",
    "Note: This summary was generated locally because no AI API key was configured. For higher quality results, add OPENAI_API_KEY to your environment."
  );

  return sections.join("\n");
}
